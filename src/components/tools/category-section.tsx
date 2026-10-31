import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ToolCategory } from "@/data/categories";
import { getToolsByCategory } from "@/data/tools";
import { ToolIcon } from "./tool-icon";
import { ToolGrid } from "./tool-grid";

interface CategorySectionProps {
  category: ToolCategory;
}

/** One category block: heading, description, link to the category page and its tool cards. */
export function CategorySection({ category }: CategorySectionProps) {
  const categoryTools = getToolsByCategory(category.id);
  const headingId = `category-${category.id}`;

  return (
    <section aria-labelledby={headingId} className="scroll-mt-24" id={category.id}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${category.accent}`}>
            <ToolIcon name={category.iconName} className="h-5 w-5" />
          </span>
          <div>
            <h3 id={headingId} className="text-xl font-extrabold tracking-tight text-ink">
              {category.name}
            </h3>
            <p className="text-sm text-muted">{category.description}</p>
          </div>
        </div>
        <Link
          href={`/tools/${category.id}`}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-500 hover:text-brand-600"
        >
          View {category.name.toLowerCase()} tools
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <ToolGrid tools={categoryTools} headingLevel="h4" />
    </section>
  );
}
