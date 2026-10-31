"use client";

import { useId, useState, type ChangeEvent, type DragEvent } from "react";
import { Plus, Upload } from "lucide-react";

interface DropzoneProps {
  accept: string;
  acceptLabel: string;
  multiple: boolean;
  onFiles: (files: File[]) => void;
  /** Small "add more files" variant shown after files are added. */
  compact?: boolean;
  disabled?: boolean;
}

/** Real file input with drag and drop. Files never leave the browser. */
export function Dropzone({ accept, acceptLabel, multiple, onFiles, compact = false, disabled = false }: DropzoneProps) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);

  function take(list: FileList | null) {
    if (!list || list.length === 0 || disabled) return;
    const files = Array.from(list);
    onFiles(multiple ? files : files.slice(0, 1));
  }

  const dragProps = {
    onDragOver: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      if (!disabled) setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      setDragging(false);
      take(event.dataTransfer.files);
    },
  };

  const input = (
    <input
      id={inputId}
      type="file"
      accept={accept}
      multiple={multiple}
      disabled={disabled}
      className="sr-only"
      data-testid="file-input"
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        take(event.target.files);
        event.target.value = ""; // allow picking the same file again
      }}
    />
  );

  if (compact) {
    return (
      <label
        htmlFor={inputId}
        {...dragProps}
        className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-4 text-sm font-semibold transition ${
          dragging ? "border-indigo-400 bg-indigo-50 text-brand-600" : "border-slate-300 text-slate-600 hover:border-indigo-300 hover:text-brand-500"
        } ${disabled ? "pointer-events-none opacity-50" : ""}`}
      >
        {input}
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add more files <span className="font-normal text-slate-400">or drop them here</span>
      </label>
    );
  }

  return (
    <div
      {...dragProps}
      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors sm:py-16 ${
        dragging ? "border-indigo-400 bg-indigo-50/70" : "border-slate-300 bg-slate-50/60"
      }`}
    >
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-indigo-500/25">
        <Upload className="h-8 w-8" aria-hidden="true" />
      </span>
      <p className="mt-5 text-lg font-bold text-ink">Drag and drop your {multiple ? "files" : "file"} here</p>
      <p className="mt-1 text-sm text-muted">Accepted format{acceptLabel.includes(",") ? "s" : ""}: {acceptLabel}</p>
      {input}
      <label
        htmlFor={inputId}
        className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/25 transition hover:opacity-95 focus-within:ring-4 focus-within:ring-indigo-200"
      >
        Select {multiple ? "files" : "file"}
      </label>
    </div>
  );
}
