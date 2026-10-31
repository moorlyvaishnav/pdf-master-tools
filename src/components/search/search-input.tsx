"use client";

import { Search, X } from "lucide-react";
import type { ChangeEvent, KeyboardEvent } from "react";

interface SearchInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label: string;
  size?: "md" | "lg";
  /** ARIA combobox attributes when used with a suggestion list. */
  ariaProps?: ComboboxAriaProps;
}

interface ComboboxAriaProps {
  role?: "combobox";
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
  "aria-autocomplete"?: "none" | "inline" | "list" | "both";
  "aria-activedescendant"?: string;
}

export function SearchInput({
  id,
  value,
  onChange,
  onKeyDown,
  placeholder = "Search PDF tools...",
  label,
  size = "md",
  ariaProps,
}: SearchInputProps) {
  const sizing = size === "lg" ? "h-14 pl-12 pr-12 text-base" : "h-12 pl-11 pr-11 text-[15px]";

  return (
    <div className="relative w-full">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400 ${
          size === "lg" ? "left-4 h-5 w-5" : "left-3.5 h-5 w-5"
        }`}
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        autoComplete="off"
        spellCheck={false}
        value={value}
        placeholder={placeholder}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        className={`w-full rounded-xl border border-slate-200 bg-white font-medium text-ink shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 [&::-webkit-search-cancel-button]:hidden ${sizing}`}
        {...ariaProps}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
