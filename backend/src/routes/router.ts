import { Router } from "express";
import documentsRouter from "./documents";
import healthRouter from "./health";
import uploadRouter from "./upload";

const router = Router();

router.use("/health", healthRouter);
router.use("/documents", documentsRouter);
router.use("/upload", uploadRouter);

export default router;
