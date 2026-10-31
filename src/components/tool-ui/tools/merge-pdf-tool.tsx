"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Combine, FileText, LoaderCircle, X } from "lucide-react";
import { Dropzone } from "../dropzone";
import { ErrorAlert, ProgressBar, ResultPanel } from "../status";
import { ToolFrame } from "../tool-frame";
import { useJob } from "../hooks";
import { btnGhost, btnPrimary, iconBtn } from "../ui";
import {
  detectFileKind,
  errorMessage,
  formatBytes,
  makeId,
  MAX_FILE_BYTES,
  MAX_FILES,
  MAX_TOTAL_BYTES,
  readBytes,
} from "@/lib/pdf/files";
import { inspectPdf, mergePdfs } from "@/lib/pdf/operations";
import { openPreview } from "@/lib/pdf/preview";
import { downloadFile, pdfBlob } from "@/lib/pdf/download";

interface PdfItem {
  id: string;
  file: File;
  bytes: Uint8Array;
  pageCount: number;
}

function FirstPageThumb({ bytes }: { bytes: Uint8Array }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let created: string | null = null;
    let destroy: (() => void) | null = null;
    openPreview(bytes)
      .then(async (renderer) => {
        destroy = () => renderer.destroy();
        if (cancelled) return renderer.destroy();
        created = await renderer.render(0, 96);
        renderer.destroy();
        if (cancelled) URL.revokeObjectURL(created);
        else setUrl(created);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      destroy?.();
      if (created) URL.revokeObjectURL(created);
    };
  }, [bytes]);

  return (
    <span className="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
        <img src={url} alt="" className="max-h-full max-w-full object-contain" />
      ) : failed ? (
        <FileText className="h-5 w-5 text-slate-300" aria-hidden="true" />
      ) : (
        <LoaderCircle className="h-4 w-4 animate-spin text-slate-300" aria-hidden="true" />
      )}
    </span>
  );
}

export function MergePdfTool() {
  const [items, setItems] = useState<PdfItem[]>([]);
  const [adding, setAdding] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const job = useJob();
  const busy = job.status === "processing" || adding;
  const totalBytes = useMemo(() => items.reduce((s, i) => s + i.file.size, 0), [items]);
  const totalPages = useMemo(() => items.reduce((s, i) => s + i.pageCount, 0), [items]);

  async function addFiles(files: File[]) {
    job.invalidate();
    job.setError(null);
    setAdding(true);
    const problems: string[] = [];
    const added: PdfItem[] = [];
    let running = totalBytes;
    for (const file of files) {
      if (items.length + added.length >= MAX_FILES) {
        problems.push(`Only ${MAX_FILES} files can be merged at once.`);
        break;
      }
      if ((await detectFileKind(file)) !== "pdf") {
        problems.push(`"${file.name}" is not a PDF file.`);
        continue;
      }
      if (file.size > MAX_FILE_BYTES || running + file.size > MAX_TOTAL_BYTES) {
        problems.push(`"${file.name}" is too large (limit ${formatBytes(MAX_FILE_BYTES)} per file, ${formatBytes(MAX_TOTAL_BYTES)} total).`);
        continue;
      }
      try {
        const bytes = await readBytes(file);
        const { pageCount } = await inspectPdf({ name: file.name, bytes });
        running += file.size;
        added.push({ id: makeId("pdf"), file, bytes, pageCount });
      } catch (err) {
        problems.push(errorMessage(err));
      }
    }
    if (added.length) setItems((prev) => [...prev, ...added]);
    setWarning(problems.length ? problems.join(" ") : null);
    setAdding(false);
  }

  function update(next: PdfItem[]) {
    job.invalidate();
    setItems(next);
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = items.slice();
    [next[index], next[target]] = [next[target], next[index]];
    update(next);
  }

  function reset() {
    setItems([]);
    setWarning(null);
    job.reset();
  }

  function merge() {
    void job.run(async (onProgress) => {
      const bytes = await mergePdfs(
        items.map((i) => ({ name: i.file.name, bytes: i.bytes })),
        onProgress
      );
      return {
        file: { name: "merged.pdf", blob: pdfBlob(bytes) },
        summary: `${items.length} files merged into one ${totalPages}-page PDF.`,
      };
    });
  }

  return (
    <ToolFrame>
      {items.length === 0 ? (
        adding ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-slate-50 py-12 text-sm font-semibold text-slate-600" role="status">
            <LoaderCircle className="h-5 w-5 animate-spin text-brand-500" aria-hidden="true" />
            Reading your files…
          </div>
        ) : (
          <Dropzone accept=".pdf,application/pdf" acceptLabel="PDF" multiple onFiles={addFiles} />
        )
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-ink">
              {items.length} file{items.length === 1 ? "" : "s"} · {totalPages} pages · {formatBytes(totalBytes)}
            </p>
            <button type="button" className={btnGhost} onClick={reset} disabled={busy} data-testid="clear">
              <X className="h-4 w-4" aria-hidden="true" />
              Clear all
            </button>
          </div>

          <ol className="space-y-2" aria-label="Files in merge order">
            {items.map((item, index) => (
              <li key={item.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-2.5 ring-1 ring-slate-200" data-testid="pdf-item">
                <span className="w-6 shrink-0 text-center text-sm font-bold text-slate-400">{index + 1}</span>
                <FirstPageThumb bytes={item.bytes} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink" title={item.file.name}>
                    {item.file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.pageCount} page{item.pageCount === 1 ? "" : "s"} · {formatBytes(item.file.size)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" className={iconBtn} onClick={() => move(index, -1)} disabled={busy || index === 0} aria-label={`Move ${item.file.name} up`}>
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={iconBtn}
                    onClick={() => move(index, 1)}
                    disabled={busy || index === items.length - 1}
                    aria-label={`Move ${item.file.name} down`}
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={iconBtn}
                    onClick={() => update(items.filter((i) => i.id !== item.id))}
                    disabled={busy}
                    aria-label={`Remove ${item.file.name}`}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ol>

          {adding ? (
            <p className="flex items-center gap-2 text-sm text-slate-500" role="status">
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> Reading files…
            </p>
          ) : (
            <Dropzone accept=".pdf,application/pdf" acceptLabel="PDF" multiple onFiles={addFiles} compact disabled={busy} />
          )}
          {items.length === 1 && <p className="text-sm text-slate-500">Add at least one more PDF to merge.</p>}
        </>
      )}

      {warning && <ErrorAlert message={warning} onDismiss={() => setWarning(null)} />}
      {job.error && <ErrorAlert message={job.error} onDismiss={() => job.setError(null)} />}
      {job.status === "processing" && <ProgressBar value={job.progress} label={job.label} />}

      {job.result ? (
        <ResultPanel
          fileName={job.result.name}
          size={job.result.blob.size}
          summary={job.result.summary}
          onDownload={() => job.result && downloadFile(job.result)}
          onReset={reset}
        />
      ) : (
        items.length > 0 && (
          <button type="button" className={`${btnPrimary} w-full sm:w-auto`} onClick={merge} disabled={busy || items.length < 2} data-testid="process">
            <Combine className="h-5 w-5" aria-hidden="true" />
            {job.status === "processing" ? "Merging…" : "Merge PDF"}
          </button>
        )
      )}
    </ToolFrame>
  );
}
