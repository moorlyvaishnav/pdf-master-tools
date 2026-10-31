import {
  PDFArray,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFRawStream,
  PDFRef,
  PDFStream,
  type PDFDocument,
  type PDFObject,
} from "pdf-lib";
import { nextFrame, ToolError, type ProgressCallback } from "./files";
import { loadPdf } from "./load";

/*
 * Browser-side PDF compression.
 *
 * What it does (all inside the browser):
 *  1. Re-encodes large photos/scans (JPEG and 8-bit RGB/gray images) at a lower
 *     resolution and JPEG quality, keeping a new image only if it is smaller.
 *  2. Losslessly compresses streams that were stored without compression.
 *  3. Drops objects that nothing in the document refers to.
 *  4. Saves with compressed object streams.
 *
 * What it cannot do: shrink fonts, vector drawings or text, or images in
 * exotic formats (JPEG 2000, JBIG2, CMYK, indexed colour). PDFs made mostly of
 * those often can't be made meaningfully smaller - and we say so.
 */

export type CompressionLevel = "low" | "recommended" | "high";

export const COMPRESSION_LEVELS: Record<
  CompressionLevel,
  { maxSide: number; quality: number; recodeLossless: boolean; label: string; description: string }
> = {
  low: {
    maxSide: 2400,
    quality: 0.85,
    recodeLossless: false,
    label: "Low",
    description: "Best quality. Only very large photos are reduced.",
  },
  recommended: {
    maxSide: 1700,
    quality: 0.72,
    recodeLossless: true,
    label: "Recommended",
    description: "Good balance of quality and size for sharing and email.",
  },
  high: {
    maxSide: 1100,
    quality: 0.55,
    recodeLossless: true,
    label: "High",
    description: "Smallest file. Images become noticeably softer.",
  },
};

/** Re-encodes pixels as JPEG. Injected so the logic can run in the browser (canvas). */
export interface ImageRecoder {
  /** Encode a JPEG file (bytes) again at a smaller size/quality. */
  fromJpeg(bytes: Uint8Array, maxSide: number, quality: number): Promise<EncodedImage | null>;
  /** Encode raw 8-bit pixels (1 or 3 channels) as JPEG. */
  fromPixels(pixels: Uint8Array, width: number, height: number, channels: 1 | 3, maxSide: number, quality: number): Promise<EncodedImage | null>;
}

export interface EncodedImage {
  bytes: Uint8Array;
  width: number;
  height: number;
}

export interface CompressionResult {
  bytes: Uint8Array;
  originalSize: number;
  newSize: number;
  imagesFound: number;
  imagesReduced: number;
  streamsCompressed: number;
  objectsRemoved: number;
}

const MIN_IMAGE_BYTES = 20 * 1024; // smaller images aren't worth re-encoding
const MAX_IMAGE_PIXELS = 40_000_000; // avoid exhausting memory on giant images
const KEEP_IF_SAVES = 0.9; // only keep a re-encoded image if it is at least 10% smaller

/* ───────────────────────── Compression Streams helpers ───────────────────────── */

