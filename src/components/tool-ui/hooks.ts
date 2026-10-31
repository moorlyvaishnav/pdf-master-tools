"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  detectFileKind,
  errorMessage,
  formatBytes,
  MAX_FILE_BYTES,
  readBytes,
  ToolError,
  type ProgressCallback,
} from "@/lib/pdf/files";
import { inspectPdf } from "@/lib/pdf/operations";
import { loadPdf } from "@/lib/pdf/load";
import type { PDFDocument } from "pdf-lib";
import type { OutputFile } from "@/lib/pdf/download";
import { openPreview, type ThumbnailRenderer } from "@/lib/pdf/preview";

export type JobStatus = "idle" | "processing" | "done";

/** Processing state shared by all tools: progress, errors and the finished file. */
export function useJob() {
  const [status, setStatus] = useState<JobStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<(OutputFile & { summary: string }) | null>(null);
  const runId = useRef(0);

  const run = useCallback(
    async (task: (onProgress: ProgressCallback) => Promise<{ file: OutputFile; summary: string }>) => {
      const id = ++runId.current;
      setStatus("processing");
      setError(null);
      setResult(null);
      setProgress(0);
      setLabel("Starting");
      try {
        const { file, summary } = await task((fraction, text) => {
          if (runId.current !== id) return;
          setProgress(fraction);
          setLabel(text);
        });
        if (runId.current !== id) return;
        setResult({ ...file, summary });
        setStatus("done");
      } catch (err) {
        if (runId.current !== id) return;
        console.error(err);
        setError(errorMessage(err));
        setStatus("idle");
      }
    },
    []
  );

  /** Forget the previous result (e.g. after the user changes options). */
  const invalidate = useCallback(() => {
    runId.current++;
    setResult(null);
    setStatus("idle");
  }, []);

  const reset = useCallback(() => {
    runId.current++;
    setStatus("idle");
    setProgress(0);
    setLabel("");
    setError(null);
    setResult(null);
  }, []);

  return { status, progress, label, error, setError, result, run, invalidate, reset };
}

/** Max pages we render previews for; larger files still work, with numbered placeholders. */
export const MAX_THUMBNAILS = 300;

export interface ThumbnailState {
  urls: (string | null)[];
  rendered: number;
  total: number;
  failed: boolean;
}

/**
 * Render page previews progressively. Previews are optional: if pdf.js fails
 * to load, tools keep working with numbered placeholders.
 */
export function useThumbnails(bytes: Uint8Array | null, pageCount: number, width = 180, limit = MAX_THUMBNAILS) {
  const [state, setState] = useState<ThumbnailState>({ urls: [], rendered: 0, total: 0, failed: false });

  useEffect(() => {
    if (!bytes || pageCount === 0) {
      setState({ urls: [], rendered: 0, total: 0, failed: false });
      return;
    }
    let cancelled = false;
    let renderer: ThumbnailRenderer | null = null;
    const created: string[] = [];
    const total = Math.min(pageCount, limit);
    setState({ urls: new Array(pageCount).fill(null), rendered: 0, total, failed: false });

    (async () => {
      try {
        renderer = await openPreview(bytes);
        if (cancelled) return;
        for (let i = 0; i < total; i++) {
          if (cancelled) return;
          let url: string | null = null;
          try {
            url = await renderer.render(i, width);
          } catch {
            url = null; // one bad page shouldn't stop the others
          }
          if (cancelled) {
            if (url) URL.revokeObjectURL(url);
            return;
          }
          if (url) created.push(url);
          setState((prev) => {
            const urls = prev.urls.slice();
            urls[i] = url;
            return { ...prev, urls, rendered: i + 1 };
          });
        }
      } catch (err) {
        console.warn("Preview unavailable", err);
        if (!cancelled) setState((prev) => ({ ...prev, failed: true }));
      }
    })();

    return () => {
      cancelled = true;
      renderer?.destroy();
      created.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [bytes, pageCount, width, limit]);

  return state;
}

/** Object URLs for image previews, revoked automatically. */
export function useObjectUrl(blob: Blob | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [blob]);
  return url;
}

export interface LoadedPdf {
  file: File;
  bytes: Uint8Array;
  pageCount: number;
}

/** Validate and load the PDF used by single-file tools (split, rotate, delete pages). */
export async function loadSinglePdf(file: File): Promise<LoadedPdf> {
  if (file.size === 0) throw new ToolError(`"${file.name}" is empty.`);
  if (file.size > MAX_FILE_BYTES) {
    throw new ToolError(`"${file.name}" is ${formatBytes(file.size)}. The maximum size is ${formatBytes(MAX_FILE_BYTES)}.`);
  }
  const kind = await detectFileKind(file);
  if (kind !== "pdf") throw new ToolError(`"${file.name}" is not a PDF file.`);
  const bytes = await readBytes(file);
  const { pageCount } = await inspectPdf({ name: file.name, bytes });
  return { file, bytes, pageCount };
}

export function usePdfFile() {
  const [pdf, setPdf] = useState<LoadedPdf | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const select = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      setPdf(await loadSinglePdf(file));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setPdf(null);
    setError(null);
    setLoading(false);
  }, []);

  return { pdf, loading, error, setError, select, clear };
}

/** A pdf-lib document loaded once and reused to build fast single-page previews. */
export function usePreviewSource(bytes: Uint8Array | null, name: string) {
  const [doc, setDoc] = useState<PDFDocument | null>(null);
  useEffect(() => {
    let cancelled = false;
    setDoc(null);
    if (!bytes) return;
    loadPdf(bytes, name)
      .then((d) => {
        if (!cancelled) setDoc(d);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [bytes, name]);
  return doc;
}
