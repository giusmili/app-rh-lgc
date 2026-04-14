import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

const SUPPORTED_EXTENSIONS = new Set([".pdf", ".docx", ".txt"]);

export function assertSupportedFile(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    throw new Error(`Format non supporté pour ${fileName}`);
  }
}

export async function withTemporaryFile<T>(
  fileName: string,
  content: Buffer,
  action: (filePath: string) => Promise<T>
) {
  assertSupportedFile(fileName);
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "app-rh-"));
  const filePath = path.join(directory, fileName);

  await fs.writeFile(filePath, content);

  try {
    return await action(filePath);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
}

export async function extractTextFromPath(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".pdf") {
    const data = await fs.readFile(filePath);
    const parsed = await pdfParse(data);
    return sanitizeText(parsed.text);
  }

  if (extension === ".docx") {
    const data = await fs.readFile(filePath);
    const parsed = await mammoth.extractRawText({ buffer: data });
    return sanitizeText(parsed.value);
  }

  if (extension === ".txt") {
    const data = await fs.readFile(filePath, "utf8");
    return sanitizeText(data);
  }

  throw new Error(`Extension non gérée: ${extension}`);
}

function sanitizeText(value: string) {
  return value.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
