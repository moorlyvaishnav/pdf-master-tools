import { safeFileName } from "./files";

export interface OutputFile {
  name: string;
  blob: Blob;
}

export function pdfBlob(bytes: Uint8Array): Blob {
  // Copy into a fresh ArrayBuffer so the Blob never shares memory with pdf-lib buffers.
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy.buffer], { type: "application/pdf" });
}

/** Bundle several files into a ZIP (JSZip is loaded only when needed). */
export async function zipFiles(
  files: { name: string; bytes: Uint8Array }[],
  onProgress?: (fraction: number) => void
): Promise<Blob> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const used = new Set<string>();
  for (const file of files) {
    let name = safeFileName(file.name);
    let n = 2;
    while (used.has(name)) name = safeFileName(file.name.replace(/(\.[^.]+)?$/, ` (${n++})$1`));
    used.add(name);
    zip.file(name, file.bytes);
  }
  return zip.generateAsync({ type: "blob", compression: "STORE", mimeType: "application/zip" }, (meta) =>
    onProgress?.(meta.percent / 100)
  );
}

/** Trigger a browser download for a Blob. */
export function downloadFile(file: OutputFile): void {
  const url = URL.createObjectURL(file.blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = safeFileName(file.name);
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give the browser time to start the download before releasing memory.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
