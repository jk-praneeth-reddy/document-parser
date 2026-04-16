import { Router } from "express";
import documentsRouter from "./documents";
import healthRouter from "./health";
import ocrRouter from "./ocr";
import uploadRouter from "./upload";

const router = Router();

router.use("/health", healthRouter);
router.use("/documents", documentsRouter);
router.use("/upload", uploadRouter);
router.use("/ocr", ocrRouter);

export default router;
