import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ToolGrid } from "@/components/tools/tool-grid";
import { ToolIcon } from "@/components/tools/tool-icon";
import { AdSlot } from "@/components/ads/ad-slot";
import { categories, isCategoryId, getCategory } from "@/data/categories";
import { getToolsByCategory } from "@/data/tools";
import { buildMetadata } from "@/lib/seo";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { category: string }[] {
  return categories.map((category) => ({ category: category.id }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: id } = await params;
  if (!isCategoryId(id)) return {};
  const category = getCategory(id);
  const count = getToolsByCategory(id).length;
  return buildMetadata({
    title: `Free ${category.heading}`,
    description: `${category.description} ${count} free online tools, no sign-up required.`,
    path: `/tools/${category.id}`,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: id } = await params;
  if (!isCategoryId(id)) notFound();

  const category = getCategory(id);
  const categoryTools = getToolsByCategory(id);
  const otherCategories = categories.filter((c) => c.id !== id);

  return (
    <>
      <section className="bg-hero-glow pb-12 pt-10 sm:pt-14">
        <Container>
          <Breadcrumbs
            items={[
              { label: "All PDF Tools", href: "/tools" },
              { label: category.name, href: `/tools/${category.id}` },
            ]}
          />
          <div className="mt-8 text-center">
            <span className={`mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ${category.accent}`}>
              <ToolIcon name={category.iconName} className="h-7 w-7" />
            </span>
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">{category.heading}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted">{category.intro}</p>
          </div>
        </Container>
      </section>

      <Container className="py-12">
        <h2 className="mb-6 text-xl font-extrabold text-ink">
          {categoryTools.length} {category.name.toLowerCase()} tools
        </h2>
        <ToolGrid tools={categoryTools} />
      </Container>

      <Container>
        <AdSlot placement="home-between" className="mx-auto max-w-4xl" />
      </Container>

      <Container className="pt-14">
        <h2 className="text-xl font-extrabold text-ink">Explore other categories</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {otherCategories.map((other) => (
            <li key={other.id}>
              <Link
                href={`/tools/${other.id}`}
                className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${other.accent}`}>
                  <ToolIcon name={other.iconName} className="h-5 w-5" />
                </span>
                <span className="mt-3 font-bold text-ink">{other.name}</span>
                <span className="mt-1 text-sm text-muted">{other.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
