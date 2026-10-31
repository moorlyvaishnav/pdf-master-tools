"use client";

import { useMemo, useRef, useState, type FocusEvent, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { tools } from "@/data/tools";
import { searchTools } from "@/lib/search";
import { ToolIcon } from "@/components/tools/tool-icon";
import { SearchInput } from "./search-input";

const MAX_SUGGESTIONS = 6;

/** Hero search: live suggestions while typing, Enter / button opens filtered results. */
export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLFormElement>(null);

  const suggestions = useMemo(
    () => (query.trim() ? searchTools(tools, query).slice(0, MAX_SUGGESTIONS) : []),
    [query]
  );
  const showList = focused && query.trim().length > 0;

  function updateQuery(value: string) {
    setQuery(value);
    setActiveIndex(-1);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      router.push(`/${suggestions[activeIndex].slug}`);
      return;
    }
    const q = query.trim();
    router.push(q ? `/tools?q=${encodeURIComponent(q)}` : "/tools");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showList || suggestions.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (event.key === "Escape") {
      setFocused(false);
    }
  }

  return (
    <form
      ref={wrapperRef}
      role="search"
      onSubmit={onSubmit}
      onFocus={() => setFocused(true)}
      onBlur={(event: FocusEvent<HTMLFormElement>) => {
        if (!wrapperRef.current?.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
      className="relative mx-auto w-full max-w-2xl"
    >
      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-indigo-500/10 sm:flex-row">
        <SearchInput
          id="hero-search"
          value={query}
          onChange={updateQuery}
          onKeyDown={onKeyDown}
          size="lg"
          label="Search PDF tools"
          placeholder="Search tools, e.g. merge or jpg"
          ariaProps={{
            role: "combobox",
            "aria-expanded": showList,
            "aria-controls": "hero-search-results",
            "aria-autocomplete": "list",
            "aria-activedescendant": activeIndex >= 0 ? `hero-option-${activeIndex}` : undefined,
          }}
        />
        <button
          type="submit"
          className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-gradient px-6 text-base font-bold text-white shadow-md shadow-indigo-500/25 transition hover:opacity-95 hover:shadow-lg"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
          Search
        </button>
      </div>

      {showList && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-2xl shadow-slate-900/10">
          {suggestions.length > 0 ? (
            <ul id="hero-search-results" role="listbox" aria-label="Matching tools" className="py-2">
              {suggestions.map((tool, index) => (
                <li key={tool.slug} id={`hero-option-${index}`} role="option" aria-selected={index === activeIndex}>
                  <Link
                    href={`/${tool.slug}`}
                    className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                      index === activeIndex ? "bg-brand-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-brand-500">
                      <ToolIcon name={tool.iconName} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink">{tool.name}</span>
                      <span className="block truncate text-sm text-slate-500">{tool.summary}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-300" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p id="hero-search-results" className="px-5 py-4 text-sm text-muted" role="status">
              No tools found for &ldquo;{query.trim()}&rdquo;. Try another word, or{" "}
              <Link href="/tools" className="font-semibold text-brand-500 underline underline-offset-4">
                browse all tools
              </Link>
              .
            </p>
          )}
        </div>
      )}
    </form>
  );
}
