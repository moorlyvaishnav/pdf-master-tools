import { siteConfig } from "@/config/site";

export type AdPlacement = "home-top" | "home-between" | "tool-below-interface" | "tool-bottom";

interface AdSlotProps {
  /** Identifies the placement; map this to an AdSense ad unit ID later. */
  placement: AdPlacement;
  /** Reserved height prevents layout shift when real ads load. */
  size?: "banner" | "rectangle";
  className?: string;
}

/**
 * Reusable advertisement placeholder.
 *
 * PHASE 1: renders a clearly labelled empty box (no ads, no AdSense code).
 * LATER:   replace the inner placeholder with an <ins class="adsbygoogle" .../>
 *          unit for `placement`, after AdSense approval.
 *
 * Placement rules used across the site (AdSense policy friendly):
 * - always labelled "Advertisement"
 * - visually separated from tools with margin and a border
 * - never placed next to upload, download or processing buttons
 */
export function AdSlot({ placement, size = "banner", className = "" }: AdSlotProps) {
  if (!siteConfig.showAdPlaceholders) return null;

  const height = size === "rectangle" ? "min-h-[250px]" : "min-h-[90px] sm:min-h-[100px]";

  return (
    <aside aria-label="Advertisement" data-ad-placement={placement} className={`w-full ${className}`}>
      <p className="mb-1.5 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
        Advertisement
      </p>
      <div
        className={`flex w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 ${height}`}
      >
        <span className="text-xs text-slate-300">Ad space</span>
      </div>
    </aside>
  );
}
