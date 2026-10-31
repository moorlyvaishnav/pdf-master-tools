import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { WhyChoose } from "@/components/home/why-choose";
import { AdSlot } from "@/components/ads/ad-slot";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { FaqList } from "@/components/ui/faq-list";
import { JsonLd } from "@/components/ui/json-ld";
import { ToolGrid } from "@/components/tools/tool-grid";
import { CategorySection } from "@/components/tools/category-section";
import { ToolSearch } from "@/components/search/tool-search";
import { categories } from "@/data/categories";
import { popularTools } from "@/data/tools";
import { homeFaqs } from "@/data/home-faqs";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = buildMetadata({
  title: `${siteConfig.name} - Free Online PDF Tools to Convert, Edit & Merge`,
  description:
    "All your PDF tools in one place. Convert, edit, merge, split, compress and manage PDF files online for free - no sign-up, works on any device.",
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteConfig.name,
          url: siteConfig.url,
          potentialAction: {
            "@type": "SearchAction",
            target: `${siteConfig.url}/tools?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />

      <Hero />

      <Container>
        <AdSlot placement="home-top" className="mx-auto max-w-4xl" />
      </Container>

      {/* Popular PDF Tools */}
      <section aria-labelledby="popular-heading" className="py-20">
        <Container>
          <SectionHeading
            id="popular-heading"
            eyebrow="Most used"
            title="Popular PDF Tools"
            description="The tools people reach for most often - start here for everyday PDF tasks."
          />
          <ToolGrid tools={popularTools} className="mt-10" />
        </Container>
      </section>

      {/* PDF Tools by Category */}
      <section aria-labelledby="categories-heading" className="border-y border-slate-100 bg-slate-50/60 py-20">
        <Container>
          <SectionHeading
            id="categories-heading"
            eyebrow="Browse by task"
            title="PDF Tools by Category"
            description="Five groups of tools covering every stage of working with PDF files."
          />
          <nav aria-label="Tool categories" className="mt-8">
            <ul className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <a
                    href={`#${category.id}`}
                    className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:text-brand-500 hover:ring-indigo-300"
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-12 space-y-16">
            {categories.map((category) => (
              <CategorySection key={category.id} category={category} />
            ))}
          </div>
        </Container>
      </section>

      <Container className="pt-16">
        <AdSlot placement="home-between" className="mx-auto max-w-4xl" />
      </Container>

      {/* All PDF Tools with instant search */}
      <section id="all-tools" aria-labelledby="all-tools-heading" className="scroll-mt-24 py-20">
        <Container>
          <SectionHeading
            id="all-tools-heading"
            eyebrow="Find a tool"
            title="All PDF Tools"
            description="Search all 30 tools instantly - results update as you type."
          />
          <div className="mt-10">
            <ToolSearch inputId="home-tool-search" />
          </div>
        </Container>
      </section>

      <HowItWorks />

      <WhyChoose />

      {/* FAQ */}
      <section aria-labelledby="faq-heading" className="py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
          <SectionHeading
            id="faq-heading"
            eyebrow="FAQ"
            title="Frequently Asked Questions"
            description="Quick answers about PDF Master Tools."
          />
          <div className="mt-10">
            <FaqList items={homeFaqs} />
          </div>
          </div>
        </Container>
      </section>
    </>
  );
}
