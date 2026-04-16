import fs from "fs";
import path from "path";
import initSqlJs from "sql.js";
import type { Database } from "sql.js";

const DB_PATH = path.resolve(process.cwd(), "data", "history.db");

let _db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (_db) return _db;

  const SQL = await initSqlJs();
  const dataDir = path.dirname(DB_PATH);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    _db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    _db = new SQL.Database();
  }

  _db.run(`
    CREATE TABLE IF NOT EXISTS history (
      id          TEXT PRIMARY KEY,
      original_name TEXT NOT NULL,
      saved_as    TEXT NOT NULL DEFAULT '',
      mime_type   TEXT NOT NULL,
      size        INTEGER NOT NULL,
      document_type TEXT,
      language    TEXT,
      fields      TEXT NOT NULL,
      extracted_at TEXT NOT NULL
    )
  `);

  // Migration: add saved_as column to tables created before this column existed
  try {
    _db.run("ALTER TABLE history ADD COLUMN saved_as TEXT NOT NULL DEFAULT ''");
  } catch {
    // Column already exists — safe to ignore
  }

  persistDb(_db);
  return _db;
}

export function persistDb(db: Database): void {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}
