import { PDFDocument, degrees } from "pdf-lib";
import { nextFrame, ToolError, type ProgressCallback } from "./files";
import { copyDocumentInfo, extractPages, loadPdf, savePdf, stampProducer } from "./load";
import { describeRange, type PageRange } from "./page-ranges";

export interface PdfInput {
  name: string;
  bytes: Uint8Array;
}

/** Merge several PDFs, in the given order, into one document. */
export async function mergePdfs(files: PdfInput[], onProgress?: ProgressCallback): Promise<Uint8Array> {
  if (files.length < 2) throw new ToolError("Add at least two PDF files to merge.");
  const out = await PDFDocument.create();
  stampProducer(out);

  for (let i = 0; i < files.length; i++) {
    onProgress?.((i / files.length) * 0.85, `Adding ${files[i].name} (${i + 1} of ${files.length})`);
    await nextFrame();
    const source = await loadPdf(files[i].bytes, files[i].name);
    if (i === 0) copyDocumentInfo(source, out);
    const pages = await out.copyPages(source, source.getPageIndices());
    for (const page of pages) out.addPage(page);
  }

  onProgress?.(0.88, "Saving merged PDF");
  await nextFrame();
  const bytes = await savePdf(out);
  onProgress?.(1, "Done");
  return bytes;
}

export interface SplitPart {
  range: PageRange;
  label: string;
  bytes: Uint8Array;
}

/** Create one PDF per range. */
export async function splitPdf(
  file: PdfInput,
  ranges: PageRange[],
  onProgress?: ProgressCallback
): Promise<SplitPart[]> {
  if (ranges.length === 0) throw new ToolError("Choose at least one page range.");
  const source = await loadPdf(file.bytes, file.name);
  const parts: SplitPart[] = [];

  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];
    onProgress?.((i / ranges.length) * 0.95, `Creating file ${i + 1} of ${ranges.length}`);
    await nextFrame();
    const indexes: number[] = [];
    for (let p = range.start; p <= range.end; p++) indexes.push(p - 1);
    const doc = await extractPages(source, indexes);
    parts.push({ range, label: describeRange(range), bytes: await savePdf(doc) });
  }
  onProgress?.(1, "Done");
  return parts;
}

/**
 * Rotate pages. `turns[i]` is the extra clockwise rotation for page i, in
 * degrees (multiples of 90). Existing page rotation is kept and added to.
 */
export async function rotatePdf(file: PdfInput, turns: number[], onProgress?: ProgressCallback): Promise<Uint8Array> {
  const doc = await loadPdf(file.bytes, file.name);
  const pages = doc.getPages();
  if (turns.length !== pages.length) throw new ToolError("The page list is out of date. Please reload the file.");
  if (turns.every((t) => t % 360 === 0)) throw new ToolError("Rotate at least one page first.");

  pages.forEach((page, i) => {
    const extra = ((turns[i] % 360) + 360) % 360;
    if (extra === 0) return;
    const current = page.getRotation().angle;
    page.setRotation(degrees((((current + extra) % 360) + 360) % 360));
  });
  onProgress?.(0.6, "Saving PDF");
  await nextFrame();
  stampProducer(doc);
  const bytes = await savePdf(doc);
  onProgress?.(1, "Done");
  return bytes;
}

/** Remove the given 0-based pages. Remaining pages are copied into a clean new file. */
export async function deletePages(
  file: PdfInput,
  pagesToDelete: number[],
  onProgress?: ProgressCallback
): Promise<Uint8Array> {
  const source = await loadPdf(file.bytes, file.name);
  const total = source.getPageCount();
  const remove = new Set(pagesToDelete);
  if (remove.size === 0) throw new ToolError("Select at least one page to delete.");
  const keep = source.getPageIndices().filter((i) => !remove.has(i));
  if (keep.length === 0) throw new ToolError("You can't delete every page. Keep at least one page.");
  if (keep.length === total) throw new ToolError("None of the selected pages exist in this PDF.");

  onProgress?.(0.3, "Removing pages");
  await nextFrame();
  const out = await extractPages(source, keep);
  onProgress?.(0.7, "Saving PDF");
  await nextFrame();
  const bytes = await savePdf(out);
  onProgress?.(1, "Done");
  return bytes;
}

/** Quick validation used when a PDF is added: returns its page count. */
export async function inspectPdf(file: PdfInput): Promise<{ pageCount: number }> {
  const doc = await loadPdf(file.bytes, file.name);
  return { pageCount: doc.getPageCount() };
}
