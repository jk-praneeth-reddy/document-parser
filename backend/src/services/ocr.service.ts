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
  keys. The fields should be appropriate for the detected document type. Return an empty
  object {} if documentType is null.

Rules:
1. If the image is not a recognisable document (e.g. a photo, selfie, landscape),
   set documentType to null and fields to {}.
2. Never hallucinate or guess values — return null for any field that is unclear or absent.
3. Numeric fields (amounts, totals) must be numbers, not strings.
4. Dates should be normalised to YYYY-MM-DD where possible; otherwise return the raw string.
5. Do not add explanations, comments, or any keys outside the three required ones.
6. Output must be strictly valid JSON.
7. For tabular or repeating data (e.g. invoice line items, bank statement transactions),
   always use a row-oriented array of objects where each object contains all columns for
   that row. NEVER split columns into separate parallel arrays.
   Correct:   "items": [{"description":"Widget","quantity":2,"unitPrice":50,"amount":100}]
   Incorrect: "description":["Widget"], "quantity":[2], "unitPrice":[50], "amount":[100]`;

export interface OcrResult {
  documentType: string | null;
  language: string | null;
  fields: Record<string, unknown>;
}

async function toBase64Jpeg(input: Buffer | Uint8Array): Promise<string> {
  const buf = await sharp(Buffer.from(input))
    .resize({ width: 1300, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
  return buf.toString("base64");
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

  const parsed = JSON.parse(content) as Partial<OcrResult>;
  return {
    documentType: parsed.documentType ?? null,
    language: parsed.language ?? null,
    fields: parsed.fields ?? {},
  };
}

function mergeResults(pages: OcrResult[]): OcrResult {
  if (pages.length === 0) throw new Error("No pages to merge");
  if (pages.length === 1) return pages[0];

  const documentType = pages.map((p) => p.documentType).find((v) => v != null) ?? null;
  const language = pages.map((p) => p.language).find((v) => v != null) ?? null;

  // Merge fields: first non-null value per key wins
  const fields: Record<string, unknown> = {};
  for (const page of pages) {
    for (const [key, value] of Object.entries(page.fields)) {
      if (!(key in fields) && value != null && value !== "") {
        fields[key] = value;
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
