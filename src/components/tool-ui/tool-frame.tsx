"use client";

import type { ReactNode } from "react";
import { FileText, LoaderCircle, X } from "lucide-react";
import { formatBytes } from "@/lib/pdf/files";
import { PrivacyNote } from "./status";

/** Card that wraps every working tool (matches the Phase 1 upload card). */
export function ToolFrame({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-card sm:p-6">
      {children}
      <PrivacyNote />
    </div>
  );
}

interface FileHeaderProps {
  name: string;
  size: number;
  pageCount: number;
  onRemove: () => void;
  disabled?: boolean;
}

/** Shows the loaded PDF with a button to remove it and choose another. */
export function FileHeader({ name, size, pageCount, onRemove, disabled }: FileHeaderProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 ring-1 ring-red-100">
        <FileText className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink" title={name}>
          {name}
        </p>
        <p className="text-xs text-slate-500">
          {pageCount} page{pageCount === 1 ? "" : "s"} · {formatBytes(size)}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-red-600 disabled:opacity-40"
        aria-label={`Remove ${name} and choose another file`}
      >
        <X className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Remove</span>
      </button>
    </div>
  );
}

export function LoadingFile({ text = "Reading your file" }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl bg-slate-50 py-12 text-sm font-semibold text-slate-600" role="status">
      <LoaderCircle className="h-5 w-5 animate-spin text-brand-500" aria-hidden="true" />
      {text}…
    </div>
  );
}

export function PreviewStatus({ rendered, total, failed, pageCount }: { rendered: number; total: number; failed: boolean; pageCount: number }) {
  if (failed) return <p className="text-xs text-slate-500">Page previews are unavailable in this browser, but the tool still works.</p>;
  if (total > 0 && rendered < total) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-slate-500" role="status">
        <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        Loading previews {rendered}/{total}
      </p>
    );
  }
  if (pageCount > total && total > 0) {
    return <p className="text-xs text-slate-500">Previews are shown for the first {total} pages.</p>;
  }
  return null;
}
