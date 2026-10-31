"use client";

import { useState, type ChangeEvent } from "react";
import { Droplets, Info } from "lucide-react";
import { Dropzone } from "../dropzone";
import { ErrorAlert, ProgressBar, ResultPanel } from "../status";
import { FileHeader, LoadingFile, ToolFrame } from "../tool-frame";
import { PageScopeField, PreviewPanel, usePageScope, usePdfPreview } from "../page-scope";
import { useJob, usePdfFile, usePreviewSource } from "../hooks";
import { btnPrimary, inputClass, selectClass } from "../ui";
import { baseName } from "@/lib/pdf/files";
import { applyWatermark, canEncodeLatin, previewSinglePage, watermarkPdf, type WatermarkOptions, type WatermarkPosition } from "@/lib/pdf/stamp";
import { downloadFile, pdfBlob } from "@/lib/pdf/download";

const POSITIONS: { value: WatermarkPosition; label: string }[] = [
  { value: "center", label: "Center" },
  { value: "tile", label: "Repeat across page" },
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "top-left", label: "Top left" },
  { value: "top-right", label: "Top right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-right", label: "Bottom right" },
];

const DEFAULTS: WatermarkOptions = {
  text: "CONFIDENTIAL",
  fontSize: 56,
  color: "#dc2626",
  opacity: 0.3,
  rotation: 45,
  position: "center",
  bold: true,
};

