import cors from "cors";
import express from "express";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import apiRouter from "./routes/router";

const app = express();

app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Document Parser API" });
});

app.use("/api", apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
