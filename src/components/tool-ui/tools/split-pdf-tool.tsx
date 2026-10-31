"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { Scissors } from "lucide-react";
import { Dropzone } from "../dropzone";
import { ErrorAlert, ProgressBar, ResultPanel } from "../status";
import { FileHeader, LoadingFile, PreviewStatus, ToolFrame } from "../tool-frame";
import { PageTile, pageGridClass } from "../page-tile";
import { useJob, usePdfFile, useThumbnails } from "../hooks";
import { btnPrimary, inputClass } from "../ui";
import { baseName } from "@/lib/pdf/files";
import { describeRange, fixedSizeRanges, parsePageRanges, type PageRange } from "@/lib/pdf/page-ranges";
import { splitPdf } from "@/lib/pdf/operations";
import { downloadFile, pdfBlob, zipFiles } from "@/lib/pdf/download";

type Mode = "every" | "ranges" | "fixed";

export function SplitPdfTool() {
  const source = usePdfFile();
  const pdf = source.pdf;
  const pageCount = pdf?.pageCount ?? 0;
  const thumbs = useThumbnails(pdf?.bytes ?? null, pageCount);
  const [mode, setMode] = useState<Mode>("ranges");
  const [rangeText, setRangeText] = useState("");
  const [chunk, setChunk] = useState("2");
  const job = useJob();
  const busy = job.status === "processing";

  const plan = useMemo((): { ranges: PageRange[]; error: string | null } => {
    if (!pdf) return { ranges: [], error: null };
    if (mode === "every") return { ranges: fixedSizeRanges(pageCount, 1), error: null };
    if (mode === "fixed") {
      const size = Number(chunk);
      if (!Number.isInteger(size) || size < 1) return { ranges: [], error: "Enter a whole number of pages, 1 or more." };
      return { ranges: fixedSizeRanges(pageCount, size), error: null };
    }
    if (!rangeText.trim()) return { ranges: [], error: null };
    const parsed = parsePageRanges(rangeText, pageCount);
    return parsed.ok ? { ranges: parsed.ranges, error: null } : { ranges: [], error: parsed.error };
  }, [pdf, mode, rangeText, chunk, pageCount]);

  function reset() {
    source.clear();
    setRangeText("");
    setChunk("2");
    setMode("ranges");
    job.reset();
  }

  function choose(next: Mode) {
    job.invalidate();
    setMode(next);
  }

  function split() {
    if (!pdf || plan.ranges.length === 0) return;
    const base = baseName(pdf.file.name);
    void job.run(async (onProgress) => {
      const parts = await splitPdf({ name: pdf.file.name, bytes: pdf.bytes }, plan.ranges, (f, label) => onProgress(f * 0.85, label));
      const named = parts.map((part) => ({
        name: `${base}-${part.range.start === part.range.end ? `page-${part.range.start}` : `pages-${part.range.start}-${part.range.end}`}.pdf`,
        bytes: part.bytes,
      }));
      if (named.length === 1) {
        return { file: { name: named[0].name, blob: pdfBlob(named[0].bytes) }, summary: `Created 1 PDF with ${describeRange(plan.ranges[0])}.` };
      }
      onProgress(0.88, "Creating ZIP file");
      const zip = await zipFiles(named, (f) => onProgress(0.88 + f * 0.12, "Creating ZIP file"));
      return {
        file: { name: `${base}-split.zip`, blob: zip },
        summary: `Created ${named.length} PDF files, bundled in one ZIP download.`,
      };
    });
  }

  const modeButton = (value: Mode, title: string, text: string) => (
    <label
      className={`flex cursor-pointer gap-3 rounded-xl p-3 ring-1 transition ${
        mode === value ? "bg-brand-50 ring-indigo-300" : "bg-white ring-slate-200 hover:ring-indigo-200"
      }`}
    >
      <input
        type="radio"
        name="split-mode"
        value={value}
        checked={mode === value}
        onChange={() => choose(value)}
        className="mt-1 accent-indigo-600"
        disabled={busy}
      />
      <span>
        <span className="block text-sm font-bold text-ink">{title}</span>
        <span className="block text-xs text-slate-500">{text}</span>
      </span>
    </label>
  );

  return (
    <ToolFrame>
      {!pdf ? (
        source.loading ? <LoadingFile /> : <Dropzone accept=".pdf,application/pdf" acceptLabel="PDF" multiple={false} onFiles={source.select} />
      ) : (
        <>
          <FileHeader name={pdf.file.name} size={pdf.file.size} pageCount={pageCount} onRemove={reset} disabled={busy} />

          {pageCount < 2 ? (
            <ErrorAlert message="This PDF has only one page, so there is nothing to split. Choose another file." />
          ) : (
            <>
              <fieldset className="grid gap-2 sm:grid-cols-3" disabled={busy}>
                <legend className="mb-2 text-sm font-bold text-ink">How do you want to split it?</legend>
                {modeButton("ranges", "Custom ranges", "Choose the pages for each file")}
                {modeButton("every", "Every page", `${pageCount} single-page PDFs`)}
                {modeButton("fixed", "Fixed size", "A new file every N pages")}
              </fieldset>

              {mode === "ranges" && (
                <label className="block text-sm font-semibold text-ink">
                  Page ranges
                  <input
                    className={`${inputClass} mt-1.5`}
                    value={rangeText}
                    placeholder={`e.g. 1-3, 4-${Math.min(pageCount, 6)}`}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      job.invalidate();
                      setRangeText(e.target.value);
                    }}
                    disabled={busy}
                    data-testid="ranges"
                  />
                  <span className="mt-1 block text-xs font-normal text-slate-500">
                    Separate files with commas. Each range becomes its own PDF.
                  </span>
                </label>
              )}
              {mode === "fixed" && (
                <label className="block text-sm font-semibold text-ink">
                  Pages per file
                  <input
                    className={`${inputClass} mt-1.5 max-w-40`}
                    type="number"
                    min={1}
                    max={pageCount}
                    value={chunk}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      job.invalidate();
                      setChunk(e.target.value);
                    }}
                    disabled={busy}
                    data-testid="chunk"
                  />
                </label>
              )}

              {plan.error ? (
                <ErrorAlert message={plan.error} />
              ) : (
                plan.ranges.length > 0 && (
                  <p className="text-sm text-slate-600" data-testid="plan">
                    Will create <strong>{plan.ranges.length}</strong> PDF file{plan.ranges.length === 1 ? "" : "s"}
                    {plan.ranges.length <= 6 ? `: ${plan.ranges.map(describeRange).join("; ")}` : ""}
                    {plan.ranges.length > 1 ? " (downloaded as a ZIP)." : "."}
                  </p>
                )
              )}

              <div>
                <PreviewStatus rendered={thumbs.rendered} total={thumbs.total} failed={thumbs.failed} pageCount={pageCount} />
                <div className={`${pageGridClass} mt-2`}>
                  {Array.from({ length: pageCount }, (_, i) => (
                    <PageTile key={i} index={i} url={thumbs.urls[i] ?? null} />
                  ))}
                </div>
              </div>
            </>
          )}
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
        pdf &&
        pageCount > 1 && (
          <button
            type="button"
            className={`${btnPrimary} w-full sm:w-auto`}
            onClick={split}
            disabled={busy || plan.ranges.length === 0 || !!plan.error}
            data-testid="process"
          >
            <Scissors className="h-5 w-5" aria-hidden="true" />
            {busy ? "Splitting…" : "Split PDF"}
          </button>
        )
      )}
    </ToolFrame>
  );
}