async function pipeThrough(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const out = new Response(new Blob([copy.buffer]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}

const inflate = (bytes: Uint8Array) => pipeThrough(bytes, new DecompressionStream("deflate"));
const deflate = (bytes: Uint8Array) => pipeThrough(bytes, new CompressionStream("deflate"));

/** Undo PNG row filters (PDF FlateDecode with /Predictor 10-15). */
function unfilterPng(data: Uint8Array, columns: number, colors: number): Uint8Array | null {
  const bpp = colors; // 8 bits per component only
  const rowLength = columns * colors;
  const rows = Math.floor(data.length / (rowLength + 1));
  const out = new Uint8Array(rows * rowLength);
  for (let r = 0; r < rows; r++) {
    const filter = data[r * (rowLength + 1)];
    const src = r * (rowLength + 1) + 1;
    const dst = r * rowLength;
    for (let i = 0; i < rowLength; i++) {
      const raw = data[src + i];
      const left = i >= bpp ? out[dst + i - bpp] : 0;
      const up = r > 0 ? out[dst - rowLength + i] : 0;
      const upLeft = r > 0 && i >= bpp ? out[dst - rowLength + i - bpp] : 0;
      let value: number;
      switch (filter) {
        case 0:
          value = raw;
          break;
        case 1:
          value = raw + left;
          break;
        case 2:
          value = raw + up;
          break;
        case 3:
          value = raw + ((left + up) >> 1);
          break;
        case 4: {
          const p = left + up - upLeft;
          const pa = Math.abs(p - left);
          const pb = Math.abs(p - up);
          const pc = Math.abs(p - upLeft);
          value = raw + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft);
          break;
        }
        default:
          return null;
      }
      out[dst + i] = value & 0xff;
    }
  }
  return out;
}

/** ASCII85Decode (common in PDFs made by some generators, e.g. ReportLab). */
function decodeAscii85(data: Uint8Array): Uint8Array | null {
  const out: number[] = [];
  let group = 0;
  let count = 0;
  const start = data[0] === 0x3c && data[1] === 0x7e ? 2 : 0; // optional "<~" prefix
  for (let i = start; i < data.length; i++) {
    const c = data[i];
    if (c === 0x7e) break; // "~>" end marker
    if (c <= 0x20) continue; // whitespace
    if (c === 0x7a && count === 0) {
      out.push(0, 0, 0, 0); // "z" = four zero bytes
      continue;
    }
    if (c < 0x21 || c > 0x75) return null;
    group = group * 85 + (c - 0x21);
    if (++count === 5) {
      out.push((group >>> 24) & 255, (group >>> 16) & 255, (group >>> 8) & 255, group & 255);
      group = 0;
      count = 0;
    }
  }
  if (count > 0) {
    for (let k = count; k < 5; k++) group = group * 85 + 84;
    const bytes = [(group >>> 24) & 255, (group >>> 16) & 255, (group >>> 8) & 255, group & 255];
    out.push(...bytes.slice(0, count - 1));
  }
  return new Uint8Array(out);
}

/** ASCIIHexDecode. */
function decodeAsciiHex(data: Uint8Array): Uint8Array {
  const text = new TextDecoder("latin1").decode(data).split(">")[0].replace(/[^0-9a-fA-F]/g, "");
  const padded = text.length % 2 ? `${text}0` : text;
  const out = new Uint8Array(padded.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(padded.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function parmsAt(dict: PDFDict, index: number): PDFDict | undefined {
  const parms = dict.lookup(PDFName.of("DecodeParms"));
  if (parms instanceof PDFDict) return index === 0 ? parms : undefined;
  if (parms instanceof PDFArray) {
    const entry = parms.lookup(index);
    return entry instanceof PDFDict ? entry : undefined;
  }
  return undefined;
}

/**
 * Undo the transport/compression filters in front of an image. Returns the
 * JPEG bytes (final filter DCTDecode) or raw pixels (no image filter), or null
 * for anything we don't handle (JPEG 2000, JBIG2, CCITT, LZW, TIFF predictor...).
 */
async function decodeImageStream(
  dict: PDFDict,
  contents: Uint8Array,
  width: number,
  channels: number
): Promise<{ kind: "jpeg" | "pixels"; bytes: Uint8Array } | null> {
  const filters = filterNames(dict);
  let data: Uint8Array | null = contents;
  for (let i = 0; i < filters.length; i++) {
    const name = filters[i];
    const last = i === filters.length - 1;
    if (name === "DCTDecode") return last ? { kind: "jpeg", bytes: data } : null;
    if (name === "ASCII85Decode" || name === "A85") data = decodeAscii85(data);
    else if (name === "ASCIIHexDecode" || name === "AHx") data = decodeAsciiHex(data);
    else if (name === "FlateDecode" || name === "Fl") {
      data = await inflate(data);
      const parms = parmsAt(dict, i);
      const predictor = parms ? numberOf(parms, "Predictor") ?? 1 : 1;
      if (predictor >= 10) data = unfilterPng(data, width, channels);
      else if (predictor !== 1) return null; // TIFF predictor: rare, skip
    } else return null;
    if (!data) return null;
  }
  return { kind: "pixels", bytes: data };
}

/* ─────────────────────────────── Image analysis ─────────────────────────────── */

function filterNames(dict: PDFDict): string[] {
  const filter = dict.lookup(PDFName.of("Filter"));
  if (filter instanceof PDFName) return [filter.decodeText()];
  if (filter instanceof PDFArray) {
    return filter.asArray().map((f) => (f instanceof PDFName ? f.decodeText() : "?"));
  }
  return [];
}

/** Number of colour channels for simple colour spaces; null for anything we don't re-encode. */
function channelsOf(dict: PDFDict, doc: PDFDocument): 1 | 3 | 4 | null {
  const cs = dict.lookup(PDFName.of("ColorSpace"));
  if (cs instanceof PDFName) {
    const name = cs.decodeText();
    if (name === "DeviceRGB" || name === "CalRGB") return 3;
    if (name === "DeviceGray" || name === "CalGray") return 1;
    if (name === "DeviceCMYK") return 4;
    return null;
  }
  if (cs instanceof PDFArray && cs.size() >= 2) {
    const family = cs.lookup(0);
    if (family instanceof PDFName && family.decodeText() === "ICCBased") {
      const profile = doc.context.lookup(cs.get(1));
      const n = profile instanceof PDFStream ? profile.dict.lookup(PDFName.of("N")) : undefined;
      if (n instanceof PDFNumber) {
        const value = n.asNumber();
        return value === 3 ? 3 : value === 1 ? 1 : value === 4 ? 4 : null;
      }
    }
    if (family instanceof PDFName && (family.decodeText() === "CalRGB" || family.decodeText() === "CalGray")) {
      return family.decodeText() === "CalRGB" ? 3 : 1;
    }
  }
  return null;
}

function numberOf(dict: PDFDict, key: string): number | undefined {
  const value = dict.lookup(PDFName.of(key));
  return value instanceof PDFNumber ? value.asNumber() : undefined;
}

/** Images used as soft masks / stencil masks must stay exactly as they are. */
function collectMaskRefs(doc: PDFDocument): Set<string> {
  const masks = new Set<string>();
  for (const [, object] of doc.context.enumerateIndirectObjects()) {
    if (!(object instanceof PDFRawStream)) continue;
    for (const key of ["SMask", "Mask"]) {
      const value = object.dict.get(PDFName.of(key));
      if (value instanceof PDFRef) masks.add(value.toString());
    }
  }
  return masks;
}

async function recodeImage(
  doc: PDFDocument,
  stream: PDFRawStream,
  level: (typeof COMPRESSION_LEVELS)[CompressionLevel],
  recoder: ImageRecoder
): Promise<PDFRawStream | null> {
  const dict = stream.dict;
  const width = numberOf(dict, "Width");
  const height = numberOf(dict, "Height");
  if (!width || !height || width * height > MAX_IMAGE_PIXELS) return null;
  if (stream.contents.length < MIN_IMAGE_BYTES) return null;
  if (dict.has(PDFName.of("Decode")) || dict.lookup(PDFName.of("ImageMask"))?.toString() === "true") return null;
  if (dict.lookup(PDFName.of("Mask")) instanceof PDFArray) return null; // colour-key masks depend on exact colours
  const channels = channelsOf(dict, doc);
  if (channels !== 1 && channels !== 3) return null; // CMYK, indexed, spot colours: leave untouched
  const bpc = numberOf(dict, "BitsPerComponent");
  let decoded: Awaited<ReturnType<typeof decodeImageStream>>;
  try {
    decoded = await decodeImageStream(dict, stream.contents, width, channels);
  } catch {
    return null; // damaged data: leave the image exactly as it is
  }
  if (!decoded) return null;

  let encoded: EncodedImage | null = null;
  if (decoded.kind === "jpeg") {
    encoded = await recoder.fromJpeg(decoded.bytes, level.maxSide, level.quality);
  } else {
    // Lossless (PNG-like) images are only converted to JPEG at the stronger levels.
    if (!level.recodeLossless || bpc !== 8 || decoded.bytes.length < width * height * channels) return null;
    encoded = await recoder.fromPixels(decoded.bytes, width, height, channels, level.maxSide, level.quality);
  }

  if (!encoded || encoded.bytes.length >= stream.contents.length * KEEP_IF_SAVES) return null;

  const newDict = dict.clone(doc.context);
  newDict.set(PDFName.of("Width"), PDFNumber.of(encoded.width));
  newDict.set(PDFName.of("Height"), PDFNumber.of(encoded.height));
  newDict.set(PDFName.of("BitsPerComponent"), PDFNumber.of(8));
  newDict.set(PDFName.of("ColorSpace"), PDFName.of("DeviceRGB"));
  newDict.set(PDFName.of("Filter"), PDFName.of("DCTDecode"));
  newDict.delete(PDFName.of("DecodeParms"));
  newDict.set(PDFName.of("Length"), PDFNumber.of(encoded.bytes.length));
  return PDFRawStream.of(newDict, encoded.bytes);
}

/* ─────────────────────────────── Unused objects ─────────────────────────────── */

function removeUnreachable(doc: PDFDocument): number {
  const context = doc.context;
  const seen = new Set<string>();
  const stack: PDFObject[] = [];
  const { Root, Info } = context.trailerInfo;
  if (Root) stack.push(Root);
  if (Info) stack.push(Info);
  while (stack.length) {
    const object = stack.pop()!;
    if (object instanceof PDFRef) {
      const key = object.toString();
      if (seen.has(key)) continue;
      seen.add(key);
      const target = context.lookup(object);
      if (target) stack.push(target);
    } else if (object instanceof PDFDict) {
      for (const [, value] of object.entries()) stack.push(value);
    } else if (object instanceof PDFArray) {
      for (const value of object.asArray()) stack.push(value);
    } else if (object instanceof PDFStream) {
      stack.push(object.dict);
    }
  }
  if (seen.size === 0) return 0; // safety: never delete everything
  let removed = 0;
  for (const [ref] of context.enumerateIndirectObjects()) {
    if (!seen.has(ref.toString())) {
      context.delete(ref);
      removed++;
    }
  }
  return removed;
}

/* ─────────────────────────────────── Main ──────────────────────────────────── */

export async function compressPdf(
  file: { name: string; bytes: Uint8Array },
  level: CompressionLevel,
  recoder: ImageRecoder,
  onProgress?: ProgressCallback
): Promise<CompressionResult> {
  if (typeof CompressionStream === "undefined" || typeof DecompressionStream === "undefined") {
    throw new ToolError("Your browser is too old for PDF compression. Please update it or try Chrome, Edge, Firefox or Safari.");
  }
  const settings = COMPRESSION_LEVELS[level];
  onProgress?.(0.02, "Reading PDF");
  const doc = await loadPdf(file.bytes, file.name);
  const context = doc.context;

  const objectsRemoved = removeUnreachable(doc);
  const masks = collectMaskRefs(doc);
  const entries = context.enumerateIndirectObjects();
  const images = entries.filter(
    ([ref, object]) =>
      object instanceof PDFRawStream &&
      object.dict.lookup(PDFName.of("Subtype")) === PDFName.of("Image") &&
      !masks.has(ref.toString())
  ) as [PDFRef, PDFRawStream][];

  let imagesReduced = 0;
  for (let i = 0; i < images.length; i++) {
    const [ref, stream] = images[i];
    onProgress?.(0.05 + (i / Math.max(1, images.length)) * 0.75, `Optimising image ${i + 1} of ${images.length}`);
    await nextFrame();
    try {
      const replacement = await recodeImage(doc, stream, settings, recoder);
      if (replacement) {
        context.assign(ref, replacement);
        imagesReduced++;
      }
    } catch (error) {
      console.warn("Skipped an image that could not be re-encoded", error);
    }
  }

  // Lossless: compress streams that were stored uncompressed.
  onProgress?.(0.82, "Compressing page data");
  let streamsCompressed = 0;
  for (const [ref, object] of context.enumerateIndirectObjects()) {
    if (!(object instanceof PDFRawStream) || object.dict.has(PDFName.of("Filter"))) continue;
    if (object.contents.length < 512) continue;
    const packed = await deflate(object.contents);
    if (packed.length < object.contents.length * 0.9) {
      const dict = object.dict.clone(context);
      dict.set(PDFName.of("Filter"), PDFName.of("FlateDecode"));
      dict.delete(PDFName.of("DecodeParms"));
      dict.set(PDFName.of("Length"), PDFNumber.of(packed.length));
      context.assign(ref, PDFRawStream.of(dict, packed));
      streamsCompressed++;
    }
  }

  onProgress?.(0.9, "Saving PDF");
  await nextFrame();
  const bytes = await doc.save({ useObjectStreams: true, objectsPerTick: 50, updateFieldAppearances: false });
  onProgress?.(1, "Done");
  return {
    bytes,
    originalSize: file.bytes.length,
    newSize: bytes.length,
    imagesFound: images.length,
    imagesReduced,
    streamsCompressed,
    objectsRemoved,
  };
}

/* ─────────────────────────── Browser image re-encoder ───────────────────────── */

function fitSize(width: number, height: number, maxSide: number) {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

async function canvasToJpeg(source: CanvasImageSource, width: number, height: number, quality: number): Promise<Uint8Array | null> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  canvas.width = 0;
  canvas.height = 0;
  return blob ? new Uint8Array(await blob.arrayBuffer()) : null;
}

/** Re-encoder using the browser's own image decoder and canvas. */
export const browserImageRecoder: ImageRecoder = {
  async fromJpeg(bytes, maxSide, quality) {
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    let bitmap: ImageBitmap;
    try {
      bitmap = await createImageBitmap(new Blob([copy.buffer], { type: "image/jpeg" }));
    } catch {
      return null; // the browser can't decode this JPEG variant: leave it untouched
    }
    try {
      const size = fitSize(bitmap.width, bitmap.height, maxSide);
      const jpeg = await canvasToJpeg(bitmap, size.width, size.height, quality);
      return jpeg ? { bytes: jpeg, ...size } : null;
    } finally {
      bitmap.close();
    }
  },
  async fromPixels(pixels, width, height, channels, maxSide, quality) {
    const rgba = new Uint8ClampedArray(width * height * 4);
    for (let i = 0, j = 0; i < width * height; i++, j += channels) {
      const o = i * 4;
      if (channels === 3) {
        rgba[o] = pixels[j];
        rgba[o + 1] = pixels[j + 1];
        rgba[o + 2] = pixels[j + 2];
      } else {
        rgba[o] = rgba[o + 1] = rgba[o + 2] = pixels[j];
      }
      rgba[o + 3] = 255;
    }
    const bitmap = await createImageBitmap(new ImageData(rgba, width, height));
    try {
      const size = fitSize(width, height, maxSide);
      const jpeg = await canvasToJpeg(bitmap, size.width, size.height, quality);
      return jpeg ? { bytes: jpeg, ...size } : null;
    } finally {
      bitmap.close();
    }
  },
};
