"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { parsePageSelection } from "@/lib/pdf/page-ranges";
import { openPreview } from "@/lib/pdf/preview";
import { inputClass } from "./ui";

export type ScopeMode = "all" | "some";

/** "All pages" or a page range like "1-3, 7". Returns 0-based page indexes. */
export function usePageScope(pageCount: number) {
  const [mode, setMode] = useState<ScopeMode>("all");
  const [text, setText] = useState("");
  const result = useMemo((): { pages: number[]; error: string | null } => {
    if (pageCount === 0) return { pages: [], error: null };
    if (mode === "all") return { pages: Array.from({ length: pageCount }, (_, i) => i), error: null };
    if (!text.trim()) return { pages: [], error: null };
    const parsed = parsePageSelection(text, pageCount);
    return parsed.ok ? { pages: parsed.pages, error: null } : { pages: [], error: parsed.error };
  }, [mode, text, pageCount]);
  const reset = () => {
    setMode("all");
    setText("");
  };
  return { mode, setMode, text, setText, ...result, reset };
}

interface PageScopeProps {
  name: string;
  pageCount: number;
  mode: ScopeMode;
  text: string;
  onMode: (mode: ScopeMode) => void;
  onText: (text: string) => void;
  disabled?: boolean;
  allLabel?: string;
  someLabel?: string;
}

export function PageScopeField({ name, pageCount, mode, text, onMode, onText, disabled, allLabel, someLabel }: PageScopeProps) {
  const option = (value: ScopeMode, label: string) => (
    <label
      className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ring-1 transition ${
        mode === value ? "bg-brand-50 text-brand-600 ring-indigo-300" : "bg-white text-slate-700 ring-slate-200 hover:ring-indigo-200"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={mode === value}
        onChange={() => onMode(value)}
        disabled={disabled}
        className="accent-indigo-600"
      />
      {label}
    </label>
  );
  return (
    <fieldset disabled={disabled} className="space-y-2">
      <legend className="mb-2 text-sm font-bold text-ink">Pages</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {option("all", allLabel ?? `All ${pageCount} pages`)}
        {option("some", someLabel ?? "Selected pages")}
      </div>
      {mode === "some" && (
        <label className="block text-sm font-semibold text-ink">
          <span className="sr-only">Page numbers</span>
          <input
            className={inputClass}
            value={text}
            placeholder={`e.g. 1-3, ${Math.min(pageCount, 5)}`}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onText(e.target.value)}
            data-testid="scope-ranges"
          />
        </label>
      )}
    </fieldset>
  );
}

/**
 * Live preview image for one page. `build` returns a small PDF (usually one
 * page with the change applied); it is re-run, debounced, when `key` changes.
 */
export function usePdfPreview(key: string | null, build: () => Promise<Uint8Array>, width = 420) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const buildRef = useRef(build);
  buildRef.current = build;
  const shownRef = useRef<string | null>(null);

  // Release the displayed preview when the component goes away.
  useEffect(
    () => () => {
      if (shownRef.current) URL.revokeObjectURL(shownRef.current);
      shownRef.current = null;
    },
    []
  );

  useEffect(() => {
    if (!key) {
      if (shownRef.current) URL.revokeObjectURL(shownRef.current);
      shownRef.current = null;
      setUrl(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const bytes = await buildRef.current();
        if (cancelled) return;
        const renderer = await openPreview(bytes);
        let next: string;
        try {
          next = await renderer.render(0, width);
        } finally {
          renderer.destroy();
        }
        if (cancelled) {
          URL.revokeObjectURL(next);
          return;
        }
        // Swap in the new image, then release the old one (no flash of a broken image).
        const old = shownRef.current;
        shownRef.current = next;
        setUrl(next);
        setError(null);
        if (old) URL.revokeObjectURL(old);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error && err.name === "ToolError" ? err.message : "Preview unavailable.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [key, width]);

  return { url, error, loading };
}

export function PreviewPanel({ url, loading, error, label }: { url: string | null; loading: boolean; error: string | null; label: string }) {
  return (
    <figure className="rounded-2xl bg-slate-100 p-3 ring-1 ring-slate-200" data-testid="preview">
      <div className="relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-xl bg-white">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
          <img src={url} alt={label} className="max-h-[460px] w-auto max-w-full object-contain" data-testid="preview-img" />
        ) : (
          <span className="px-4 text-center text-sm text-slate-500">{error ?? "Preparing preview…"}</span>
        )}
        {loading && url && (
          <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-slate-500 shadow" role="status">
            Updating…
          </span>
        )}
      </div>
      <figcaption className="mt-2 text-center text-xs font-semibold text-slate-500">{label}</figcaption>
    </figure>
  );
}
