import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "./json-ld";
import { absoluteUrl } from "@/lib/seo";

export interface Crumb {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
}

/** Visible breadcrumb trail plus BreadcrumbList structured data. */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const all: Crumb[] = [{ label: "Home", href: "/" }, ...items];

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm">
        <ol className="flex flex-wrap items-center gap-1 text-slate-500">
          {all.map((item, index) => {
            const isLast = index === all.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-1">
                {isLast ? (
                  <span aria-current="page" className="font-medium text-slate-700">
                    {item.label}
                  </span>
                ) : (
                  <>
                    <Link href={item.href} className="rounded transition-colors hover:text-brand-500">
                      {item.label}
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.label,
            item: absoluteUrl(item.href),
          })),
        }}
      />
    </>
  );
}
