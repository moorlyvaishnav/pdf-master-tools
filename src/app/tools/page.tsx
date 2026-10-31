import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ToolSearch } from "@/components/search/tool-search";
import { ToolIcon } from "@/components/tools/tool-icon";
import { AdSlot } from "@/components/ads/ad-slot";
import { categories } from "@/data/categories";
import { getToolsByCategory, tools } from "@/data/tools";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "All PDF Tools - Convert, Edit, Merge & More",
  description:
    "Browse all 30 free PDF tools in one place. Search instantly to find tools to convert, edit, merge, split, compress, protect and inspect PDF files.",
  path: "/tools",
});

export default function AllToolsPage() {
  return (
    <>
      <section className="bg-hero-glow pb-10 pt-10 sm:pt-14">
        <Container>
          <Breadcrumbs items={[{ label: "All PDF Tools", href: "/tools" }]} />
          <div className="mt-8 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
              All <span className="text-gradient">PDF Tools</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
              {tools.length} free tools to convert, edit, organise and inspect PDF files. Start typing to filter the list
              instantly.
            </p>
          </div>

          <nav aria-label="Tool categories" className="mt-8">
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/tools/${category.id}`}
                    className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:ring-indigo-300"
                  >
                    <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ring-1 ${category.accent}`}>
                      <ToolIcon name={category.iconName} className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-ink">{category.name}</span>
                      <span className="block text-xs text-slate-500">
                        {getToolsByCategory(category.id).length} tools
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </section>

      <Container className="py-12">
        <h2 className="sr-only">Search and browse tools</h2>
        <ToolSearch inputId="all-tools-search" syncWithUrl />
      </Container>

      <Container className="pt-4">
        <AdSlot placement="home-between" className="mx-auto max-w-4xl" />
      </Container>
    </>
  );
}
