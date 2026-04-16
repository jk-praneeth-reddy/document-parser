import fs from "fs";
import OpenAI from "openai";
import sharp from "sharp";
import type { ParserRecord } from "./parser.service";
import { getCorrectionsForPrompt } from "./history.service";

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

export const OCR_SYSTEM_PROMPT = `You are a document OCR and classification system.
Analyze the provided document image and return ONLY valid JSON with exactly these three keys:

- documentType (string): the type of document detected, e.g. "invoice", "aadhaar_card",
  "pan_card", "passport", "bank_statement", "driving_license", "receipt", "cheque",
  "tax_return", "contract", "id_card", etc. Return null if the image is not a
  recognisable document.
- language (string): the primary language of the document text, e.g. "English", "Hindi",
  "Tamil", "Telugu". Return null if undetermined.
- fields (object): all relevant key-value pairs extracted from the document using camelCase
  keys. Each field must be an object with two keys:
    - "value": the extracted value (string, number, null, or array of objects for tabular data)
    - "confidence": a number between 0 and 1 representing how clearly this field was readable
        1.0 = perfectly clear and unambiguous
        0.7–0.9 = mostly readable, minor uncertainty
        0.4–0.6 = partially readable or inferred
        0.0–0.3 = very unclear, blurry, or heavily guessed
  Return an empty object {} for fields if documentType is null.

Rules:
1. If the image is not a recognisable document (e.g. a photo, selfie, landscape),
   set documentType to null and fields to {}.
2. Never hallucinate or guess values — set value to null and confidence to 0 if unclear.
3. Numeric fields (amounts, totals) must have numeric values, not strings.
4. Dates should be normalised to YYYY-MM-DD where possible; otherwise return the raw string.
5. Do not add explanations, comments, or any keys outside the three required ones.
6. Output must be strictly valid JSON.
7. For tabular or repeating data (e.g. invoice line items, bank statement transactions),
   value must be a row-oriented array of objects where each object contains all columns.
   Each row object should also include a "confidence" key for that row's overall readability.
   Correct:   "items": { "value": [{"description":"Widget","quantity":2,"amount":100,"confidence":0.95}], "confidence": 0.95 }
   Incorrect: "description":["Widget"], "quantity":[2]`;

function buildParserSystemPrompt(parser: ParserRecord): string {
  const fieldList = parser.fields
    .map(
      (field) =>
        `- ${field.field}: ${field.description || "No description provided"}`,
    )
    .join("\n");

  return `You are a document OCR and structured extraction system.
Analyze the provided document image and return ONLY valid JSON with exactly these three keys:

- documentType (string): return "${parser.documentType}" when the document matches this parser. Return null if the image is not a recognisable document of this type.
- language (string): the primary language of the document text, e.g. "English", "Hindi", "Tamil", "Telugu". Return null if undetermined.
- fields (object): return ONLY the fields listed below, using exactly the same keys. Each field must be an object with:
    - "value": the extracted value (string, number, null, or array of objects for tabular data)
    - "confidence": a number between 0 and 1

Parser:
- parserName: ${parser.name}
- expectedDocumentType: ${parser.documentType}
- fields:
${fieldList}

Rules:
1. If the image is not a recognisable document, set documentType to null and fields to {}.
2. If the document is recognisable but does not match "${parser.documentType}", set documentType to null and fields to {}.
3. Return ONLY the listed field keys in the fields object. Never add extra keys.
4. If a listed field is missing or unclear, return that field with value null and confidence 0.
5. Never hallucinate or guess values.
6. Numeric fields must be numeric values, not strings.
7. Dates should be normalised to YYYY-MM-DD where possible; otherwise return the raw string.
8. Output must be strictly valid JSON.`;
}

export interface FieldEntry {
  value: unknown;
  confidence: number;
}

export interface OcrResult {
  documentType: string | null;
  language: string | null;
  fields: Record<string, FieldEntry>;
}

/** Linear scale before Vision API: 0.25 ⇒ ~25% width & height (~6.25% area). */
const VISION_IMAGE_SCALE = 0.25;

async function toBase64Jpeg(input: Buffer | Uint8Array): Promise<string> {
  const raw = Buffer.from(input);
  const meta = await sharp(raw).metadata();
  const w = meta.width;
  let pipeline = sharp(raw);
  if (w != null && w > 0) {
    const targetW = Math.max(1, Math.round(w * VISION_IMAGE_SCALE));
    pipeline = pipeline.resize({ width: targetW, withoutEnlargement: true });
  } else {
    const fallbackW = Math.max(1, Math.round(1300 * VISION_IMAGE_SCALE));
    pipeline = pipeline.resize({ width: fallbackW, withoutEnlargement: true });
  }
  const buf = await pipeline.jpeg({ quality: 80 }).toBuffer();
  return buf.toString("base64");
}

