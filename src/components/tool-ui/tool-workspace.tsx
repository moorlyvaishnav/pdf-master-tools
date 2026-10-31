"use client";

import { Component, type ComponentType, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { LoaderCircle } from "lucide-react";

function WorkspaceLoading() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-card sm:p-6">
      <div
        className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 text-sm font-semibold text-slate-500"
        role="status"
      >
        <LoaderCircle className="h-6 w-6 animate-spin text-brand-500" aria-hidden="true" />
        Loading tool…
      </div>
    </div>
  );
}

// Each tool (and pdf-lib) is code-split and only loaded on its own page.
const loading = () => <WorkspaceLoading />;
const tools: Record<string, ComponentType> = {
  "jpg-to-pdf": dynamic(() => import("./tools/images-to-pdf-tool").then((m) => m.JpgToPdfTool), { ssr: false, loading }),
  "png-to-pdf": dynamic(() => import("./tools/images-to-pdf-tool").then((m) => m.PngToPdfTool), { ssr: false, loading }),
  "merge-pdf": dynamic(() => import("./tools/merge-pdf-tool").then((m) => m.MergePdfTool), { ssr: false, loading }),
  "split-pdf": dynamic(() => import("./tools/split-pdf-tool").then((m) => m.SplitPdfTool), { ssr: false, loading }),
  "rotate-pdf": dynamic(() => import("./tools/rotate-pdf-tool").then((m) => m.RotatePdfTool), { ssr: false, loading }),
  "delete-pdf-pages": dynamic(() => import("./tools/delete-pages-tool").then((m) => m.DeletePagesTool), { ssr: false, loading }),
  // Phase 3
  "pdf-to-jpg": dynamic(() => import("./tools/pdf-to-images-tool").then((m) => m.PdfToJpgTool), { ssr: false, loading }),
  "pdf-to-png": dynamic(() => import("./tools/pdf-to-images-tool").then((m) => m.PdfToPngTool), { ssr: false, loading }),
  "compress-pdf": dynamic(() => import("./tools/compress-pdf-tool").then((m) => m.CompressPdfTool), { ssr: false, loading }),
  "add-watermark": dynamic(() => import("./tools/watermark-tool").then((m) => m.WatermarkTool), { ssr: false, loading }),
  "add-page-numbers": dynamic(() => import("./tools/page-numbers-tool").then((m) => m.PageNumbersTool), { ssr: false, loading }),
  "protect-pdf": dynamic(() => import("./tools/protect-pdf-tool").then((m) => m.ProtectPdfTool), { ssr: false, loading }),
};

class ToolErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error(error);
  }
  render() {
    if (this.state.failed) {
      return (
        <div role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-800">
          <p className="font-bold">This tool hit an unexpected problem.</p>
          <p className="mt-1">Please reload the page and try again. Your files were not uploaded anywhere.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-white px-4 py-2 font-bold text-ink ring-1 ring-red-200 hover:ring-red-300"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ToolWorkspace({ slug }: { slug: string }) {
  const Tool = tools[slug];
  if (!Tool) return null;
  return (
    <ToolErrorBoundary>
      <Tool />
    </ToolErrorBoundary>
  );
}
