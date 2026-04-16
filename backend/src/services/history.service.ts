import crypto from "crypto";
import { getDb, persistDb } from "../db/database";
import type { FieldEntry } from "./ocr.service";

export interface HistoryEntry {
  id: string;
  originalName: string;
  savedAs: string;
  mimeType: string;
  size: number;
  documentType: string | null;
  language: string | null;
  fields: Record<string, FieldEntry>;
  extractedAt: string;
}

type NewEntry = Omit<HistoryEntry, "id" | "extractedAt">;

export async function insertHistory(entry: NewEntry): Promise<HistoryEntry> {
  const db = await getDb();
  const id = crypto.randomUUID();
  const extractedAt = new Date().toISOString();

  db.run(
    `INSERT INTO history
       (id, original_name, saved_as, mime_type, size, document_type, language, fields, extracted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      entry.originalName,
      entry.savedAs,
      entry.mimeType,
      entry.size,
      entry.documentType ?? null,
      entry.language ?? null,
      JSON.stringify(entry.fields),
      extractedAt,
    ]
  );

  persistDb(db);
  return { id, extractedAt, ...entry };
}

export async function getAllHistory(): Promise<HistoryEntry[]> {
  const db = await getDb();
  const result = db.exec(
    `SELECT id, original_name, saved_as, mime_type, size, document_type, language, fields, extracted_at
       FROM history
      ORDER BY extracted_at DESC`
  );

  if (!result.length || !result[0].values.length) return [];

  const { columns, values } = result[0];
  return values.map((row) => {
    const o = Object.fromEntries(columns.map((col, i) => [col, row[i]]));
    return {
      id: String(o.id),
      originalName: String(o.original_name),
      savedAs: String(o.saved_as),
      mimeType: String(o.mime_type),
      size: Number(o.size),
      documentType: o.document_type != null ? String(o.document_type) : null,
      language: o.language != null ? String(o.language) : null,
      fields: JSON.parse(String(o.fields)) as Record<string, FieldEntry>,
      extractedAt: String(o.extracted_at),
    };
  });
}

export async function updateHistoryFields(
  id: string,
  fields: Record<string, FieldEntry>
): Promise<boolean> {
  const db = await getDb();
  db.run("UPDATE history SET fields = ? WHERE id = ?", [
    JSON.stringify(fields),
    id,
  ]);
  const modified = db.getRowsModified() > 0;
  persistDb(db);
  return modified;
}
