import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(__dirname, "../../spells.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS my_spells (
    spell_index TEXT PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS spell_classes (
    spell_index TEXT NOT NULL,
    class_name TEXT NOT NULL,
    PRIMARY KEY (spell_index, class_name)
  );
`);

export default db;
