import { PDFDocument, degrees, type PDFImage } from "pdf-lib";
import { nextFrame, ToolError, type ProgressCallback } from "./files";

export type PageSizeOption = "fit" | "a4" | "letter";
export type OrientationOption = "auto" | "portrait" | "landscape";
export type MarginOption = "none" | "small" | "large";

export interface ImagesToPdfOptions {
  pageSize: PageSizeOption;
  orientation: OrientationOption;
  margin: MarginOption;
}

export interface ImageInput {
  name: string;
  kind: "jpeg" | "png";
  bytes: Uint8Array;
}

// Page sizes in PDF points (1 pt = 1/72 inch).
const PAGE_SIZES: Record<Exclude<PageSizeOption, "fit">, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};
const MARGINS: Record<MarginOption, number> = { none: 0, small: 20, large: 50 };

/**
 * Read the EXIF orientation tag (1-8) from a JPEG. Phones store photos
 * sideways and rely on this tag, so we must apply it ourselves.
 */
export function readJpegOrientation(bytes: Uint8Array): number {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return 1;
  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    const marker = view.getUint16(offset);
    if ((marker & 0xff00) !== 0xff00) return 1;
    const length = view.getUint16(offset + 2);
    if (marker === 0xffe1 && offset + 10 <= view.byteLength && view.getUint32(offset + 4) === 0x45786966) {
      // "Exif\0\0" then TIFF header
      const tiff = offset + 10;
      if (tiff + 8 > view.byteLength) return 1;
      const little = view.getUint16(tiff) === 0x4949;
      const ifd = tiff + view.getUint32(tiff + 4, little);
      if (ifd + 2 > view.byteLength) return 1;
      const entries = view.getUint16(ifd, little);
      for (let i = 0; i < entries; i++) {
        const entry = ifd + 2 + i * 12;
        if (entry + 10 > view.byteLength) return 1;
        if (view.getUint16(entry, little) === 0x0112) {
          const value = view.getUint16(entry + 8, little);
          return value >= 1 && value <= 8 ? value : 1;
        }
      }
      return 1;
    }
    if (marker === 0xffda) return 1; // start of image data; no EXIF found
    offset += 2 + length;
  }
  return 1;
}

/** Clockwise rotation (degrees) needed to display an image upright for an EXIF orientation. */
function orientationToRotation(orientation: number): 0 | 90 | 180 | 270 {
  switch (orientation) {
    case 3:
    case 4:
      return 180;
    case 5:
    case 6:
      return 90;
    case 7:
    case 8:
      return 270;
    default:
      return 0;
  }
}

async function embedImage(doc: PDFDocument, image: ImageInput): Promise<PDFImage> {
  try {
    return image.kind === "jpeg" ? await doc.embedJpg(image.bytes) : await doc.embedPng(image.bytes);
  } catch {
    throw new ToolError(`"${image.name}" could not be read. The image may be damaged or in an unsupported variant.`);
  }
}

/** Convert JPG/PNG images into one PDF, one image per page. */
export async function imagesToPdf(
  images: ImageInput[],
  options: ImagesToPdfOptions,
  onProgress?: ProgressCallback
): Promise<Uint8Array> {
  if (images.length === 0) throw new ToolError("Add at least one image.");

  const doc = await PDFDocument.create();
  doc.setTitle(images.length === 1 ? images[0].name : "Images");
  doc.setProducer("PDF Master Tools");
  doc.setCreator("PDF Master Tools");
  const margin = MARGINS[options.margin];

  for (let i = 0; i < images.length; i++) {
    const input = images[i];
    onProgress?.(i / images.length * 0.9, `Adding image ${i + 1} of ${images.length}`);
    await nextFrame();

    const embedded = await embedImage(doc, input);
    const rotation = input.kind === "jpeg" ? orientationToRotation(readJpegOrientation(input.bytes)) : 0;
    const quarterTurn = rotation === 90 || rotation === 270;
    // Size of the image as it should appear (after applying EXIF rotation).
    const shownW = quarterTurn ? embedded.height : embedded.width;
    const shownH = quarterTurn ? embedded.width : embedded.height;

    let pageW: number;
    let pageH: number;
    if (options.pageSize === "fit") {
      // Images are embedded at 72 dpi equivalent: 1 pixel = 1 point.
      pageW = shownW + margin * 2;
      pageH = shownH + margin * 2;
    } else {
      const [w, h] = PAGE_SIZES[options.pageSize];
      const landscape =
        options.orientation === "landscape" || (options.orientation === "auto" && shownW > shownH);
      [pageW, pageH] = landscape ? [h, w] : [w, h];
    }

    const boxW = pageW - margin * 2;
    const boxH = pageH - margin * 2;
    const scale = options.pageSize === "fit" ? 1 : Math.min(boxW / shownW, boxH / shownH);
    const drawShownW = shownW * scale;
    const drawShownH = shownH * scale;
    // Bottom-left corner of the upright image, centred on the page.
    const x0 = (pageW - drawShownW) / 2;
    const y0 = (pageH - drawShownH) / 2;
    // Stored (unrotated) draw size.
    const w = embedded.width * scale;
    const h = embedded.height * scale;

    const page = doc.addPage([pageW, pageH]);
    // pdf-lib rotates counter-clockwise around (x, y); offsets keep the image inside its box.
    if (rotation === 0) page.drawImage(embedded, { x: x0, y: y0, width: w, height: h });
    else if (rotation === 90) page.drawImage(embedded, { x: x0, y: y0 + w, width: w, height: h, rotate: degrees(-90) });
    else if (rotation === 180) page.drawImage(embedded, { x: x0 + w, y: y0 + h, width: w, height: h, rotate: degrees(180) });
    else page.drawImage(embedded, { x: x0 + h, y: y0, width: w, height: h, rotate: degrees(90) });
  }

  onProgress?.(0.92, "Saving PDF");
  await nextFrame();
  const bytes = await doc.save({ objectsPerTick: 50 });
  onProgress?.(1, "Done");
  return bytes;
}
