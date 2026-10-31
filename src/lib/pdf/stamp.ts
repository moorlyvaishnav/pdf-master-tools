import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { nextFrame, ToolError, type ProgressCallback } from "./files";
import { loadPdf, savePdf, stampProducer } from "./load";

/*
 * Text placed on pages "as the reader sees them". PDF pages can be stored
 * rotated (/Rotate) and offset (/CropBox); these helpers convert positions in
 * the visible page into PDF coordinates so watermarks and page numbers always
 * land where the user expects, with the text upright.
 */

interface VisualFrame {
  /** Visible width and height (after page rotation). */
  width: number;
  height: number;
  rotation: 0 | 90 | 180 | 270;
  box: { x: number; y: number; width: number; height: number };
}

function frameOf(page: PDFPage): VisualFrame {
  const box = page.getCropBox();
  const rotation = ((((page.getRotation().angle % 360) + 360) % 360) as 0 | 90 | 180 | 270);
  const quarter = rotation === 90 || rotation === 270;
  return { width: quarter ? box.height : box.width, height: quarter ? box.width : box.height, rotation, box };
}

/** Visual point (origin bottom-left of the visible page) to PDF page coordinates. */
function toPage(frame: VisualFrame, vx: number, vy: number): { x: number; y: number } {
  const { box, rotation } = frame;
  switch (rotation) {
    case 90:
      return { x: box.x + box.width - vy, y: box.y + vx };
    case 180:
      return { x: box.x + box.width - vx, y: box.y + box.height - vy };
    case 270:
      return { x: box.x + vy, y: box.y + box.height - vx };
    default:
      return { x: box.x + vx, y: box.y + vy };
  }
}

interface DrawSpec {
  text: string;
  font: PDFFont;
  size: number;
  color: { r: number; g: number; b: number };
  opacity: number;
  /** Visual rotation in degrees, counter-clockwise. */
  angle: number;
  /** Visual centre of the text. */
  cx: number;
  cy: number;
}

