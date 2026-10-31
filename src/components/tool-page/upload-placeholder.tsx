"use client";

import { useId, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Check, Clock, Upload } from "lucide-react";

interface UploadPlaceholderProps {
  toolName: string;
  accepts: string;
  acceptAttr: string;
  multiple: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface PickedFile {
  name: string;
  size: number;
}

/**
 * Phase 1 upload interface placeholder.
 * Files can be picked or dropped to preview the interface, but nothing is
 * uploaded or processed - files never leave the user's device.
 */
export function UploadPlaceholder({ toolName, accepts, acceptAttr, multiple }: UploadPlaceholderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<PickedFile[]>([]);

  function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const picked = Array.from(list)
      .slice(0, multiple ? 20 : 1)
      .map((file) => ({ name: file.name, size: file.size }));
    setFiles(picked);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-card sm:p-6">
      <div
        onDragOver={(event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors sm:py-16 ${
          dragging ? "border-indigo-400 bg-indigo-50/70" : "border-slate-300 bg-slate-50/60"
        }`}
      >
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-indigo-500/25">
          <Upload className="h-8 w-8" aria-hidden="true" />
        </span>
        <p className="mt-5 text-lg font-bold text-ink">
          Drag and drop your {multiple ? "files" : "file"} here
        </p>
        <p className="mt-1 text-sm text-muted">Accepted format{accepts.includes(",") ? "s" : ""}: {accepts}</p>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={acceptAttr}
          multiple={multiple}
          className="sr-only"
          onChange={(event: ChangeEvent<HTMLInputElement>) => handleFiles(event.target.files)}
        />
        <label
          htmlFor={inputId}
          className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-ink shadow-sm ring-1 ring-slate-200 transition hover:ring-indigo-300 focus-within:ring-indigo-400"
        >
          Select {multiple ? "files" : "file"}
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-4 rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-ink">
            {files.length} {files.length === 1 ? "file" : "files"} selected (preview only)
          </p>
          <ul className="mt-2 space-y-1.5">
            {files.map((file) => (
              <li key={`${file.name}-${file.size}`} className="flex items-center gap-2 text-sm text-muted">
                <Check className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                <span className="truncate">{file.name}</span>
                <span className="ml-auto shrink-0 text-xs text-slate-400">{formatSize(file.size)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        className="mt-4 flex items-start gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200"
        role="note"
      >
        <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          <strong className="font-semibold">{toolName} is coming soon.</strong> File processing is not available yet.
          Files you select are not uploaded or changed - they stay on your device.
        </p>
      </div>
    </div>
  );
}
