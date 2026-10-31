"use client";

import type { ReactNode } from "react";
import { FileText } from "lucide-react";

interface PageTileProps {
  index: number;
  url: string | null;
  /** Extra clockwise rotation to show (degrees). */
  rotation?: number;
  marked?: boolean;
  label?: string;
  /** Overlay controls (rotate buttons, etc.). */
  children?: ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  ariaPressed?: boolean;
}

/** One page preview tile. Shows a numbered placeholder until the thumbnail is ready. */
export function PageTile({ index, url, rotation = 0, marked = false, label, children, onClick, ariaLabel, ariaPressed }: PageTileProps) {
  const quarter = ((rotation % 180) + 180) % 180 === 90;
  const preview = (
    <span
      className={`relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-xl bg-white ring-1 transition ${
        marked ? "ring-2 ring-red-400" : "ring-slate-200 group-hover:ring-indigo-300"
      }`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
        <img
          src={url}
          alt=""
          draggable={false}
          className={`max-h-full max-w-full object-contain transition-transform duration-300 ${marked ? "opacity-40 grayscale" : ""}`}
          style={{ transform: `rotate(${rotation}deg) scale(${quarter ? 0.75 : 1})` }}
        />
      ) : (
        <span
          className="flex flex-col items-center gap-1 text-slate-300 transition-transform duration-300"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <FileText className="h-8 w-8" aria-hidden="true" />
        </span>
      )}
      {marked && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow">Delete</span>
        </span>
      )}
    </span>
  );

  return (
    <div className="group relative" data-testid="page-tile">
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          aria-label={ariaLabel}
          aria-pressed={ariaPressed}
          className="block w-full rounded-xl focus-visible:outline-offset-4"
        >
          {preview}
        </button>
      ) : (
        preview
      )}
      <p className={`mt-1.5 text-center text-xs font-semibold ${marked ? "text-red-600" : "text-slate-500"}`}>
        {label ?? `Page ${index + 1}`}
      </p>
      {children && <div className="absolute right-1.5 top-1.5 flex gap-1">{children}</div>}
    </div>
  );
}

export const pageGridClass = "grid grid-cols-2 gap-3 min-[420px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5";
