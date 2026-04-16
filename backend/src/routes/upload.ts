import { NextFunction, Request, Response, Router } from "express";
import { upload } from "../config/multer";

const router = Router();

// POST /api/upload — accept a single file under the field name "file"
router.post(
  "/",
  (req: Request, res: Response, next: NextFunction) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        res.status(400).json({ success: false, error: err.message });
        return;
      }
      next();
    });
  },
  (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ success: false, error: "No file provided" });
      return;
    }

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      file: {
        originalName: req.file.originalname,
        savedAs: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      },
    });
  }
);

export default router;
