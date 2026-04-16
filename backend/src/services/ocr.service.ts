import fs from "fs";
import OpenAI from "openai";
import sharp from "sharp";

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

const OCR_SYSTEM_PROMPT = `You are a document OCR and classification system.
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

export interface FieldEntry {
  value: unknown;
  confidence: number;
}

export interface OcrResult {
  documentType: string | null;
  language: string | null;
  fields: Record<string, FieldEntry>;
}

async function toBase64Jpeg(input: Buffer | Uint8Array): Promise<string> {
  const buf = await sharp(Buffer.from(input))
    .resize({ width: 1300, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
  return buf.toString("base64");
}

function normalizeFields(raw: Record<string, unknown>): Record<string, FieldEntry> {
  const out: Record<string, FieldEntry> = {};
  for (const [key, val] of Object.entries(raw)) {
    if (val !== null && typeof val === "object" && "value" in val && "confidence" in val) {
      out[key] = {
        value: (val as FieldEntry).value ?? null,
        confidence: typeof (val as FieldEntry).confidence === "number"
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

async function ocrPage(base64Image: string): Promise<OcrResult> {
  const res = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: OCR_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: "Extract all information from this document image." },
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
    fields: normalizeFields(parsed.fields ?? {}),
  };
}

function mergeResults(pages: OcrResult[]): OcrResult {
  if (pages.length === 0) throw new Error("No pages to merge");
  if (pages.length === 1) return pages[0];

  const documentType = pages.map((p) => p.documentType).find((v) => v != null) ?? null;
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

async function processInBatches(pageBuffers: Uint8Array[]): Promise<OcrResult[]> {
  const results: OcrResult[] = [];

  for (let i = 0; i < pageBuffers.length; i += BATCH_SIZE) {
    const batch = pageBuffers.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (buf) => {
        const base64 = await toBase64Jpeg(buf);
        return ocrPage(base64);
      })
    );
    results.push(...batchResults);
  }

  return results;
}

export async function extractFromFile(filePath: string, mimeType: string, fileName?: string): Promise<OcrResult> {
  const buffer = fs.readFileSync(filePath);

  if (isPdf(mimeType, fileName)) {
    const { pdf } = await import("pdf-to-img");
    const document = await pdf(buffer, { scale: 2 });
    const pageBuffers: Uint8Array[] = [];

    for await (const pageBuffer of document) {
      pageBuffers.push(new Uint8Array(pageBuffer));
    }

    if (pageBuffers.length === 0) throw new Error("PDF produced no renderable pages");

    const pageResults = await processInBatches(pageBuffers);
    return mergeResults(pageResults);
  }

  const base64 = await toBase64Jpeg(buffer);
  return ocrPage(base64);
}
