"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Download, FileArchive, Images, RotateCcw } from "lucide-react";
import { Dropzone } from "../dropzone";
import { ErrorAlert, ProgressBar } from "../status";
import { FileHeader, LoadingFile, PreviewStatus, ToolFrame } from "../tool-frame";
import { PageTile, pageGridClass } from "../page-tile";
import { PageScopeField, usePageScope } from "../page-scope";
import { usePdfFile, useThumbnails } from "../hooks";
import { btnPrimary, btnSecondary, selectClass } from "../ui";
import { baseName, errorMessage, formatBytes, nextFrame } from "@/lib/pdf/files";
import { formatPageList } from "@/lib/pdf/page-ranges";
import { openPreview } from "@/lib/pdf/preview";
import { downloadFile, zipFiles } from "@/lib/pdf/download";

type Variant = "jpg" | "png";

interface OutputImage {
  page: number; // 0-based
  name: string;
  blob: Blob;
  url: string;
  width: number;
  height: number;
  reduced: boolean;
}

const DPI_OPTIONS = [
  { value: 72, label: "72 DPI - screen, smallest files" },
  { value: 150, label: "150 DPI - standard (recommended)" },
  { value: 300, label: "300 DPI - high quality / print" },
];
const QUALITY_OPTIONS = [
  { value: 0.6, label: "Low - smaller files" },
  { value: 0.8, label: "Medium (recommended)" },
  { value: 0.92, label: "High - best quality" },
];
/** Rendering many pages at high resolution uses a lot of memory; keep batches safe for phones. */
export function maxPagesFor(dpi: number): number {
  return dpi >= 300 ? 50 : dpi >= 150 ? 150 : 300;
}

