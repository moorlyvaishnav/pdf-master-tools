import Link from "next/link";
import type { Tool } from "@/data/tools";
import { getCategory } from "@/data/categories";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ToolIcon } from "@/components/tools/tool-icon";

interface ToolHeroProps {
  tool: Tool;
}

export function ToolHero({ tool }: ToolHeroProps) {
  const category = getCategory(tool.category);

  return (
    <div className="text-center">
      <div className="flex justify-center">
        <Breadcrumbs
          items={[
            { label: category.name, href: `/tools/${category.id}` },
            { label: tool.name, href: `/${tool.slug}` },
          ]}
        />
      </div>
      <span
        className={`mx-auto mt-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl ring-1 ${category.accent}`}
      >
        <ToolIcon name={tool.iconName} className="h-8 w-8" />
      </span>
      <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
        {tool.heading}
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{tool.intro}</p>
      <p className="mt-4 text-sm text-slate-500">
        Part of{" "}
        <Link href={`/tools/${category.id}`} className="font-semibold text-brand-500 hover:text-brand-600">
          {category.heading}
        </Link>
      </p>
    </div>
  );
}
