import cors from "cors";
import express from "express";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import apiRouter from "./routes/router";
import { UPLOADS_DIR } from "./config/multer";

const app = express();

app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json());

// Serve uploaded files so the frontend can preview them
app.use("/api/uploads", express.static(UPLOADS_DIR));

app.get("/", (_req, res) => {
  res.json({ message: "Document Parser API" });
});

app.use("/api", apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
