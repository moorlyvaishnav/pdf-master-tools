/** File helpers shared by all PDF tools. Everything runs in the browser. */

export type FileKind = "pdf" | "jpeg" | "png" | "unknown";

/** Per-file limit. Files are processed in browser memory, so very large files can exhaust it. */
export const MAX_FILE_BYTES = 100 * 1024 * 1024; // 100 MB
/** Combined limit for multi-file tools (merge, images to PDF). */
export const MAX_TOTAL_BYTES = 300 * 1024 * 1024; // 300 MB
export const MAX_FILES = 100;

/** Identify a file by its first bytes instead of trusting the extension or MIME type. */
export async function detectFileKind(file: Blob): Promise<FileKind> {
  const head = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "jpeg";
  if (
    head[0] === 0x89 &&
    head[1] === 0x50 &&
    head[2] === 0x4e &&
    head[3] === 0x47 &&
    head[4] === 0x0d &&
    head[5] === 0x0a &&
    head[6] === 0x1a &&
    head[7] === 0x0a
  )
    return "png";
  // PDF header may be preceded by junk bytes; the spec allows it within the first 1024 bytes.
  for (let i = 0; i < head.length - 4; i++) {
    if (head[i] === 0x25 && head[i + 1] === 0x50 && head[i + 2] === 0x44 && head[i + 3] === 0x46 && head[i + 4] === 0x2d) {
      return "pdf";
    }
  }
  return "unknown";
}

export async function readBytes(file: Blob): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** "My Report.final.pdf" -> "My Report.final" */
export function baseName(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  const base = dot > 0 ? fileName.slice(0, dot) : fileName;
  return base.trim() || "document";
}

/** Make a string safe to use as a download file name. */
export function safeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "-").replace(/\s+/g, " ").trim().slice(0, 150) || "document";
}

let idCounter = 0;
export function makeId(prefix = "f"): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

/** Yield to the browser so progress updates can paint during long loops. */
export function nextFrame(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export type ProgressCallback = (fraction: number, label: string) => void;

/** A user-facing error with a friendly message. */
export class ToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolError";
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof ToolError) return error.message;
  if (error instanceof Error && /out of memory|allocation failed|array buffer allocation/i.test(error.message)) {
    return "Your browser ran out of memory while processing. Try smaller files or fewer files at once.";
  }
  return "Something went wrong while processing your file. Please check the file and try again.";
}
