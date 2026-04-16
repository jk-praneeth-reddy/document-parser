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

export async function getHistoryById(id: string): Promise<HistoryEntry | null> {
  const db = await getDb();
  const result = db.exec(
    `SELECT id, original_name, saved_as, mime_type, size, document_type, language, fields, extracted_at
       FROM history WHERE id = ?`,
    [id]
  );
  if (!result.length || !result[0].values.length) return null;
  const { columns, values } = result[0];
  const o = Object.fromEntries(columns.map((col, i) => [col, values[0][i]]));
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

// ─── Correction tracking ──────────────────────────────────────────────────────

export interface CorrectionEntry {
  id: string;
  historyId: string;
  documentType: string;
  fieldKey: string;
  originalValue: string | null;
  correctedValue: string;
  correctedAt: string;
}

/** Diffs old vs new fields and writes a row per changed value. */
export async function recordCorrections(
  historyId: string,
  documentType: string,
  oldFields: Record<string, FieldEntry>,
  newFields: Record<string, FieldEntry>
): Promise<void> {
  const db = await getDb();
  const correctedAt = new Date().toISOString();
  let changed = false;

  for (const [key, newEntry] of Object.entries(newFields)) {
    const oldVal = oldFields[key] != null ? String(oldFields[key].value ?? "") : null;
    const newVal = String(newEntry.value ?? "");
    if (oldVal !== newVal) {
      db.run(
        `INSERT INTO corrections
           (id, history_id, document_type, field_key, original_value, corrected_value, corrected_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), historyId, documentType, key, oldVal, newVal, correctedAt]
      );
      changed = true;
    }
  }

  if (changed) persistDb(db);
}

/** Returns the most-recent correction per (documentType, fieldKey) for prompt injection. */
export async function getCorrectionsForPrompt(
  limit = 30
): Promise<{ documentType: string; fieldKey: string; originalValue: string | null; correctedValue: string }[]> {
  const db = await getDb();
  const result = db.exec(
    `SELECT document_type, field_key, original_value, corrected_value
       FROM corrections
      WHERE (original_value IS NULL OR original_value != corrected_value)
      GROUP BY document_type, field_key
      ORDER BY MAX(corrected_at) DESC
      LIMIT ?`,
    [limit]
  );
  if (!result.length || !result[0].values.length) return [];
  const { columns, values } = result[0];
  return values.map((row) => {
    const o = Object.fromEntries(columns.map((col, i) => [col, row[i]]));
    return {
      documentType: String(o.document_type),
      fieldKey: String(o.field_key),
      originalValue: o.original_value != null ? String(o.original_value) : null,
      correctedValue: String(o.corrected_value),
    };
  });
}

/** Returns all corrections for the corrections list endpoint. */
export async function getAllCorrections(): Promise<CorrectionEntry[]> {
  const db = await getDb();
  const result = db.exec(
    `SELECT id, history_id, document_type, field_key, original_value, corrected_value, corrected_at
       FROM corrections
      ORDER BY corrected_at DESC`
  );
  if (!result.length || !result[0].values.length) return [];
  const { columns, values } = result[0];
  return values.map((row) => {
    const o = Object.fromEntries(columns.map((col, i) => [col, row[i]]));
    return {
      id: String(o.id),
      historyId: String(o.history_id),
      documentType: String(o.document_type),
      fieldKey: String(o.field_key),
      originalValue: o.original_value != null ? String(o.original_value) : null,
      correctedValue: String(o.corrected_value),
      correctedAt: String(o.corrected_at),
    };
  });
}

/** Aggregated quality metrics derived from human field corrections. */
export interface DocumentTypeQualityMetrics {
  documentType: string;
  extractions: number;
  documentsWithCorrections: number;
  correctionEvents: number;
  /** % of extractions of this type where the user changed at least one field */
  documentEditRatePercent: number;
  /** Mean correction rows per extraction (proxy for field-level churn) */
  avgCorrectionsPerExtraction: number;
}

export interface CorrectionMetrics {
  totalExtractions: number;
  totalCorrectionEvents: number;
  documentsWithCorrections: number;
  documentEditRatePercent: number;
  avgCorrectionsPerExtraction: number;
  avgCorrectionsAmongEditedDocs: number | null;
  byDocumentType: DocumentTypeQualityMetrics[];
}

function sqlScalar(db: Awaited<ReturnType<typeof getDb>>, sql: string): number {
  const result = db.exec(sql);
  if (!result.length || !result[0].values.length) return 0;
  return Number(result[0].values[0][0]);
}

/** Human-in-the-loop stats: correction counts and edit rates (not gold-label accuracy). */
export async function getCorrectionMetrics(): Promise<CorrectionMetrics> {
  const db = await getDb();

  const totalExtractions = sqlScalar(db, "SELECT COUNT(*) FROM history");
  const totalCorrectionEvents = sqlScalar(db, "SELECT COUNT(*) FROM corrections");
  const documentsWithCorrections = sqlScalar(db, "SELECT COUNT(DISTINCT history_id) FROM corrections");

  const documentEditRatePercent =
    totalExtractions > 0
      ? Math.round((documentsWithCorrections / totalExtractions) * 10000) / 100
      : 0;
  const avgCorrectionsPerExtraction =
    totalExtractions > 0
      ? Math.round((totalCorrectionEvents / totalExtractions) * 1000) / 1000
      : 0;
  const avgCorrectionsAmongEditedDocs =
    documentsWithCorrections > 0
      ? Math.round((totalCorrectionEvents / documentsWithCorrections) * 1000) / 1000
      : null;

  const extResult = db.exec(
    `SELECT document_type, COUNT(*) AS cnt
       FROM history
      WHERE document_type IS NOT NULL AND TRIM(document_type) != ''
      GROUP BY document_type`
  );
  const extByType = new Map<string, number>();
  if (extResult.length && extResult[0].values.length) {
    const { columns, values } = extResult[0];
    for (const row of values) {
      const o = Object.fromEntries(columns.map((c, i) => [c, row[i]]));
      extByType.set(String(o.document_type), Number(o.cnt));
    }
  }

  const corrResult = db.exec(
    `SELECT document_type,
            COUNT(*) AS events,
            COUNT(DISTINCT history_id) AS docs
       FROM corrections
      GROUP BY document_type`
  );
  const corrByType = new Map<string, { events: number; docs: number }>();
  if (corrResult.length && corrResult[0].values.length) {
    const { columns, values } = corrResult[0];
    for (const row of values) {
      const o = Object.fromEntries(columns.map((c, i) => [c, row[i]]));
      corrByType.set(String(o.document_type), {
        events: Number(o.events),
        docs: Number(o.docs),
      });
    }
  }

  const allTypes = new Set<string>([...extByType.keys(), ...corrByType.keys()]);
  const byDocumentType: DocumentTypeQualityMetrics[] = [...allTypes].map((documentType) => {
    const extractions = extByType.get(documentType) ?? 0;
    const c = corrByType.get(documentType);
    const correctionEvents = c?.events ?? 0;
    const docsWithCorr = c?.docs ?? 0;
    const documentEditRatePercentType =
      extractions > 0 ? Math.round((docsWithCorr / extractions) * 10000) / 100 : 0;
    const avgCorrectionsPerExtractionType =
      extractions > 0 ? Math.round((correctionEvents / extractions) * 1000) / 1000 : 0;
    return {
      documentType,
      extractions,
      documentsWithCorrections: docsWithCorr,
      correctionEvents,
      documentEditRatePercent: documentEditRatePercentType,
      avgCorrectionsPerExtraction: avgCorrectionsPerExtractionType,
    };
  });

  byDocumentType.sort((a, b) => b.correctionEvents - a.correctionEvents);

  return {
    totalExtractions,
    totalCorrectionEvents,
    documentsWithCorrections,
    documentEditRatePercent,
    avgCorrectionsPerExtraction,
    avgCorrectionsAmongEditedDocs,
    byDocumentType,
  };
}

/**
 * Generates JSONL lines in OpenAI fine-tuning format.
 * Only includes image (non-PDF) history entries that have at least one correction.
 */
export async function generateFineTuneExport(
  uploadsDir: string,
  systemPrompt: string
): Promise<string[]> {
  const db = await getDb();

  // Get distinct history entries with corrections (images only)
  const result = db.exec(
    `SELECT DISTINCT h.id, h.saved_as, h.mime_type, h.document_type, h.language, h.fields
       FROM history h
       INNER JOIN corrections c ON c.history_id = h.id
      WHERE h.mime_type LIKE 'image/%'`
  );
  if (!result.length || !result[0].values.length) return [];

  const fs = await import("fs");
  const path = await import("path");
  const { columns, values } = result[0];
  const lines: string[] = [];

  for (const row of values) {
    const o = Object.fromEntries(columns.map((col, i) => [col, row[i]]));
    const filePath = path.join(uploadsDir, String(o.saved_as));
    if (!fs.existsSync(filePath)) continue;

    // Build corrected fields by applying all corrections for this history entry
    const fields = JSON.parse(String(o.fields)) as Record<string, FieldEntry>;
    const corrResult = db.exec(
      `SELECT field_key, corrected_value FROM corrections WHERE history_id = ?`,
      [String(o.id)]
    );
    if (corrResult.length && corrResult[0].values.length) {
      for (const corrRow of corrResult[0].values) {
        const corrO = Object.fromEntries(
          corrResult[0].columns.map((col, i) => [col, corrRow[i]])
        );
        const key = String(corrO.field_key);
        if (fields[key]) {
          fields[key] = { ...fields[key], value: corrO.corrected_value };
        }
      }
    }

    const imageBase64 = fs.readFileSync(filePath).toString("base64");
    const mimeType = String(o.mime_type);
    const assistantContent = JSON.stringify({
      documentType: o.document_type,
      language: o.language,
      fields,
    });

    lines.push(
      JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract all information from this document image." },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${imageBase64}` },
              },
            ],
          },
          { role: "assistant", content: assistantContent },
        ],
      })
    );
  }

  return lines;
}