export function WatermarkTool() {
  const source = usePdfFile();
  const pdf = source.pdf;
  const pageCount = pdf?.pageCount ?? 0;
  const scope = usePageScope(pageCount);
  const [options, setOptions] = useState<WatermarkOptions>(DEFAULTS);
  const job = useJob();
  const busy = job.status === "processing";
  const previewDoc = usePreviewSource(pdf?.bytes ?? null, pdf?.file.name ?? "");
  const firstPage = scope.pages[0];
  const textError = !options.text.trim()
    ? "Enter the watermark text."
    : !canEncodeLatin(options.text)
      ? "Only Latin letters, numbers and common symbols are supported (the standard PDF fonts can't show other scripts)."
      : null;

  const previewKey =
    previewDoc && firstPage !== undefined && !textError ? JSON.stringify({ firstPage, options, n: pdf?.file.name }) : null;
  const preview = usePdfPreview(previewKey, () =>
    previewSinglePage(previewDoc!, firstPage!, (doc) => applyWatermark(doc, [0], options))
  );

  function set<K extends keyof WatermarkOptions>(key: K, value: WatermarkOptions[K]) {
    job.invalidate();
    setOptions((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    source.clear();
    scope.reset();
    setOptions(DEFAULTS);
    job.reset();
  }

  function apply() {
    if (!pdf) return;
    const pages = scope.pages;
    void job.run(async (onProgress) => {
      const bytes = await watermarkPdf({ name: pdf.file.name, bytes: pdf.bytes }, pages, options, onProgress);
      return {
        file: { name: `${baseName(pdf.file.name)}-watermarked.pdf`, blob: pdfBlob(bytes) },
        summary: `Watermark added to ${pages.length} of ${pageCount} page${pageCount === 1 ? "" : "s"}.`,
      };
    });
  }

  return (
    <ToolFrame>
      {!pdf ? (
        source.loading ? <LoadingFile /> : <Dropzone accept=".pdf,application/pdf" acceptLabel="PDF" multiple={false} onFiles={source.select} />
      ) : (
        <>
          <FileHeader name={pdf.file.name} size={pdf.file.size} pageCount={pageCount} onRemove={reset} disabled={busy} />
          <div className="grid gap-5 lg:grid-cols-2">
            <fieldset className="space-y-4" disabled={busy}>
              <legend className="sr-only">Watermark settings</legend>
              <label className="block text-sm font-semibold text-ink">
                Watermark text
                <input
                  className={`${inputClass} mt-1.5`}
                  value={options.text}
                  maxLength={120}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => set("text", e.target.value)}
                  data-testid="wm-text"
                />
              </label>
              {textError && <ErrorAlert message={textError} />}
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-semibold text-ink">
                  Font size: {options.fontSize} pt
                  <input
                    type="range"
                    min={10}
                    max={150}
                    value={options.fontSize}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => set("fontSize", Number(e.target.value))}
                    className="mt-2 w-full accent-indigo-600"
                    data-testid="wm-size"
                  />
                </label>
                <label className="text-sm font-semibold text-ink">
                  Opacity: {Math.round(options.opacity * 100)}%
                  <input
                    type="range"
                    min={5}
                    max={100}
                    value={Math.round(options.opacity * 100)}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => set("opacity", Number(e.target.value) / 100)}
                    className="mt-2 w-full accent-indigo-600"
                    data-testid="wm-opacity"
                  />
                </label>
                <label className="text-sm font-semibold text-ink">
                  Rotation
                  <select
                    className={`${selectClass} mt-1.5`}
                    value={options.rotation}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => set("rotation", Number(e.target.value))}
                    data-testid="wm-rotation"
                  >
                    <option value={0}>0° (horizontal)</option>
                    <option value={45}>45° (diagonal up)</option>
                    <option value={-45}>-45° (diagonal down)</option>
                    <option value={90}>90° (vertical)</option>
                  </select>
                </label>
                <label className="text-sm font-semibold text-ink">
                  Color
                  <span className="mt-1.5 flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 shadow-sm">
                    <input
                      type="color"
                      value={options.color}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => set("color", e.target.value)}
                      className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
                      aria-label="Watermark color"
                      data-testid="wm-color"
                    />
                    <span className="text-xs font-medium uppercase text-slate-500">{options.color}</span>
                  </span>
                </label>
              </div>
              <label className="block text-sm font-semibold text-ink">
                Position
                <select
                  className={`${selectClass} mt-1.5`}
                  value={options.position}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => set("position", e.target.value as WatermarkPosition)}
                  data-testid="wm-position"
                >
                  {POSITIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-ink">
                <input type="checkbox" checked={options.bold} onChange={(e: ChangeEvent<HTMLInputElement>) => set("bold", e.target.checked)} className="h-4 w-4 accent-indigo-600" />
                Bold text
              </label>
              <PageScopeField
                name="wm-pages"
                pageCount={pageCount}
                mode={scope.mode}
                text={scope.text}
                onMode={(m) => {
                  job.invalidate();
                  scope.setMode(m);
                }}
                onText={(t) => {
                  job.invalidate();
                  scope.setText(t);
                }}
                disabled={busy}
              />
              {scope.error && <ErrorAlert message={scope.error} />}
            </fieldset>

            <PreviewPanel
              url={preview.url}
              loading={preview.loading}
              error={textError ?? (firstPage === undefined ? "Choose pages to see a preview." : preview.error)}
              label={firstPage !== undefined ? `Preview of page ${firstPage + 1}` : "Preview"}
            />
          </div>
          <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            A watermark is a visible label placed on top of the page. It discourages misuse but is not a security feature: it
            does not hide or remove the content underneath, and it can be removed with PDF editing software.
          </p>
        </>
      )}

      {source.error && <ErrorAlert message={source.error} onDismiss={() => source.setError(null)} />}
      {job.error && <ErrorAlert message={job.error} onDismiss={() => job.setError(null)} />}
      {busy && <ProgressBar value={job.progress} label={job.label} />}

      {job.result ? (
        <ResultPanel
          fileName={job.result.name}
          size={job.result.blob.size}
          summary={job.result.summary}
          onDownload={() => job.result && downloadFile(job.result)}
          onReset={reset}
        />
      ) : (
        pdf && (
          <button
            type="button"
            className={`${btnPrimary} w-full sm:w-auto`}
            onClick={apply}
            disabled={busy || !!textError || scope.pages.length === 0 || !!scope.error}
            data-testid="process"
          >
            <Droplets className="h-5 w-5" aria-hidden="true" />
            {busy ? "Adding watermark…" : "Add watermark"}
          </button>
        )
      )}
    </ToolFrame>
  );
}

