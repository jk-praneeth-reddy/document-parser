import { NextFunction, Request, Response, Router } from "express";
import { upload } from "../config/multer";
import { extractFromFile } from "../services/ocr.service";

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
      const result = await extractFromFile(file.path, file.mimetype, file.originalname);

      if (result.documentType === null) {
        res.status(400).json({
          success: false,
          error: "Not a recognisable document. Please upload a valid document file.",
        });
        return;
      }

      res.json({
        success: true,
        file: {
          originalName: file.originalname,
          savedAs: file.filename,
          mimeType: file.mimetype,
          size: file.size,
        },
        documentType: result.documentType,
        language: result.language,
        fields: result.fields,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ success: false, error: "OCR extraction failed.", detail: message });
    }
  }
);

export default router;
