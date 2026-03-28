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

// Get all unique subclasses from the cache
router.get("/subclasses", (req: Request, res: Response) => {
  const rows = db
    .prepare(
      `SELECT DISTINCT subclass_name FROM spell_subclasses ORDER BY subclass_name`,
    )
    .all();
  res.json(rows);
});

// Get spell indexes filtered by class and/or subclass
router.get("/filter", (req: Request, res: Response) => {
  const { class: className, subclass } = req.query;

  if (className && subclass) {
    const rows = db
      .prepare(
        `
      SELECT DISTINCT sc.spell_index FROM spell_classes sc
      JOIN spell_subclasses ss ON sc.spell_index = ss.spell_index
      WHERE sc.class_name = ? AND ss.subclass_name = ?
    `,
      )
      .all(className as string, subclass as string);
    return res.json(rows);
  }

  if (className) {
    const rows = db
      .prepare(
        `SELECT DISTINCT spell_index FROM spell_classes WHERE class_name = ?`,
      )
      .all(className as string);
    return res.json(rows);
  }

  if (subclass) {
    const rows = db
      .prepare(
        `SELECT DISTINCT spell_index FROM spell_subclasses WHERE subclass_name = ?`,
      )
      .all(subclass as string);
    return res.json(rows);
  }

  res.json([]);
});

// ----- syncing methods -----

// Sync a single spell's class/subclass data
router.post("/sync/spell", async (req: Request, res: Response) => {
  const { spell_index, classes, subclasses } = req.body;

  for (const c of classes ?? []) {
    db.prepare(`INSERT OR IGNORE INTO spell_classes VALUES (?, ?)`).run(
      spell_index,
      c,
    );
  }

  for (const s of subclasses ?? []) {
    db.prepare(`INSERT OR IGNORE INTO spell_subclasses VALUES (?, ?)`).run(
      spell_index,
      s,
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

      for (const s of data.subclasses ?? []) {
        db.prepare(`INSERT OR IGNORE INTO spell_subclasses VALUES (?, ?)`).run(
          data.index,
          s.index,
        );
      }

      send({ current: i + 1, total, name: data.name });
    }

    send({ done: true });
  } catch (error) {
    send({ error: "Sync failed" });
  } finally {
    res.end();
  }
});

export default router;
