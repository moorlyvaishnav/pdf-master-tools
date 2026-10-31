/**
 * PDF page thumbnails with pdf.js.
 *
 * pdf.js is served as static files from /public/pdfjs and imported at runtime
 * (not bundled). This keeps it out of the main JavaScript bundle and avoids
 * bundler issues; it is only downloaded when a user opens a PDF tool.
 */

export const PDFJS_VERSION = "6.2.108";
const BASE = "/pdfjs/";

// Minimal typings for the parts of the pdf.js API we use.
interface PdfjsViewport {
  width: number;
  height: number;
}
interface PdfjsPage {
  getViewport(params: { scale: number; rotation?: number }): PdfjsViewport;
  render(params: {
    canvas: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;
    viewport: PdfjsViewport;
  }): { promise: Promise<void>; cancel(): void };
  cleanup(): void;
}
interface PdfjsDocument {
  numPages: number;
  getPage(pageNumber: number): Promise<PdfjsPage>;
  destroy(): Promise<void>;
}
interface PdfjsLoadingTask {
  promise: Promise<PdfjsDocument>;
  destroy(): Promise<void>;
}
interface PdfjsLib {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument(params: {
    data: Uint8Array;
    cMapUrl?: string;
    cMapPacked?: boolean;
    standardFontDataUrl?: string;
    wasmUrl?: string;
    iccUrl?: string;
    isEvalSupported?: boolean;
    enableXfa?: boolean;
  }): PdfjsLoadingTask;
}

let libPromise: Promise<PdfjsLib> | null = null;

export function loadPdfjs(): Promise<PdfjsLib> {
  if (!libPromise) {
    const url = `${BASE}pdf.min.mjs`;
    libPromise = import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url)
      .then((mod: unknown) => {
        const lib = mod as PdfjsLib;
        lib.GlobalWorkerOptions.workerSrc = `${BASE}pdf.worker.min.mjs`;
        return lib;
      })
      .catch((error: unknown) => {
        libPromise = null; // allow a retry later
        throw error;
      });
  }
  return libPromise;
}

export interface RenderImageOptions {
  /** Output resolution in dots per inch (PDF pages are 72 points per inch). */
  dpi: number;
  format: "image/jpeg" | "image/png";
  /** JPEG quality 0-1 (ignored for PNG). */
  quality?: number;
}

export interface RenderedImage {
  blob: Blob;
  width: number;
  height: number;
  /** True when the page was rendered smaller than requested to stay within browser canvas limits. */
  reduced: boolean;
}

/**
 * Largest canvas we create. Browsers (notably Safari on iPhone) refuse canvases
 * above roughly 16.7 million pixels or 16384 px per side; staying below keeps
 * rendering reliable on phones.
 */
export const MAX_CANVAS_PIXELS = 16_000_000;
export const MAX_CANVAS_SIDE = 8192;

export interface ThumbnailRenderer {
  pageCount: number;
  /** Render page (0-based) to an object URL. Caller must revoke it. */
  render(index: number, targetWidth: number): Promise<string>;
  /** Render page (0-based) to an image file at the given resolution. */
  renderImage(index: number, options: RenderImageOptions): Promise<RenderedImage>;
  destroy(): void;
}

interface PageCanvas {
  canvas: HTMLCanvasElement;
  release(): void;
}

/** Open a PDF for previewing. The bytes are copied, so the caller's buffer stays usable. */
export async function openPreview(bytes: Uint8Array): Promise<ThumbnailRenderer> {
  const lib = await loadPdfjs();
  const task = lib.getDocument({
    data: bytes.slice(),
    cMapUrl: `${BASE}cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${BASE}standard_fonts/`,
    wasmUrl: `${BASE}wasm/`,
    iccUrl: `${BASE}iccs/`,
    isEvalSupported: false,
    enableXfa: false,
  });
  const doc = await task.promise;
  let destroyed = false;

  async function drawPage(index: number, scale: number): Promise<PageCanvas> {
    if (destroyed) throw new Error("destroyed");
    const page = await doc.getPage(index + 1);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(viewport.width));
    canvas.height = Math.max(1, Math.round(viewport.height));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas not supported");
    context.fillStyle = "#ffffff"; // PDF pages are white unless they paint a background
    context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    page.cleanup();
    return {
      canvas,
      release() {
        // Shrinking the canvas frees its memory immediately (important on phones).
        canvas.width = 0;
        canvas.height = 0;
      },
    };
  }

  function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
    return new Promise((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not create image"))), type, quality)
    );
  }

  return {
    pageCount: doc.numPages,
    async render(index, targetWidth) {
      const page = await doc.getPage(index + 1);
      const base = page.getViewport({ scale: 1 });
      const ratio = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
      const scale = Math.min(4, (targetWidth * ratio) / base.width);
      const drawn = await drawPage(index, scale);
      try {
        return URL.createObjectURL(await toBlob(drawn.canvas, "image/jpeg", 0.82));
      } finally {
        drawn.release();
      }
    },
    async renderImage(index, { dpi, format, quality }) {
      const page = await doc.getPage(index + 1);
      const base = page.getViewport({ scale: 1 });
      let scale = dpi / 72;
      let reduced = false;
      const pixels = base.width * scale * base.height * scale;
      if (pixels > MAX_CANVAS_PIXELS) {
        scale *= Math.sqrt(MAX_CANVAS_PIXELS / pixels);
        reduced = true;
      }
      const side = Math.max(base.width, base.height) * scale;
      if (side > MAX_CANVAS_SIDE) {
        scale *= MAX_CANVAS_SIDE / side;
        reduced = true;
      }
      const drawn = await drawPage(index, scale);
      try {
        const blob = await toBlob(drawn.canvas, format, format === "image/jpeg" ? quality ?? 0.85 : undefined);
        return { blob, width: drawn.canvas.width, height: drawn.canvas.height, reduced };
      } finally {
        drawn.release();
      }
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      void task.destroy().catch(() => undefined);
    },
  };
}
