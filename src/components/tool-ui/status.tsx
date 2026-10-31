"use client";

import { CircleAlert, CircleCheck, Download, RotateCcw, ShieldCheck, X } from "lucide-react";
import { formatBytes } from "@/lib/pdf/files";
import { btnPrimary, btnSecondary } from "./ui";

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const percent = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <div className="rounded-2xl bg-indigo-50/70 p-4 ring-1 ring-indigo-100" data-testid="progress">
      <div className="flex items-center justify-between gap-3 text-sm font-semibold text-ink">
        <span aria-live="polite">{label}</span>
        <span className="tabular-nums text-brand-600">{percent}%</span>
      </div>
      <div
        className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-white"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className="h-full rounded-full bg-brand-gradient transition-[width] duration-200" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function ErrorAlert({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200"
      data-testid="error"
    >
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="rounded p-0.5 hover:bg-red-100" aria-label="Dismiss message">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function PrivacyNote() {
  return (
    <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
      Your files are processed in your browser and are never uploaded to our servers.
    </p>
  );
}

interface ResultPanelProps {
  fileName: string;
  size: number;
  summary: string;
  onDownload: () => void;
  onReset: () => void;
}

/** Success state with the download button. Kept inside the tool card, away from ads. */
export function ResultPanel({ fileName, size, summary, onDownload, onReset }: ResultPanelProps) {
  return (
    <div className="rounded-2xl bg-emerald-50/70 p-5 ring-1 ring-emerald-200 sm:p-6" data-testid="result">
      <div className="flex items-start gap-3">
        <CircleCheck className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-lg font-bold text-ink">Your file is ready</p>
          <p className="mt-0.5 text-sm text-muted">{summary}</p>
          <p className="mt-2 truncate text-sm font-semibold text-slate-700">
            {fileName} <span className="font-normal text-slate-500">· {formatBytes(size)}</span>
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onDownload} className={btnPrimary} data-testid="download">
          <Download className="h-5 w-5" aria-hidden="true" />
          Download
        </button>
        <button type="button" onClick={onReset} className={btnSecondary} data-testid="reset">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Start over
        </button>
      </div>
    </div>
  );
}
