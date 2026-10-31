"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { tools, popularTools } from "@/data/tools";
import { searchTools } from "@/lib/search";
import { ToolGrid } from "@/components/tools/tool-grid";
import { SearchInput } from "./search-input";

interface ToolSearchProps {
  /** Unique id for the input (there may be more than one search on a page). */
  inputId: string;
  /** Read ?q= from the URL on load and keep it updated while typing. */
  syncWithUrl?: boolean;
  headingLevel?: "h3" | "h4";
}

/** Instant client-side filter over all tool cards. */
export function ToolSearch({ inputId, syncWithUrl = false, headingLevel = "h3" }: ToolSearchProps) {
  const [query, setQuery] = useState("");
  // Becomes true once ?q= has been read, so the URL is not overwritten on first render.
  const [urlLoaded, setUrlLoaded] = useState(false);

  // Pick up ?q= from the address bar (e.g. when arriving from the hero search).
  useEffect(() => {
    if (!syncWithUrl) return;
    const initial = new URLSearchParams(window.location.search).get("q");
    if (initial) setQuery(initial);
    setUrlLoaded(true);
  }, [syncWithUrl]);

  // Keep the URL shareable without adding history entries on every keystroke.
  useEffect(() => {
    if (!syncWithUrl || !urlLoaded) return;
    const url = new URL(window.location.href);
    if (query.trim()) url.searchParams.set("q", query.trim());
    else url.searchParams.delete("q");
    window.history.replaceState(window.history.state, "", url.toString());
  }, [query, syncWithUrl, urlLoaded]);

  const results = useMemo(() => searchTools(tools, query), [query]);
  const hasQuery = query.trim().length > 0;

  return (
    <div>
      <div className="mx-auto max-w-2xl">
        <SearchInput
          id={inputId}
          value={query}
          onChange={setQuery}
          label="Filter PDF tools by name"
          placeholder="Type to filter tools, e.g. merge, compress, word..."
        />
        <p className="mt-3 text-center text-sm text-slate-500" aria-live="polite" role="status">
          {hasQuery
            ? `${results.length} ${results.length === 1 ? "tool" : "tools"} found for "${query.trim()}"`
            : `Showing all ${tools.length} tools`}
        </p>
      </div>

      {results.length > 0 ? (
        <ToolGrid tools={results} headingLevel={headingLevel} className="mt-8" />
      ) : (
        <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
          <SearchX className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
          <p className="mt-3 text-lg font-bold text-ink">No tools match &ldquo;{query.trim()}&rdquo;</p>
          <p className="mt-1 text-sm text-muted">
            Try a shorter word like &ldquo;merge&rdquo;, &ldquo;jpg&rdquo; or &ldquo;compress&rdquo;, or pick a
            popular tool below.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {popularTools.slice(0, 5).map((tool) => (
              <Link
                key={tool.slug}
                href={`/${tool.slug}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-brand-500"
              >
                {tool.name}
              </Link>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-5 text-sm font-semibold text-brand-500 underline underline-offset-4 hover:text-brand-600"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
