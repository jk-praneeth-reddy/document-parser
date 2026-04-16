import { Request, Response, Router } from "express";
import {
  createParser,
  getParser,
  listParsers,
  updateParser,
  type ParserFieldDef,
} from "../services/parser.service";

const router = Router();

function normalizeFields(body: unknown): ParserFieldDef[] | null {
  if (!body || typeof body !== "object" || !("fields" in body)) return null;
  const raw = (body as { fields: unknown }).fields;
  if (!Array.isArray(raw)) return null;
  const out: ParserFieldDef[] = [];
  for (const row of raw) {
    if (row === null || typeof row !== "object") continue;
    const field = typeof (row as { field?: unknown }).field === "string"
      ? (row as { field: string }).field.trim()
      : "";
    const description =
      typeof (row as { description?: unknown }).description === "string"
        ? (row as { description: string }).description.trim()
        : "";
    if (!field) continue;
    out.push({ field, description });
  }
  return out;
}

// GET /api/parsers
router.get("/", async (_req: Request, res: Response) => {
  try {
    const parsers = await listParsers();
    res.json({ success: true, parsers });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: "Failed to list parsers.", detail: message });
  }
});

// GET /api/parsers/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const parser = await getParser(req.params.id);
    if (!parser) {
      res.status(404).json({ success: false, error: "Parser not found." });
      return;
    }
    res.json({ success: true, parser });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: "Failed to load parser.", detail: message });
  }
});

// POST /api/parsers
router.post("/", async (req: Request, res: Response) => {
  const { name, description, documentType } = req.body as {
    name?: unknown;
    description?: unknown;
    documentType?: unknown;
  };

  if (typeof name !== "string" || !name.trim()) {
    res.status(400).json({ success: false, error: "name is required." });
    return;
  }
  if (typeof documentType !== "string" || !documentType.trim()) {
    res.status(400).json({ success: false, error: "documentType is required." });
    return;
  }

  const fields = normalizeFields(req.body);
  if (fields === null) {
    res.status(400).json({ success: false, error: "fields must be an array." });
    return;
  }
  if (fields.length === 0) {
    res.status(400).json({
      success: false,
      error: "Add at least one field with a non-empty field name.",
    });
    return;
  }

  const desc =
    typeof description === "string" ? description : "";

  try {
    const parser = await createParser({
      name: name.trim(),
      description: desc.trim(),
      documentType: documentType.trim(),
      fields,
    });
    res.status(201).json({ success: true, parser });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: "Failed to create parser.", detail: message });
  }
});

// PUT /api/parsers/:id
router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, documentType } = req.body as {
    name?: unknown;
    description?: unknown;
    documentType?: unknown;
  };

  if (typeof name !== "string" || !name.trim()) {
    res.status(400).json({ success: false, error: "name is required." });
    return;
  }
  if (typeof documentType !== "string" || !documentType.trim()) {
    res.status(400).json({ success: false, error: "documentType is required." });
    return;
  }

  const fields = normalizeFields(req.body);
  if (fields === null) {
    res.status(400).json({ success: false, error: "fields must be an array." });
    return;
  }
  if (fields.length === 0) {
    res.status(400).json({
      success: false,
      error: "Add at least one field with a non-empty field name.",
    });
    return;
  }

  const desc =
    typeof description === "string" ? description : "";

  try {
    const parser = await updateParser(id, {
      name: name.trim(),
      description: desc.trim(),
      documentType: documentType.trim(),
      fields,
    });
    if (!parser) {
      res.status(404).json({ success: false, error: "Parser not found." });
      return;
    }
    res.json({ success: true, parser });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: "Failed to update parser.", detail: message });
  }
});

export default router;
