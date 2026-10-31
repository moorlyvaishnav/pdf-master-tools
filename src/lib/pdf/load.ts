import { PDFDocument } from "pdf-lib";
import { ToolError } from "./files";

/** Load a PDF with pdf-lib, turning library errors into friendly messages. */
export async function loadPdf(bytes: Uint8Array, fileName: string): Promise<PDFDocument> {
  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    const message = error instanceof Error ? error.message : "";
    if (name === "EncryptedPDFError" || /encrypt/i.test(message)) {
      throw new ToolError(
        `"${fileName}" is password-protected or encrypted. Remove the protection first, then try again.`
      );
    }
    throw new ToolError(`"${fileName}" could not be read. The file may be damaged or not a valid PDF.`);
  }
  // pdf-lib parses damaged files leniently; reading the page tree confirms the file is usable.
  let pageCount: number;
  try {
    pageCount = doc.getPageCount();
    doc.getPages();
  } catch {
    throw new ToolError(`"${fileName}" could not be read. The file may be damaged or not a valid PDF.`);
  }
  if (pageCount === 0) {
    throw new ToolError(`"${fileName}" has no pages.`);
  }
  return doc;
}

/** Copy basic document information (title, author...) to a new document. */
export function copyDocumentInfo(from: PDFDocument, to: PDFDocument): void {
  try {
    const title = from.getTitle();
    const author = from.getAuthor();
    const subject = from.getSubject();
    const keywords = from.getKeywords();
    if (title) to.setTitle(title);
    if (author) to.setAuthor(author);
    if (subject) to.setSubject(subject);
    if (keywords) to.setKeywords([keywords]);
  } catch {
    // Metadata is optional; never fail a job because of it.
  }
}

export function stampProducer(doc: PDFDocument): void {
  doc.setProducer("PDF Master Tools");
  doc.setCreator("PDF Master Tools");
}

/** Copy the given 0-based pages from `source` into a new document. */
export async function extractPages(source: PDFDocument, indexes: number[]): Promise<PDFDocument> {
  const out = await PDFDocument.create();
  copyDocumentInfo(source, out);
  stampProducer(out);
  const pages = await out.copyPages(source, indexes);
  for (const page of pages) out.addPage(page);
  return out;
}

export async function savePdf(doc: PDFDocument): Promise<Uint8Array> {
  // objectsPerTick keeps the page responsive while large files are written.
  return doc.save({ objectsPerTick: 50 });
}
