"use client";

import { useState, type ChangeEvent } from "react";
import { Hash } from "lucide-react";
import { Dropzone } from "../dropzone";
import { ErrorAlert, ProgressBar, ResultPanel } from "../status";
import { FileHeader, LoadingFile, ToolFrame } from "../tool-frame";
import { PageScopeField, PreviewPanel, usePageScope, usePdfPreview } from "../page-scope";
import { useJob, usePdfFile, usePreviewSource } from "../hooks";
import { btnPrimary, inputClass, selectClass } from "../ui";
import { baseName } from "@/lib/pdf/files";
import {
  applyPageNumbers,
  formatPageNumber,
  numberPdf,
  previewSinglePage,
  type NumberFormat,
  type NumberHorizontal,
  type NumberVertical,
  type PageNumberOptions,
} from "@/lib/pdf/stamp";
import { downloadFile, pdfBlob } from "@/lib/pdf/download";

const DEFAULTS: PageNumberOptions = {
  vertical: "bottom",
  horizontal: "center",
  fontSize: 12,
  startAt: 1,
  format: "n",
  color: "#000000",
  margin: 24,
};

const FORMATS: { value: NumberFormat; label: string }[] = [
  { value: "n", label: "1" },
  { value: "page-n", label: "Page 1" },
  { value: "page-n-of-total", label: "Page 1 of 10" },
  { value: "n-of-total", label: "1 / 10" },
];

const SPOTS: { v: NumberVertical; h: NumberHorizontal; label: string }[] = [
  { v: "top", h: "left", label: "Top left" },
  { v: "top", h: "center", label: "Top center" },
  { v: "top", h: "right", label: "Top right" },
  { v: "bottom", h: "left", label: "Bottom left" },
  { v: "bottom", h: "center", label: "Bottom center" },
  { v: "bottom", h: "right", label: "Bottom right" },
];

export function PageNumbersTool() {
  const source = usePdfFile();
  const pdf = source.pdf;
  const pageCount = pdf?.pageCount ?? 0;
  const scope = usePageScope(pageCount);
  const [options, setOptions] = useState<PageNumberOptions>(DEFAULTS);
  const [startText, setStartText] = useState("1");
  const job = useJob();
  const busy = job.status === "processing";
  const previewDoc = usePreviewSource(pdf?.bytes ?? null, pdf?.file.name ?? "");
  const firstPage = scope.pages[0];
  const startError = !/^\d{1,6}$/.test(startText.trim()) ? "The starting number must be a whole number (0 or more)." : null;
  const total = options.startAt + scope.pages.length - 1;

  const previewKey = previewDoc && firstPage !== undefined && !startError ? JSON.stringify({ firstPage, options, total, n: pdf?.file.name }) : null;
  const preview = usePdfPreview(previewKey, () =>
    previewSinglePage(previewDoc!, firstPage!, (doc) =>
      applyPageNumbers(doc, [0], options, undefined, { first: options.startAt, total })
    )
  );

  function set<K extends keyof PageNumberOptions>(key: K, value: PageNumberOptions[K]) {
    job.invalidate();
    setOptions((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    source.clear();
    scope.reset();
    setOptions(DEFAULTS);
    setStartText("1");
    job.reset();
  }

  function apply() {
    if (!pdf) return;
    const pages = scope.pages;
    void job.run(async (onProgress) => {
      const bytes = await numberPdf({ name: pdf.file.name, bytes: pdf.bytes }, pages, options, onProgress);
      return {
        file: { name: `${baseName(pdf.file.name)}-numbered.pdf`, blob: pdfBlob(bytes) },
        summary: `Numbered ${pages.length} page${pages.length === 1 ? "" : "s"}, from ${formatPageNumber(options.format, options.startAt, total)} to ${formatPageNumber(options.format, total, total)}.`,
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
              <legend className="sr-only">Page number settings</legend>
              <div>
                <p className="mb-2 text-sm font-bold text-ink" id="pos-label">
                  Position
                </p>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby="pos-label">
                  {SPOTS.map((spot) => {
                    const active = options.vertical === spot.v && options.horizontal === spot.h;
                    return (
                      <button
                        key={spot.label}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => {
                          job.invalidate();
                          setOptions((prev) => ({ ...prev, vertical: spot.v, horizontal: spot.h }));
                        }}
                        className={`rounded-xl px-2 py-2.5 text-xs font-semibold ring-1 transition ${
                          active ? "bg-brand-50 text-brand-600 ring-indigo-300" : "bg-white text-slate-600 ring-slate-200 hover:ring-indigo-200"
                        }`}
                        data-testid={`pos-${spot.v}-${spot.h}`}
                      >
                        {spot.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-semibold text-ink">
                  Format
                  <select
                    className={`${selectClass} mt-1.5`}
                    value={options.format}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => set("format", e.target.value as NumberFormat)}
                    data-testid="num-format"
                  >
                    {FORMATS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-ink">
                  Start at
                  <input
                    className={`${inputClass} mt-1.5`}
                    inputMode="numeric"
                    value={startText}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      job.invalidate();
                      setStartText(e.target.value);
                      if (/^\d{1,6}$/.test(e.target.value.trim())) setOptions((prev) => ({ ...prev, startAt: Number(e.target.value.trim()) }));
                    }}
                    data-testid="num-start"
                  />
                </label>
                <label className="text-sm font-semibold text-ink">
                  Font size: {options.fontSize} pt
                  <input
                    type="range"
                    min={6}
                    max={36}
                    value={options.fontSize}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => set("fontSize", Number(e.target.value))}
                    className="mt-2 w-full accent-indigo-600"
                    data-testid="num-size"
                  />
                </label>
                <label className="text-sm font-semibold text-ink">
                  Color
                  <span className="mt-1.5 flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 shadow-sm">
                    <input
                      type="color"
                      value={options.color}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => set("color", e.target.value)}
                      className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
                      aria-label="Number color"
                    />
                    <span className="text-xs font-medium uppercase text-slate-500">{options.color}</span>
                  </span>
                </label>
              </div>
              {startError && <ErrorAlert message={startError} />}
              <PageScopeField
                name="num-pages"
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
                someLabel="Only some pages"
              />
              {scope.error && <ErrorAlert message={scope.error} />}
              {scope.pages.length > 0 && !startError && (
                <p className="text-sm text-slate-600" data-testid="plan">
                  {scope.pages.length} page{scope.pages.length === 1 ? "" : "s"} will be numbered from{" "}
                  <strong>{formatPageNumber(options.format, options.startAt, total)}</strong> to{" "}
                  <strong>{formatPageNumber(options.format, total, total)}</strong>.
                </p>
              )}
            </fieldset>

            <PreviewPanel
              url={preview.url}
              loading={preview.loading}
              error={startError ?? (firstPage === undefined ? "Choose pages to see a preview." : preview.error)}
              label={firstPage !== undefined ? `Preview of page ${firstPage + 1}` : "Preview"}
            />
          </div>
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
            disabled={busy || !!startError || scope.pages.length === 0 || !!scope.error}
            data-testid="process"
          >
            <Hash className="h-5 w-5" aria-hidden="true" />
            {busy ? "Adding numbers…" : "Add page numbers"}
          </button>
        )
      )}
    </ToolFrame>
  );
}
