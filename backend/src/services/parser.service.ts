import crypto from "crypto";
import { getDb, persistDb } from "../db/database";

export interface ParserFieldDef {
  field: string;
  description: string;
}

export interface ParserRecord {
  id: string;
  name: string;
  description: string;
  documentType: string;
  fields: ParserFieldDef[];
  createdAt: string;
}

type NewParser = Omit<ParserRecord, "id" | "createdAt">;

function parseFieldDefs(json: string): ParserFieldDef[] {
  try {
    const raw = JSON.parse(json) as unknown;
    if (!Array.isArray(raw)) return [];
    return raw
      .filter(
        (row): row is ParserFieldDef =>
          row !== null &&
          typeof row === "object" &&
          typeof (row as ParserFieldDef).field === "string" &&
          typeof (row as ParserFieldDef).description === "string"
      )
      .map((row) => ({
        field: row.field,
        description: row.description,
      }));
  } catch {
    return [];
  }
}

export async function listParsers(): Promise<ParserRecord[]> {
  const db = await getDb();
  const result = db.exec(
    `SELECT id, name, description, document_type, field_defs, created_at
       FROM parsers
      ORDER BY created_at DESC`
  );

  if (!result.length || !result[0].values.length) return [];

  const { columns, values } = result[0];
  return values.map((row) => {
    const o = Object.fromEntries(columns.map((col, i) => [col, row[i]]));
    return {
      id: String(o.id),
      name: String(o.name),
      description: String(o.description ?? ""),
      documentType: String(o.document_type),
      fields: parseFieldDefs(String(o.field_defs)),
      createdAt: String(o.created_at),
    };
  });
}

export async function getParser(id: string): Promise<ParserRecord | null> {
  const db = await getDb();
  const stmt = db.prepare(
    `SELECT id, name, description, document_type, field_defs, created_at
       FROM parsers WHERE id = ?`
  );
  stmt.bind([id]);
  if (!stmt.step()) {
    stmt.free();
    return null;
  }
  const row = stmt.getAsObject();
  stmt.free();
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description ?? ""),
    documentType: String(row.document_type),
    fields: parseFieldDefs(String(row.field_defs)),
    createdAt: String(row.created_at),
  };
}

export async function createParser(entry: NewParser): Promise<ParserRecord> {
  const db = await getDb();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  db.run(
    `INSERT INTO parsers (id, name, description, document_type, field_defs, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id,
      entry.name.trim(),
      entry.description.trim(),
      entry.documentType.trim(),
      JSON.stringify(entry.fields),
      createdAt,
    ]
  );

  persistDb(db);
  return { id, createdAt, ...entry };
}

export async function updateParser(
  id: string,
  entry: NewParser
): Promise<ParserRecord | null> {
  const db = await getDb();
  db.run(
    `UPDATE parsers
        SET name = ?, description = ?, document_type = ?, field_defs = ?
      WHERE id = ?`,
    [
      entry.name.trim(),
      entry.description.trim(),
      entry.documentType.trim(),
      JSON.stringify(entry.fields),
      id,
    ]
  );
  const modified = db.getRowsModified() > 0;
  persistDb(db);
  if (!modified) return null;
  return getParser(id);
}
