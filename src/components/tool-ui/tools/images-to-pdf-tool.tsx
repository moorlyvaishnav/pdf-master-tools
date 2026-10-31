"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { ArrowLeft, ArrowRight, FileDown, X } from "lucide-react";
import { Dropzone } from "../dropzone";
import { ErrorAlert, ProgressBar, ResultPanel } from "../status";
import { ToolFrame } from "../tool-frame";
import { useJob } from "../hooks";
import { btnGhost, btnPrimary, iconBtn, selectClass } from "../ui";
import {
  baseName,
  detectFileKind,
  formatBytes,
  makeId,
  MAX_FILE_BYTES,
  MAX_FILES,
  MAX_TOTAL_BYTES,
  readBytes,
} from "@/lib/pdf/files";
import {
  imagesToPdf,
  type ImagesToPdfOptions,
  type MarginOption,
  type OrientationOption,
  type PageSizeOption,
} from "@/lib/pdf/images-to-pdf";
import { downloadFile, pdfBlob } from "@/lib/pdf/download";

interface ImageItem {
  id: string;
  file: File;
  kind: "jpeg" | "png";
  url: string;
}

const VARIANTS = {
  jpg: { accept: ".jpg,.jpeg,image/jpeg", label: "JPG, JPEG", allowed: ["jpeg"], noun: "JPG" },
  png: { accept: ".png,image/png", label: "PNG", allowed: ["png"], noun: "PNG" },
} as const;

