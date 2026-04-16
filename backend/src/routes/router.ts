import { Router } from "express";
import documentsRouter from "./documents";
import healthRouter from "./health";

const router = Router();

router.use("/health", healthRouter);
router.use("/v1", documentsRouter);

export default router;
