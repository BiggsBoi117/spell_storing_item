import { Router, Request, Response } from "express";
import db from "./db";

const router = Router();

// Get all of the spells in the spellbook
router.get("/mySpells", (req: Request, res: Response) => {
  const rows = db.prepare(`SELECT * FROM my_spells`).all();
  return res.json(rows);
});

// Save a spell to the spellbook
router.post("/mySpells", (req: Request, res: Response) => {
  const { spell_index, name, classes, subclasses } = req.body;

  db.prepare(
    `
    INSERT OR IGNORE INTO my_spells (spell_index, name) VALUES (?, ?)
  `,
  ).run(spell_index, name);

  res.json({ success: true });
});

// Remove a spell from the spellbook only
router.delete("/mySpells/:spell_index", (req: Request, res: Response) => {
  const { spell_index } = req.params;
  db.prepare(`DELETE FROM my_spells WHERE spell_index = ?`).run(spell_index);
  res.json({ success: true });
});

// ----- filtering methods -----

// Get all unique classes from the cache
router.get("/classes", (req: Request, res: Response) => {
  const rows = db
    .prepare(
      `SELECT DISTINCT class_name FROM spell_classes ORDER BY class_name`,
    )
    .all();
  res.json(rows);
});

// Get spell indexes filtered by class
router.get("/filter", (req: Request, res: Response) => {
  const { class: className } = req.query;

  if (typeof className !== "string") {
    return res.json([]);
  }

  if (className === "all") {
    const rows = db
      .prepare(`SELECT DISTINCT spell_index FROM spell_classes`)
      .all();
    return res.json(rows);
  }

  const rows = db
    .prepare(
      `SELECT DISTINCT spell_index FROM spell_classes WHERE class_name = ?`,
    )
    .all(className);
  res.json(rows);
});

// ----- syncing methods -----

// Sync a single spell's class data
router.post("/sync/spell", async (req: Request, res: Response) => {
  const { spell_index, classes } = req.body;

  for (const c of classes ?? []) {
    db.prepare(`INSERT OR IGNORE INTO spell_classes VALUES (?, ?)`).run(
      spell_index,
      c,
    );
  }

  res.json({ success: true });
});

// Sync all spells from the D&D API
router.get("/sync/all", async (req: Request, res: Response) => {
  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const response = await fetch("https://www.dnd5eapi.co/api/2014/spells");
    const { results } = await response.json();
    const total = results.length;

    for (let i = 0; i < total; i++) {
      const spell = results[i];
      const detail = await fetch(`https://www.dnd5eapi.co${spell.url}`);
      const data = await detail.json();

      for (const c of data.classes ?? []) {
        db.prepare(`INSERT OR IGNORE INTO spell_classes VALUES (?, ?)`).run(
          data.index,
          c.index,
        );
      }
    }

    send({ done: true });
  } catch (error) {
    send({ error: "Sync failed" });
  } finally {
    res.end();
  }
});

// Search for a spell by name
router.get("/spells/search", (req: Request, res: Response) => {
  const { name } = req.query;
  if (!name) return res.json([]);
  const rows = db
    .prepare(
      `
    SELECT spell_index, name FROM my_spells
    WHERE LOWER(name) LIKE LOWER(?)
  `,
    )
    .all(`%${name}%`);
  res.json(rows);
});

export default router;