/** Draw text centred on a visual point, rotated by a visual angle. */
function drawCentered(page: PDFPage, frame: VisualFrame, spec: DrawSpec) {
  const width = spec.font.widthOfTextAtSize(spec.text, spec.size);
  const capHeight = spec.font.heightAtSize(spec.size, { descender: false });
  const rad = (spec.angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  // Text origin (baseline start) = centre - rotated half-size vector.
  const ox = spec.cx - (cos * width) / 2 + (sin * capHeight) / 2;
  const oy = spec.cy - (sin * width) / 2 - (cos * capHeight) / 2;
  const origin = toPage(frame, ox, oy);
  page.drawText(spec.text, {
    x: origin.x,
    y: origin.y,
    size: spec.size,
    font: spec.font,
    color: rgb(spec.color.r, spec.color.g, spec.color.b),
    opacity: spec.opacity,
    rotate: degrees(spec.angle + frame.rotation),
  });
}

/** Half extents of the rotated text's bounding box, used to keep it inside the page. */
function halfExtents(font: PDFFont, text: string, size: number, angle: number) {
  const w = font.widthOfTextAtSize(text, size) / 2;
  const h = font.heightAtSize(size, { descender: false }) / 2;
  const rad = (angle * Math.PI) / 180;
  return {
    ex: Math.abs(w * Math.cos(rad)) + Math.abs(h * Math.sin(rad)),
    ey: Math.abs(w * Math.sin(rad)) + Math.abs(h * Math.cos(rad)),
  };
}

export function parseHexColor(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return { r: 0, g: 0, b: 0 };
  const n = parseInt(m[1], 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

/** Standard PDF fonts only cover Latin (WinAnsi) characters; check before drawing. */
function assertEncodable(font: PDFFont, text: string, what: string) {
  try {
    font.encodeText(text);
  } catch {
    throw new ToolError(
      `The ${what} contains characters that the built-in PDF fonts can't show. Please use Latin letters, numbers and common symbols.`
    );
  }
}

export function canEncodeLatin(text: string): boolean {
  // WinAnsi covers ASCII plus Latin-1 and a few typographic symbols.
  return /^[ -~ -ÿ–—‘’“”•…€™]*$/.test(text);
}

/* ───────────────────────────── Watermark ───────────────────────────── */

export type WatermarkPosition =
  | "center"
  | "top"
  | "bottom"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "tile";

export interface WatermarkOptions {
  text: string;
  fontSize: number;
  color: string; // #rrggbb
  opacity: number; // 0-1
  rotation: number; // degrees, counter-clockwise as seen by the reader
  position: WatermarkPosition;
  bold: boolean;
}

const EDGE = 24; // distance from the page edge, in points

function watermarkCentres(frame: VisualFrame, position: WatermarkPosition, ex: number, ey: number) {
  const { width: W, height: H } = frame;
  const left = Math.min(W / 2, EDGE + ex);
  const right = Math.max(W / 2, W - EDGE - ex);
  const bottom = Math.min(H / 2, EDGE + ey);
  const top = Math.max(H / 2, H - EDGE - ey);
  switch (position) {
    case "top":
      return [{ cx: W / 2, cy: top }];
    case "bottom":
      return [{ cx: W / 2, cy: bottom }];
    case "top-left":
      return [{ cx: left, cy: top }];
    case "top-right":
      return [{ cx: right, cy: top }];
    case "bottom-left":
      return [{ cx: left, cy: bottom }];
    case "bottom-right":
      return [{ cx: right, cy: bottom }];
    case "tile": {
      const stepX = Math.max(ex * 2 + 60, 140);
      const stepY = Math.max(ey * 2 + 60, 120);
      const points: { cx: number; cy: number }[] = [];
      for (let row = 0, cy = stepY / 2; cy < H + stepY / 2; cy += stepY, row++) {
        const shift = row % 2 ? stepX / 2 : 0; // stagger rows
        for (let cx = stepX / 2 - shift; cx < W + stepX / 2; cx += stepX) points.push({ cx, cy });
        if (points.length > 400) break;
      }
      return points;
    }
    default:
      return [{ cx: W / 2, cy: H / 2 }];
  }
}

export async function applyWatermark(doc: PDFDocument, pageIndexes: number[], options: WatermarkOptions, onProgress?: ProgressCallback) {
  const text = options.text.trim();
  if (!text) throw new ToolError("Enter the watermark text.");
  const font = await doc.embedFont(options.bold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica);
  assertEncodable(font, text, "watermark text");
  const color = parseHexColor(options.color);
  const pages = doc.getPages();
  for (let n = 0; n < pageIndexes.length; n++) {
    const page = pages[pageIndexes[n]];
    const frame = frameOf(page);
    const { ex, ey } = halfExtents(font, text, options.fontSize, options.rotation);
    for (const { cx, cy } of watermarkCentres(frame, options.position, ex, ey)) {
      drawCentered(page, frame, {
        text,
        font,
        size: options.fontSize,
        color,
        opacity: options.opacity,
        angle: options.rotation,
        cx,
        cy,
      });
    }
    if (n % 20 === 0) {
      onProgress?.((n / pageIndexes.length) * 0.8, `Watermarking page ${n + 1} of ${pageIndexes.length}`);
      await nextFrame();
    }
  }
}

/* ──────────────────────────── Page numbers ─────────────────────────── */

export type NumberVertical = "top" | "bottom";
export type NumberHorizontal = "left" | "center" | "right";
export type NumberFormat = "n" | "page-n" | "page-n-of-total" | "n-of-total";

export interface PageNumberOptions {
  vertical: NumberVertical;
  horizontal: NumberHorizontal;
  fontSize: number;
  startAt: number;
  format: NumberFormat;
  color: string;
  /** Distance from the page edge in points. */
  margin: number;
}

export function formatPageNumber(format: NumberFormat, n: number, total: number): string {
  switch (format) {
    case "page-n":
      return `Page ${n}`;
    case "page-n-of-total":
      return `Page ${n} of ${total}`;
    case "n-of-total":
      return `${n} / ${total}`;
    default:
      return `${n}`;
  }
}

export async function applyPageNumbers(
  doc: PDFDocument,
  pageIndexes: number[],
  options: PageNumberOptions,
  onProgress?: ProgressCallback,
  /** Override numbering (used by previews, which contain only one page). */
  numbering?: { first: number; total: number }
) {
  if (!Number.isInteger(options.startAt) || options.startAt < 0) throw new ToolError("The starting number must be 0 or more.");
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const color = parseHexColor(options.color);
  const pages = doc.getPages();
  const total = numbering?.total ?? options.startAt + pageIndexes.length - 1;
  for (let n = 0; n < pageIndexes.length; n++) {
    const page = pages[pageIndexes[n]];
    const frame = frameOf(page);
    const label = formatPageNumber(options.format, (numbering?.first ?? options.startAt) + n, total);
    const { ex, ey } = halfExtents(font, label, options.fontSize, 0);
    const cx =
      options.horizontal === "left" ? options.margin + ex : options.horizontal === "right" ? frame.width - options.margin - ex : frame.width / 2;
    const cy = options.vertical === "top" ? frame.height - options.margin - ey : options.margin + ey;
    drawCentered(page, frame, { text: label, font, size: options.fontSize, color, opacity: 1, angle: 0, cx, cy });
    if (n % 25 === 0) {
      onProgress?.((n / pageIndexes.length) * 0.8, `Numbering page ${n + 1} of ${pageIndexes.length}`);
      await nextFrame();
    }
  }
}

/* ─────────────────────────── Whole-file helpers ────────────────────── */

export async function watermarkPdf(
  file: { name: string; bytes: Uint8Array },
  pageIndexes: number[],
  options: WatermarkOptions,
  onProgress?: ProgressCallback
): Promise<Uint8Array> {
  if (pageIndexes.length === 0) throw new ToolError("Choose at least one page.");
  const doc = await loadPdf(file.bytes, file.name);
  await applyWatermark(doc, pageIndexes, options, onProgress);
  stampProducer(doc);
  onProgress?.(0.85, "Saving PDF");
  await nextFrame();
  const bytes = await savePdf(doc);
  onProgress?.(1, "Done");
  return bytes;
}

export async function numberPdf(
  file: { name: string; bytes: Uint8Array },
  pageIndexes: number[],
  options: PageNumberOptions,
  onProgress?: ProgressCallback
): Promise<Uint8Array> {
  if (pageIndexes.length === 0) throw new ToolError("Choose at least one page.");
  const doc = await loadPdf(file.bytes, file.name);
  await applyPageNumbers(doc, pageIndexes, options, onProgress);
  stampProducer(doc);
  onProgress?.(0.85, "Saving PDF");
  await nextFrame();
  const bytes = await savePdf(doc);
  onProgress?.(1, "Done");
  return bytes;
}

/** Build a one-page PDF showing the result on a single page, for live previews. */
export async function previewSinglePage(
  source: PDFDocument,
  pageIndex: number,
  apply: (doc: PDFDocument) => Promise<void>
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const [page] = await doc.copyPages(source, [pageIndex]);
  doc.addPage(page);
  await apply(doc);
  return doc.save({ useObjectStreams: false });
}