export function ImagesToPdfTool({ variant }: { variant: "jpg" | "png" }) {
  const config = VARIANTS[variant];
  const [items, setItems] = useState<ImageItem[]>([]);
  const [options, setOptions] = useState<ImagesToPdfOptions>({ pageSize: "a4", orientation: "auto", margin: "small" });
  const [warning, setWarning] = useState<string | null>(null);
  const job = useJob();
  const busy = job.status === "processing";
  const totalBytes = useMemo(() => items.reduce((sum, item) => sum + item.file.size, 0), [items]);

  // Release preview URLs when the component unmounts.
  const [urlsToRevoke] = useState(() => new Set<string>());
  useEffect(() => () => urlsToRevoke.forEach((url) => URL.revokeObjectURL(url)), [urlsToRevoke]);

  async function addFiles(files: File[]) {
    job.invalidate();
    job.setError(null);
    const problems: string[] = [];
    const added: ImageItem[] = [];
    let running = totalBytes;
    for (const file of files) {
      if (items.length + added.length >= MAX_FILES) {
        problems.push(`Only ${MAX_FILES} images can be converted at once.`);
        break;
      }
      const kind = await detectFileKind(file);
      if (kind !== "jpeg" && kind !== "png") {
        problems.push(`"${file.name}" is not a ${config.noun} image.`);
        continue;
      }
      if (!(config.allowed as readonly string[]).includes(kind)) {
        problems.push(`"${file.name}" is a ${kind === "png" ? "PNG" : "JPG"} file. Use the ${kind === "png" ? "PNG" : "JPG"} to PDF tool for it.`);
        continue;
      }
      if (file.size > MAX_FILE_BYTES || running + file.size > MAX_TOTAL_BYTES) {
        problems.push(`"${file.name}" is too large (limit ${formatBytes(MAX_FILE_BYTES)} per file, ${formatBytes(MAX_TOTAL_BYTES)} total).`);
        continue;
      }
      running += file.size;
      const url = URL.createObjectURL(file);
      urlsToRevoke.add(url);
      added.push({ id: makeId("img"), file, kind, url });
    }
    if (added.length) setItems((prev) => [...prev, ...added]);
    setWarning(problems.length ? problems.join(" ") : null);
  }

  function update(next: ImageItem[]) {
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

  function remove(id: string) {
    const item = items.find((i) => i.id === id);
    if (item) {
      URL.revokeObjectURL(item.url);
      urlsToRevoke.delete(item.url);
    }
    update(items.filter((i) => i.id !== id));
  }

  function reset() {
    items.forEach((item) => {
      URL.revokeObjectURL(item.url);
      urlsToRevoke.delete(item.url);
    });
    setItems([]);
    setWarning(null);
    job.reset();
  }

  function setOption<K extends keyof ImagesToPdfOptions>(key: K, value: ImagesToPdfOptions[K]) {
    job.invalidate();
    setOptions((prev) => ({ ...prev, [key]: value }));
  }

  function convert() {
    void job.run(async (onProgress) => {
      const inputs = [];
      for (let i = 0; i < items.length; i++) {
        onProgress((i / items.length) * 0.2, `Reading image ${i + 1} of ${items.length}`);
        inputs.push({ name: items[i].file.name, kind: items[i].kind, bytes: await readBytes(items[i].file) });
      }
      const bytes = await imagesToPdf(inputs, options, (f, label) => onProgress(0.2 + f * 0.8, label));
      const name = items.length === 1 ? `${baseName(items[0].file.name)}.pdf` : `${variant}-images.pdf`;
      return {
        file: { name, blob: pdfBlob(bytes) },
        summary: `${items.length} image${items.length === 1 ? "" : "s"} converted into a ${items.length}-page PDF.`,
      };
    });
  }

  return (
    <ToolFrame>
      {items.length === 0 ? (
        <Dropzone accept={config.accept} acceptLabel={config.label} multiple onFiles={addFiles} />
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-ink">
              {items.length} image{items.length === 1 ? "" : "s"} · {formatBytes(totalBytes)}
            </p>
            <button type="button" className={btnGhost} onClick={reset} disabled={busy} data-testid="clear">
              <X className="h-4 w-4" aria-hidden="true" />
              Clear all
            </button>
          </div>

          <ol className="grid grid-cols-2 gap-3 min-[420px]:grid-cols-3 sm:grid-cols-4" aria-label="Images in page order">
            {items.map((item, index) => (
              <li key={item.id} className="group relative" data-testid="image-item">
                <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                  <img src={item.url} alt={`Preview of ${item.file.name}`} className="max-h-full max-w-full object-contain" />
                </div>
                <span className="absolute left-1.5 top-1.5 rounded-md bg-ink/80 px-1.5 py-0.5 text-xs font-bold text-white">
                  {index + 1}
                </span>
                <button
                  type="button"
                  className={`${iconBtn} absolute right-1.5 top-1.5`}
                  onClick={() => remove(item.id)}
                  disabled={busy}
                  aria-label={`Remove ${item.file.name}`}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
                <div className="mt-1.5 flex items-center gap-1">
                  <button
                    type="button"
                    className={iconBtn}
                    onClick={() => move(index, -1)}
                    disabled={busy || index === 0}
                    aria-label={`Move ${item.file.name} earlier`}
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <p className="min-w-0 flex-1 truncate text-center text-xs text-slate-500" title={item.file.name}>
                    {item.file.name}
                  </p>
                  <button
                    type="button"
                    className={iconBtn}
                    onClick={() => move(index, 1)}
                    disabled={busy || index === items.length - 1}
                    aria-label={`Move ${item.file.name} later`}
                  >
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ol>

          <Dropzone accept={config.accept} acceptLabel={config.label} multiple onFiles={addFiles} compact disabled={busy} />

          <fieldset className="grid gap-3 sm:grid-cols-3" disabled={busy}>
            <legend className="sr-only">PDF options</legend>
            <label className="text-sm font-semibold text-ink">
              Page size
              <select
                className={`${selectClass} mt-1.5`}
                value={options.pageSize}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setOption("pageSize", e.target.value as PageSizeOption)}
                data-testid="opt-size"
              >
                <option value="a4">A4</option>
                <option value="letter">US Letter</option>
                <option value="fit">Same as image</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-ink">
              Orientation
              <select
                className={`${selectClass} mt-1.5`}
                value={options.orientation}
                disabled={options.pageSize === "fit"}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setOption("orientation", e.target.value as OrientationOption)}
                data-testid="opt-orientation"
              >
                <option value="auto">Automatic</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-ink">
              Margin
              <select
                className={`${selectClass} mt-1.5`}
                value={options.margin}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setOption("margin", e.target.value as MarginOption)}
                data-testid="opt-margin"
              >
                <option value="none">No margin</option>
                <option value="small">Small</option>
                <option value="large">Large</option>
              </select>
            </label>
          </fieldset>
        </>
      )}

      {warning && <ErrorAlert message={warning} onDismiss={() => setWarning(null)} />}
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
        items.length > 0 && (
          <button type="button" className={`${btnPrimary} w-full sm:w-auto`} onClick={convert} disabled={busy} data-testid="process">
            <FileDown className="h-5 w-5" aria-hidden="true" />
            {busy ? "Converting…" : "Convert to PDF"}
          </button>
        )
      )}
    </ToolFrame>
  );
}

export function JpgToPdfTool() {
  return <ImagesToPdfTool variant="jpg" />;
}

export function PngToPdfTool() {
  return <ImagesToPdfTool variant="png" />;
}
