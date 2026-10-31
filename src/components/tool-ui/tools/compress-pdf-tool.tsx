"use client";

import { useState } from "react";
import { Download, Info, Minimize2, RotateCcw } from "lucide-react";
import { Dropzone } from "../dropzone";
import { ErrorAlert, ProgressBar } from "../status";
import { FileHeader, LoadingFile, ToolFrame } from "../tool-frame";
import { usePdfFile } from "../hooks";
import { btnPrimary, btnSecondary } from "../ui";
import { baseName, errorMessage, formatBytes } from "@/lib/pdf/files";
import { browserImageRecoder, compressPdf, COMPRESSION_LEVELS, type CompressionLevel, type CompressionResult } from "@/lib/pdf/compress";
import { downloadFile, pdfBlob } from "@/lib/pdf/download";

const LEVELS: CompressionLevel[] = ["low", "recommended", "high"];

export function CompressPdfTool() {
  const source = usePdfFile();
  const pdf = source.pdf;
  const [level, setLevel] = useState<CompressionLevel>("recommended");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ value: 0, label: "" });
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<(CompressionResult & { level: CompressionLevel; name: string; blob: Blob | null }) | null>(null);

  function reset() {
    source.clear();
    setResult(null);
    setError(null);
    setBusy(false);
  }

  async function compress() {
    if (!pdf) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const out = await compressPdf({ name: pdf.file.name, bytes: pdf.bytes }, level, browserImageRecoder, (value, label) =>
        setProgress({ value, label })
      );
      // Less than 1% smaller isn't a meaningful result: say so instead of offering a near-identical file.
      const smaller = out.newSize < out.originalSize * 0.99;
      setResult({
        ...out,
        level,
        name: `${baseName(pdf.file.name)}-compressed.pdf`,
        blob: smaller ? pdfBlob(out.bytes) : null, // never offer a file that isn't smaller
      });
    } catch (err) {
      console.error(err);
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const saved = result ? result.originalSize - result.newSize : 0;
  const percent = result && saved > 0 ? (saved / result.originalSize) * 100 : 0;

  return (
    <ToolFrame>
      {!pdf ? (
        source.loading ? <LoadingFile /> : <Dropzone accept=".pdf,application/pdf" acceptLabel="PDF" multiple={false} onFiles={source.select} />
      ) : (
        <>
          <FileHeader name={pdf.file.name} size={pdf.file.size} pageCount={pdf.pageCount} onRemove={reset} disabled={busy} />

          <fieldset className="grid gap-2 sm:grid-cols-3" disabled={busy}>
            <legend className="mb-2 text-sm font-bold text-ink">Compression level</legend>
            {LEVELS.map((value) => {
              const info = COMPRESSION_LEVELS[value];
              return (
                <label
                  key={value}
                  className={`flex cursor-pointer gap-3 rounded-xl p-3 ring-1 transition ${
                    level === value ? "bg-brand-50 ring-indigo-300" : "bg-white ring-slate-200 hover:ring-indigo-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="level"
                    value={value}
                    checked={level === value}
                    onChange={() => {
                      setLevel(value);
                      setResult(null);
                    }}
                    className="mt-1 accent-indigo-600"
                    data-testid={`level-${value}`}
                  />
                  <span>
                    <span className="block text-sm font-bold text-ink">{info.label}</span>
                    <span className="block text-xs text-slate-500">{info.description}</span>
                  </span>
                </label>
              );
            })}
          </fieldset>

          <p className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 ring-1 ring-slate-200">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
            Compression works best on PDFs with photos or scanned pages. Text, fonts and drawings are kept as they are,
            so text-only PDFs usually shrink very little. Your original file is never changed.
          </p>
        </>
      )}

      {source.error && <ErrorAlert message={source.error} onDismiss={() => source.setError(null)} />}
      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
      {busy && <ProgressBar value={progress.value} label={progress.label} />}

      {result &&
        (result.blob ? (
          <div className="rounded-2xl bg-emerald-50/70 p-5 ring-1 ring-emerald-200 sm:p-6" data-testid="result">
            <p className="text-lg font-bold text-ink">Your PDF is {Math.round(percent)}% smaller</p>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                <dt className="text-xs font-semibold text-slate-500">Original</dt>
                <dd className="text-sm font-bold text-ink" data-testid="size-before">
                  {formatBytes(result.originalSize)}
                </dd>
              </div>
              <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                <dt className="text-xs font-semibold text-slate-500">Compressed</dt>
                <dd className="text-sm font-bold text-emerald-700" data-testid="size-after">
                  {formatBytes(result.newSize)}
                </dd>
              </div>
              <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                <dt className="text-xs font-semibold text-slate-500">Saved</dt>
                <dd className="text-sm font-bold text-ink" data-testid="percent">
                  {percent.toFixed(1)}%
                </dd>
              </div>
            </dl>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white" aria-hidden="true">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(2, 100 - percent)}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-600">
              {result.imagesReduced > 0
                ? `${result.imagesReduced} of ${result.imagesFound} image${result.imagesFound === 1 ? "" : "s"} re-encoded.`
                : "No images needed re-encoding."}{" "}
              {result.streamsCompressed > 0 ? `${result.streamsCompressed} uncompressed data section${result.streamsCompressed === 1 ? "" : "s"} packed.` : ""}
              {percent < 5 ? " This PDF was already fairly well optimised." : ""}
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button type="button" className={btnPrimary} onClick={() => result.blob && downloadFile({ name: result.name, blob: result.blob })} data-testid="download">
                <Download className="h-5 w-5" aria-hidden="true" />
                Download compressed PDF
              </button>
              <button type="button" className={btnSecondary} onClick={reset} data-testid="reset">
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Start over
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200 sm:p-6" data-testid="not-smaller">
            <p className="text-lg font-bold text-ink">This PDF can&apos;t be made smaller</p>
            <p className="mt-1 text-sm text-slate-700">
              We tried the &ldquo;{COMPRESSION_LEVELS[result.level].label}&rdquo; level, but the result would have been{" "}
              {result.newSize >= result.originalSize
                ? `${result.newSize === result.originalSize ? "the same size as" : `larger (${formatBytes(result.newSize)}) than`} your original (${formatBytes(result.originalSize)})`
                : `less than 1% smaller than your original (${formatBytes(result.originalSize)} to ${formatBytes(result.newSize)})`}
              , so there is nothing worth downloading. This usually means the file is already well compressed, or most of its
              size comes from fonts, text or vector graphics, which can&apos;t be reduced without losing quality.
              {result.level !== "high" ? " You can try the High level." : ""}
            </p>
            <button type="button" className={`${btnSecondary} mt-4`} onClick={reset} data-testid="reset">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Start over
            </button>
          </div>
        ))}

      {pdf && !result && (
        <button type="button" className={`${btnPrimary} w-full sm:w-auto`} onClick={compress} disabled={busy} data-testid="process">
          <Minimize2 className="h-5 w-5" aria-hidden="true" />
          {busy ? "Compressing…" : "Compress PDF"}
        </button>
      )}
    </ToolFrame>
  );
}
