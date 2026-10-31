"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { Trash2, Undo2 } from "lucide-react";
import { Dropzone } from "../dropzone";
import { ErrorAlert, ProgressBar, ResultPanel } from "../status";
import { FileHeader, LoadingFile, PreviewStatus, ToolFrame } from "../tool-frame";
import { PageTile, pageGridClass } from "../page-tile";
import { useJob, usePdfFile, useThumbnails } from "../hooks";
import { btnPrimary, btnSecondary, inputClass } from "../ui";
import { baseName } from "@/lib/pdf/files";
import { formatPageList, parsePageSelection } from "@/lib/pdf/page-ranges";
import { deletePages } from "@/lib/pdf/operations";
import { downloadFile, pdfBlob } from "@/lib/pdf/download";

export function DeletePagesTool() {
  const source = usePdfFile();
  const pdf = source.pdf;
  const pageCount = pdf?.pageCount ?? 0;
  const thumbs = useThumbnails(pdf?.bytes ?? null, pageCount);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [rangeText, setRangeText] = useState("");
  const [rangeError, setRangeError] = useState<string | null>(null);
  const job = useJob();
  const busy = job.status === "processing";

  useEffect(() => {
    setSelected(new Set());
    setRangeText("");
    setRangeError(null);
  }, [pdf]);

  const remaining = pageCount - selected.size;

  function toggle(index: number) {
    job.invalidate();
    const next = new Set(selected);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelected(next);
    setRangeText(formatPageList([...next]));
    setRangeError(null);
  }

  function applyRangeText(value: string) {
    setRangeText(value);
    job.invalidate();
    if (!value.trim()) {
      setSelected(new Set());
      setRangeError(null);
      return;
    }
    const parsed = parsePageSelection(value, pageCount);
    if (parsed.ok) {
      setSelected(new Set(parsed.pages));
      setRangeError(null);
    } else {
      setRangeError(parsed.error);
    }
  }

  function clearSelection() {
    job.invalidate();
    setSelected(new Set());
    setRangeText("");
    setRangeError(null);
  }

  function reset() {
    source.clear();
    clearSelection();
    job.reset();
  }

  function apply() {
    if (!pdf) return;
    const pages = [...selected];
    void job.run(async (onProgress) => {
      const bytes = await deletePages({ name: pdf.file.name, bytes: pdf.bytes }, pages, onProgress);
      return {
        file: { name: `${baseName(pdf.file.name)}-edited.pdf`, blob: pdfBlob(bytes) },
        summary: `Deleted ${pages.length} page${pages.length === 1 ? "" : "s"} (${formatPageList(pages)}). ${pageCount - pages.length} page${pageCount - pages.length === 1 ? "" : "s"} remain.`,
      };
    });
  }

  const allSelected = pageCount > 0 && remaining === 0;

  return (
    <ToolFrame>
      {!pdf ? (
        source.loading ? <LoadingFile /> : <Dropzone accept=".pdf,application/pdf" acceptLabel="PDF" multiple={false} onFiles={source.select} />
      ) : (
        <>
          <FileHeader name={pdf.file.name} size={pdf.file.size} pageCount={pageCount} onRemove={reset} disabled={busy} />

          {pageCount < 2 ? (
            <ErrorAlert message="This PDF has only one page. A PDF must keep at least one page, so there is nothing to delete." />
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="block flex-1 text-sm font-semibold text-ink">
                  Pages to delete
                  <input
                    className={`${inputClass} mt-1.5`}
                    value={rangeText}
                    placeholder="Click pages below, or type e.g. 2, 5-7"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => applyRangeText(e.target.value)}
                    disabled={busy}
                    data-testid="ranges"
                  />
                </label>
                <button type="button" className={btnSecondary} onClick={clearSelection} disabled={busy || selected.size === 0}>
                  <Undo2 className="h-4 w-4" aria-hidden="true" /> Clear selection
                </button>
              </div>
              {rangeError && <ErrorAlert message={rangeError} />}
              <p className="text-sm text-slate-600" aria-live="polite" data-testid="plan">
                {selected.size === 0
                  ? "Click the pages you want to remove."
                  : `${selected.size} page${selected.size === 1 ? "" : "s"} selected for deletion · ${remaining} will remain.`}
              </p>
              {allSelected && <ErrorAlert message="You can't delete every page. Keep at least one page." />}

              <div>
                <PreviewStatus rendered={thumbs.rendered} total={thumbs.total} failed={thumbs.failed} pageCount={pageCount} />
                <div className={`${pageGridClass} mt-2`}>
                  {Array.from({ length: pageCount }, (_, i) => (
                    <PageTile
                      key={i}
                      index={i}
                      url={thumbs.urls[i] ?? null}
                      marked={selected.has(i)}
                      onClick={busy ? undefined : () => toggle(i)}
                      ariaPressed={selected.has(i)}
                      ariaLabel={`Page ${i + 1}${selected.has(i) ? ", marked for deletion" : ""}. Toggle deletion.`}
                    />
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
            onClick={apply}
            disabled={busy || selected.size === 0 || allSelected || !!rangeError}
            data-testid="process"
          >
            <Trash2 className="h-5 w-5" aria-hidden="true" />
            {busy ? "Deleting…" : selected.size ? `Delete ${selected.size} page${selected.size === 1 ? "" : "s"}` : "Select pages to delete"}
          </button>
        )
      )}
    </ToolFrame>
  );
}
