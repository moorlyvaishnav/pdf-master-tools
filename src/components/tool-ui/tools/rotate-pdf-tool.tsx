"use client";

import { useEffect, useState } from "react";
import { RotateCcw, RotateCw, Undo2 } from "lucide-react";
import { Dropzone } from "../dropzone";
import { ErrorAlert, ProgressBar, ResultPanel } from "../status";
import { FileHeader, LoadingFile, PreviewStatus, ToolFrame } from "../tool-frame";
import { PageTile, pageGridClass } from "../page-tile";
import { useJob, usePdfFile, useThumbnails } from "../hooks";
import { btnPrimary, btnSecondary, iconBtn } from "../ui";
import { baseName } from "@/lib/pdf/files";
import { rotatePdf } from "@/lib/pdf/operations";
import { downloadFile, pdfBlob } from "@/lib/pdf/download";

export function RotatePdfTool() {
  const source = usePdfFile();
  const pdf = source.pdf;
  const pageCount = pdf?.pageCount ?? 0;
  const thumbs = useThumbnails(pdf?.bytes ?? null, pageCount);
  // Extra clockwise rotation per page, in degrees (can grow beyond 360 for smooth animation).
  const [turns, setTurns] = useState<number[]>([]);
  const job = useJob();
  const busy = job.status === "processing";

  useEffect(() => {
    setTurns(new Array(pageCount).fill(0));
  }, [pdf, pageCount]);

  const changed = turns.filter((t) => ((t % 360) + 360) % 360 !== 0).length;

  function rotate(index: number, delta: number) {
    job.invalidate();
    setTurns((prev) => prev.map((t, i) => (i === index ? t + delta : t)));
  }
  function rotateAll(delta: number) {
    job.invalidate();
    setTurns((prev) => prev.map((t) => t + delta));
  }
  function resetRotations() {
    job.invalidate();
    setTurns(new Array(pageCount).fill(0));
  }
  function reset() {
    source.clear();
    setTurns([]);
    job.reset();
  }

  function apply() {
    if (!pdf) return;
    void job.run(async (onProgress) => {
      const bytes = await rotatePdf({ name: pdf.file.name, bytes: pdf.bytes }, turns, onProgress);
      return {
        file: { name: `${baseName(pdf.file.name)}-rotated.pdf`, blob: pdfBlob(bytes) },
        summary: `Rotated ${changed} of ${pageCount} page${pageCount === 1 ? "" : "s"}.`,
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

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className={btnSecondary} onClick={() => rotateAll(-90)} disabled={busy} data-testid="rotate-all-left">
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Rotate all left
            </button>
            <button type="button" className={btnSecondary} onClick={() => rotateAll(90)} disabled={busy} data-testid="rotate-all-right">
              <RotateCw className="h-4 w-4" aria-hidden="true" /> Rotate all right
            </button>
            <button type="button" className={btnSecondary} onClick={resetRotations} disabled={busy || changed === 0}>
              <Undo2 className="h-4 w-4" aria-hidden="true" /> Undo rotations
            </button>
          </div>
          <p className="text-sm text-slate-600" aria-live="polite">
            Click a page to turn it clockwise, or use the buttons on each page. {changed > 0 ? `${changed} page${changed === 1 ? "" : "s"} rotated.` : ""}
          </p>

          <div>
            <PreviewStatus rendered={thumbs.rendered} total={thumbs.total} failed={thumbs.failed} pageCount={pageCount} />
            <div className={`${pageGridClass} mt-2`}>
              {Array.from({ length: pageCount }, (_, i) => {
                const deg = turns[i] ?? 0;
                const normalized = ((deg % 360) + 360) % 360;
                return (
                  <PageTile
                    key={i}
                    index={i}
                    url={thumbs.urls[i] ?? null}
                    rotation={deg}
                    label={normalized ? `Page ${i + 1} · ${normalized}°` : undefined}
                    onClick={busy ? undefined : () => rotate(i, 90)}
                    ariaLabel={`Page ${i + 1}, rotated ${normalized} degrees. Rotate clockwise.`}
                  >
                    <button type="button" className={iconBtn} onClick={() => rotate(i, -90)} disabled={busy} aria-label={`Rotate page ${i + 1} left`}>
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button type="button" className={iconBtn} onClick={() => rotate(i, 90)} disabled={busy} aria-label={`Rotate page ${i + 1} right`}>
                      <RotateCw className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </PageTile>
                );
              })}
            </div>
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
          <button type="button" className={`${btnPrimary} w-full sm:w-auto`} onClick={apply} disabled={busy || changed === 0} data-testid="process">
            <RotateCw className="h-5 w-5" aria-hidden="true" />
            {busy ? "Rotating…" : changed === 0 ? "Rotate pages first" : "Apply rotation"}
          </button>
        )
      )}
    </ToolFrame>
  );
}