export function PdfToImagesTool({ variant }: { variant: Variant }) {
  const source = usePdfFile();
  const pdf = source.pdf;
  const pageCount = pdf?.pageCount ?? 0;
  const thumbs = useThumbnails(pdf?.bytes ?? null, pageCount);
  const scope = usePageScope(pageCount);
  const [dpi, setDpi] = useState(150);
  const [quality, setQuality] = useState(0.8);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ value: 0, label: "" });
  const [error, setError] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<OutputImage[]>([]);
  const [zipping, setZipping] = useState(false);
  const runId = useRef(0);
  const outputsRef = useRef<OutputImage[]>([]);
  outputsRef.current = outputs;

  const ext = variant === "jpg" ? "jpg" : "png";
  const mime = variant === "jpg" ? "image/jpeg" : "image/png";
  const limit = maxPagesFor(dpi);
  const pages = scope.pages;
  const tooMany = pages.length > limit;

  function clearOutputs() {
    outputsRef.current.forEach((o) => URL.revokeObjectURL(o.url));
    setOutputs([]);
  }
  // Free image memory when leaving the page.
  useEffect(() => () => outputsRef.current.forEach((o) => URL.revokeObjectURL(o.url)), []);

  function changed() {
    runId.current++;
    setBusy(false);
    clearOutputs();
    setError(null);
  }

  function reset() {
    changed();
    scope.reset();
    source.clear();
  }

  function togglePage(index: number) {
    changed();
    const current = new Set(scope.mode === "all" ? [] : pages);
    if (current.has(index)) current.delete(index);
    else current.add(index);
    scope.setMode("some");
    scope.setText(formatPageList([...current]));
  }

  async function convert() {
    if (!pdf || pages.length === 0 || tooMany) return;
    const id = ++runId.current;
    clearOutputs();
    setError(null);
    setBusy(true);
    setProgress({ value: 0, label: "Preparing pages" });
    const base = baseName(pdf.file.name);
    const made: OutputImage[] = [];
    let renderer: Awaited<ReturnType<typeof openPreview>> | null = null;
    try {
      renderer = await openPreview(pdf.bytes);
      for (let i = 0; i < pages.length; i++) {
        if (runId.current !== id) break;
        setProgress({ value: i / pages.length, label: `Converting page ${pages[i] + 1} (${i + 1} of ${pages.length})` });
        await nextFrame();
        const image = await renderer.renderImage(pages[i], { dpi, format: mime, quality });
        const digits = String(pageCount).length;
        made.push({
          page: pages[i],
          name: `${base}-page-${String(pages[i] + 1).padStart(digits, "0")}.${ext}`,
          blob: image.blob,
          url: URL.createObjectURL(image.blob),
          width: image.width,
          height: image.height,
          reduced: image.reduced,
        });
      }
      if (runId.current === id) {
        setProgress({ value: 1, label: "Done" });
        setOutputs(made);
      } else {
        made.forEach((o) => URL.revokeObjectURL(o.url));
      }
    } catch (err) {
      console.error(err);
      made.forEach((o) => URL.revokeObjectURL(o.url));
      if (runId.current === id) {
        setError(
          err instanceof Error && /load|import|fetch|module/i.test(err.message)
            ? "The PDF renderer could not be loaded. Check your internet connection and try again."
            : errorMessage(err)
        );
      }
    } finally {
      renderer?.destroy();
      if (runId.current === id) setBusy(false);
    }
  }

  async function downloadZip() {
    setZipping(true);
    try {
      const files = await Promise.all(outputs.map(async (o) => ({ name: o.name, bytes: new Uint8Array(await o.blob.arrayBuffer()) })));
      const blob = await zipFiles(files);
      downloadFile({ name: `${baseName(pdf?.file.name ?? "document")}-${ext}-images.zip`, blob });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setZipping(false);
    }
  }

  const totalSize = useMemo(() => outputs.reduce((s, o) => s + o.blob.size, 0), [outputs]);
  const selectedSet = useMemo(() => new Set(scope.mode === "some" ? pages : []), [scope.mode, pages]);

  return (
    <ToolFrame>
      {!pdf ? (
        source.loading ? <LoadingFile /> : <Dropzone accept=".pdf,application/pdf" acceptLabel="PDF" multiple={false} onFiles={source.select} />
      ) : (
        <>
          <FileHeader name={pdf.file.name} size={pdf.file.size} pageCount={pageCount} onRemove={reset} disabled={busy} />

          {outputs.length === 0 && (
            <>
              <div className={`grid gap-3 ${variant === "jpg" ? "sm:grid-cols-2" : ""}`}>
                <label className="text-sm font-semibold text-ink">
                  Resolution
                  <select
                    className={`${selectClass} mt-1.5`}
                    value={dpi}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                      changed();
                      setDpi(Number(e.target.value));
                    }}
                    disabled={busy}
                    data-testid="opt-dpi"
                  >
                    {DPI_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                {variant === "jpg" && (
                  <label className="text-sm font-semibold text-ink">
                    Image quality
                    <select
                      className={`${selectClass} mt-1.5`}
                      value={quality}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                        changed();
                        setQuality(Number(e.target.value));
                      }}
                      disabled={busy}
                      data-testid="opt-quality"
                    >
                      {QUALITY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              <PageScopeField
                name="image-pages"
                pageCount={pageCount}
                mode={scope.mode}
                text={scope.text}
                onMode={(m) => {
                  changed();
                  scope.setMode(m);
                }}
                onText={(t) => {
                  changed();
                  scope.setText(t);
                }}
                disabled={busy}
                someLabel="Selected pages (click pages below)"
              />
              {scope.error && <ErrorAlert message={scope.error} />}
              {tooMany && (
                <ErrorAlert
                  message={`At ${dpi} DPI you can convert up to ${limit} pages at a time, to avoid running out of memory. Choose fewer pages or a lower resolution.`}
                />
              )}
              <p className="text-sm text-slate-600" aria-live="polite" data-testid="plan">
                {pages.length === 0
                  ? "Choose the pages to convert."
                  : `${pages.length} page${pages.length === 1 ? "" : "s"} will be converted to ${ext.toUpperCase()}.`}
              </p>

              <div>
                <PreviewStatus rendered={thumbs.rendered} total={thumbs.total} failed={thumbs.failed} pageCount={pageCount} />
                <div className={`${pageGridClass} mt-2`}>
                  {Array.from({ length: pageCount }, (_, i) => {
                    const chosen = selectedSet.has(i);
                    return (
                      <div key={i} className={chosen ? "rounded-xl ring-2 ring-indigo-500 ring-offset-2" : ""}>
                        <PageTile
                          index={i}
                          url={thumbs.urls[i] ?? null}
                          label={chosen ? `Page ${i + 1} ✓` : undefined}
                          onClick={busy ? undefined : () => togglePage(i)}
                          ariaPressed={chosen}
                          ariaLabel={`Page ${i + 1}${chosen ? ", selected" : ""}. Toggle selection.`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {source.error && <ErrorAlert message={source.error} onDismiss={() => source.setError(null)} />}
      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
      {busy && <ProgressBar value={progress.value} label={progress.label} />}

      {outputs.length > 0 ? (
        <div className="space-y-4 rounded-2xl bg-emerald-50/70 p-4 ring-1 ring-emerald-200 sm:p-5" data-testid="result">
          <div>
            <p className="text-lg font-bold text-ink">
              {outputs.length} {ext.toUpperCase()} image{outputs.length === 1 ? "" : "s"} ready
            </p>
            <p className="text-sm text-muted">
              {formatBytes(totalSize)} in total · {outputs[0].width} × {outputs[0].height} px
              {outputs.length > 1 ? " (first image)" : ""}
            </p>
            {outputs.some((o) => o.reduced) && (
              <p className="mt-1 text-xs text-amber-800">
                Some very large pages were rendered at a lower resolution to stay within your browser&apos;s limits.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {outputs.length > 1 ? (
              <button type="button" className={btnPrimary} onClick={downloadZip} disabled={zipping} data-testid="download-zip">
                <FileArchive className="h-5 w-5" aria-hidden="true" />
                {zipping ? "Creating ZIP…" : "Download all (ZIP)"}
              </button>
            ) : (
              <button type="button" className={btnPrimary} onClick={() => downloadFile(outputs[0])} data-testid="download">
                <Download className="h-5 w-5" aria-hidden="true" />
                Download image
              </button>
            )}
            <button type="button" className={btnSecondary} onClick={changed} data-testid="back">
              <Images className="h-4 w-4" aria-hidden="true" />
              Change settings
            </button>
            <button type="button" className={btnSecondary} onClick={reset} data-testid="reset">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Start over
            </button>
          </div>
          <ul className="grid grid-cols-2 gap-3 min-[420px]:grid-cols-3 sm:grid-cols-4" aria-label="Converted images">
            {outputs.map((o) => (
              <li key={o.name} className="rounded-xl bg-white p-2 ring-1 ring-slate-200" data-testid="output-image">
                <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                  <img src={o.url} alt={`Page ${o.page + 1} as ${ext.toUpperCase()}`} className="max-h-full max-w-full object-contain" />
                </div>
                <p className="mt-1.5 truncate text-xs font-semibold text-slate-700" title={o.name}>
                  {o.name}
                </p>
                <p className="text-xs text-slate-500">{formatBytes(o.blob.size)}</p>
                <button
                  type="button"
                  className="mt-1.5 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-slate-50 py-1.5 text-xs font-bold text-brand-600 ring-1 ring-slate-200 transition hover:ring-indigo-300"
                  onClick={() => downloadFile(o)}
                  aria-label={`Download ${o.name}`}
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" /> Download
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        pdf && (
          <button
            type="button"
            className={`${btnPrimary} w-full sm:w-auto`}
            onClick={convert}
            disabled={busy || pages.length === 0 || tooMany || !!scope.error}
            data-testid="process"
          >
            <Images className="h-5 w-5" aria-hidden="true" />
            {busy ? "Converting…" : `Convert to ${ext.toUpperCase()}`}
          </button>
        )
      )}
    </ToolFrame>
  );
}

export function PdfToJpgTool() {
  return <PdfToImagesTool variant="jpg" />;
}

export function PdfToPngTool() {
  return <PdfToImagesTool variant="png" />;
}