function normalizeFields(
  raw: Record<string, unknown>,
): Record<string, FieldEntry> {
  const out: Record<string, FieldEntry> = {};
  for (const [key, val] of Object.entries(raw)) {
    if (
      val !== null &&
      typeof val === "object" &&
      "value" in val &&
      "confidence" in val
    ) {
      out[key] = {
        value: (val as FieldEntry).value ?? null,
        confidence:
          typeof (val as FieldEntry).confidence === "number"
            ? Math.min(1, Math.max(0, (val as FieldEntry).confidence))
            : 0,
      };
    } else {
      // Fallback: OpenAI returned a plain value — wrap it with neutral confidence
      out[key] = { value: val, confidence: 0.5 };
    }
  }
  return out;
}

function applyParserFieldSchema(
  fields: Record<string, FieldEntry>,
  parser?: ParserRecord | null,
): Record<string, FieldEntry> {
  if (!parser) return fields;

  const shaped: Record<string, FieldEntry> = {};
  for (const def of parser.fields) {
    shaped[def.field] = fields[def.field] ?? { value: null, confidence: 0 };
  }
  return shaped;
}

async function ocrPage(
  base64Image: string,
  parser?: ParserRecord | null,
  extraGuidance?: string,
): Promise<OcrResult> {
  let basePrompt = parser ? buildParserSystemPrompt(parser) : OCR_SYSTEM_PROMPT;
  if (extraGuidance) basePrompt = `${basePrompt}\n\n${extraGuidance}`;

  const res = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: basePrompt },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract all information from this document image.",
          },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${base64Image}` },
          },
        ],
      },
    ],
  });

  const content = res.choices[0].message.content;
  if (!content) throw new Error("OpenAI returned empty content");

  const parsed = JSON.parse(content) as {
    documentType?: string | null;
    language?: string | null;
    fields?: Record<string, unknown>;
  };

  return {
    documentType: parsed.documentType ?? null,
    language: parsed.language ?? null,
    fields: applyParserFieldSchema(
      normalizeFields(parsed.fields ?? {}),
      parser,
    ),
  };
}

function mergeResults(pages: OcrResult[]): OcrResult {
  if (pages.length === 0) throw new Error("No pages to merge");
  if (pages.length === 1) return pages[0];

  const documentType =
    pages.map((p) => p.documentType).find((v) => v != null) ?? null;
  const language = pages.map((p) => p.language).find((v) => v != null) ?? null;

  // Merge fields: highest confidence value per key wins across pages
  const fields: Record<string, FieldEntry> = {};
  for (const page of pages) {
    for (const [key, entry] of Object.entries(page.fields)) {
      if (entry.value == null || entry.value === "") continue;
      if (!(key in fields) || entry.confidence > fields[key].confidence) {
        fields[key] = entry;
      }
    }
  }

  return { documentType, language, fields };
}

function isPdf(mimeType: string, fileName?: string): boolean {
  const mime = (mimeType ?? "").toLowerCase();
  return (
    mime === "application/pdf" ||
    mime === "application/x-pdf" ||
    (fileName ?? "").toLowerCase().endsWith(".pdf")
  );
}

const BATCH_SIZE = 5;

async function processInBatches(
  pageBuffers: Uint8Array[],
  parser?: ParserRecord | null,
  extraGuidance?: string,
): Promise<OcrResult[]> {
  const results: OcrResult[] = [];

  for (let i = 0; i < pageBuffers.length; i += BATCH_SIZE) {
    const batch = pageBuffers.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (buf) => {
        const base64 = await toBase64Jpeg(buf);
        return ocrPage(base64, parser, extraGuidance);
      }),
    );
    results.push(...batchResults);
  }

  return results;
}

/** Builds a compact guidance block from stored human corrections. */
async function buildCorrectionsGuidance(): Promise<string | undefined> {
  const corrections = await getCorrectionsForPrompt(30);
  if (corrections.length === 0) return undefined;

  const lines = corrections.map(
    ({ documentType, fieldKey, originalValue, correctedValue }) => {
      const from = originalValue != null ? `"${originalValue}"` : "(missing)";
      return `• [${documentType}] ${fieldKey}: ${from} → "${correctedValue}"`;
    },
  );

  return (
    "User-verified corrections from similar documents — apply these patterns:\n" +
    lines.join("\n")
  );
}

export async function extractFromFile(
  filePath: string,
  mimeType: string,
  fileName?: string,
  parser?: ParserRecord | null,
): Promise<OcrResult> {
  const buffer = fs.readFileSync(filePath);

  // Load human-correction guidance once per extraction
  const extraGuidance = await buildCorrectionsGuidance();

  if (isPdf(mimeType, fileName)) {
    const { pdf } = await import("pdf-to-img");
    const document = await pdf(buffer, { scale: 2 });
    const pageBuffers: Uint8Array[] = [];

    for await (const pageBuffer of document) {
      pageBuffers.push(new Uint8Array(pageBuffer));
    }

    if (pageBuffers.length === 0)
      throw new Error("PDF produced no renderable pages");

    const pageResults = await processInBatches(
      pageBuffers,
      parser,
      extraGuidance,
    );
    const merged = mergeResults(pageResults);
    return {
      ...merged,
      fields: applyParserFieldSchema(merged.fields, parser),
    };
  }

  const base64 = await toBase64Jpeg(buffer);
  return ocrPage(base64, parser, extraGuidance);
}
