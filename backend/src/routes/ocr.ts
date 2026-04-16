import { NextFunction, Request, Response, Router } from "express";
import { UPLOADS_DIR } from "../config/multer";
import { upload } from "../config/multer";
import { extractFromFile, OCR_SYSTEM_PROMPT } from "../services/ocr.service";
import { getParser } from "../services/parser.service";
import {
  getAllCorrections,
  getAllHistory,
  generateFineTuneExport,
  getCorrectionMetrics,
  getHistoryById,
  insertHistory,
  recordCorrections,
  updateHistoryFields,
} from "../services/history.service";
import type { FieldEntry } from "../services/ocr.service";

const router = Router();

const OCR_ALLOWED_MIMES = new Set([
  "application/pdf",
  "application/x-pdf",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/webp",
  "image/bmp",
]);

const ocrUpload = upload.single("file");

// POST /api/ocr/extract
router.post(
  "/extract",
  (req: Request, res: Response, next: NextFunction) => {
    ocrUpload(req, res, (err) => {
      if (err) {
        res.status(400).json({ success: false, error: err.message });
        return;
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    const file = req.file;
    const parserId = typeof req.body?.parserId === "string" ? req.body.parserId.trim() : "";

    if (!file) {
      res.status(400).json({
        success: false,
        error: "No file provided. Send a file in the 'file' field (multipart/form-data).",
      });
      return;
    }

    if (!OCR_ALLOWED_MIMES.has(file.mimetype)) {
      res.status(400).json({
        success: false,
        error: `Unsupported file type: ${file.mimetype}. Allowed: PDF, JPEG, PNG, TIFF, WebP, BMP.`,
      });
      return;
    }

    if (!process.env.OPENAI_API_KEY) {
      res.status(500).json({ success: false, error: "OPENAI_API_KEY is not configured." });
      return;
    }

    try {
      const parser = parserId ? await getParser(parserId) : null;
      if (parserId && !parser) {
        res.status(404).json({ success: false, error: "Selected parser not found." });
        return;
      }

      const result = await extractFromFile(file.path, file.mimetype, file.originalname, parser);

      if (result.documentType === null) {
        res.status(400).json({
          success: false,
          error: "Not a recognisable document. Please upload a valid document file.",
        });
        return;
      }

      const historyEntry = await insertHistory({
        originalName: file.originalname,
        savedAs: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        documentType: result.documentType,
        language: result.language,
        fields: result.fields,
      });

      res.json({
        success: true,
        historyId: historyEntry.id,
        file: {
          originalName: file.originalname,
          savedAs: file.filename,
          mimeType: file.mimetype,
          size: file.size,
        },
        fileUrl: `/api/uploads/${file.filename}`,
        documentType: result.documentType,
        language: result.language,
        fields: result.fields,
        parser: parser ? { id: parser.id, name: parser.name } : null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[OCR extract error]", message);
      res.status(500).json({ success: false, error: "OCR extraction failed.", detail: message });
    }
  }
);

// GET /api/ocr/metrics  – human-correction quality stats
router.get("/metrics", async (_req: Request, res: Response) => {
  try {
    const metrics = await getCorrectionMetrics();
    res.json({ success: true, metrics });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: "Failed to compute metrics.", detail: message });
  }
});

// GET /api/ocr/history
router.get("/history", async (_req: Request, res: Response) => {
  try {
    const entries = await getAllHistory();
    res.json({ success: true, history: entries });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: "Failed to fetch history.", detail: message });
  }
});

// PATCH /api/ocr/history/:id
router.patch("/history/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { fields } = req.body as { fields?: Record<string, FieldEntry> };

  if (!fields || typeof fields !== "object") {
    res.status(400).json({ success: false, error: "Request body must include 'fields' object." });
    return;
  }

  try {
    // Load existing entry so we can diff old vs new values
    const existing = await getHistoryById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: "History entry not found." });
      return;
    }

    const updated = await updateHistoryFields(id, fields);
    if (!updated) {
      res.status(404).json({ success: false, error: "History entry not found." });
      return;
    }

    // Record every changed value as a correction for the feedback loop
    if (existing.documentType) {
      await recordCorrections(id, existing.documentType, existing.fields, fields);
    }

    res.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: "Failed to update fields.", detail: message });
  }
});

// GET /api/ocr/corrections  – list all recorded corrections
router.get("/corrections", async (_req: Request, res: Response) => {
  try {
    const corrections = await getAllCorrections();
    res.json({ success: true, corrections });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: "Failed to fetch corrections.", detail: message });
  }
});

// GET /api/ocr/corrections/export  – download OpenAI fine-tuning JSONL
router.get("/corrections/export", async (_req: Request, res: Response) => {
  try {
    const lines = await generateFineTuneExport(UPLOADS_DIR, OCR_SYSTEM_PROMPT);
    if (lines.length === 0) {
      res.status(404).json({
        success: false,
        error: "No corrected image documents found. Edit and save at least one extraction first.",
      });
      return;
    }
    res.setHeader("Content-Type", "application/x-ndjson");
    res.setHeader("Content-Disposition", 'attachment; filename="finetune.jsonl"');
    res.send(lines.join("\n"));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: "Export failed.", detail: message });
  }
});

export default router;
