import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Tool } from "@/data/tools";
import { getCategory } from "@/data/categories";
import { ToolIcon } from "./tool-icon";

interface ToolCardProps {
  tool: Tool;
  /** Heading level for the tool name inside the card. */
  headingLevel?: "h3" | "h4";
}

export function ToolCard({ tool, headingLevel: Heading = "h3" }: ToolCardProps) {
  const category = getCategory(tool.category);

  return (
    <Link
      href={`/${tool.slug}`}
      className="group relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-card-hover focus-visible:-translate-y-1"
    >
      <span
        className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-110 ${category.accent}`}
      >
        <ToolIcon name={tool.iconName} className="h-6 w-6" />
      </span>
      <Heading className="mt-4 text-base font-bold text-ink">{tool.name}</Heading>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{tool.summary}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-500">
        Open tool
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </Link>
  );
}
