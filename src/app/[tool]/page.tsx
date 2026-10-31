import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { tools, getToolBySlug, getRelatedTools, getSharedFaqs } from "@/data/tools";
import { Container } from "@/components/ui/container";
import { FaqList } from "@/components/ui/faq-list";
import { AdSlot } from "@/components/ads/ad-slot";
import { ToolHero } from "@/components/tool-page/tool-hero";
import { ToolGuide } from "@/components/tool-page/tool-guide";
import { UploadPlaceholder } from "@/components/tool-page/upload-placeholder";
import { ToolWorkspace } from "@/components/tool-ui/tool-workspace";
import { JsonLd } from "@/components/ui/json-ld";
import { siteConfig } from "@/config/site";
import { ToolGrid } from "@/components/tools/tool-grid";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

interface ToolPageProps {
  params: Promise<{ tool: string }>;
}

// Only the 30 known tool slugs exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams(): { tool: string }[] {
  return tools.map((tool) => ({ tool: tool.slug }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { tool: slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  return buildMetadata({
    title: `${tool.name} - Free Online Tool`,
    description: tool.metaDescription,
    path: `/${tool.slug}`,
  });
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { tool: slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const related = getRelatedTools(tool, 4);
  const faqs = [...tool.faqs, ...getSharedFaqs(tool)];

  return (
    <>
      {tool.available && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: `${tool.name} - ${siteConfig.name}`,
            url: absoluteUrl(`/${tool.slug}`),
            description: tool.metaDescription,
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Any (runs in the web browser)",
            browserRequirements: "Requires JavaScript",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }}
        />
      )}
      <section className="bg-hero-glow pb-12 pt-10 sm:pt-14" aria-label={`${tool.name} tool`}>
        <Container>
          <ToolHero tool={tool} />
          <div className="mx-auto mt-10 max-w-3xl">
            {tool.available ? (
              <ToolWorkspace slug={tool.slug} />
            ) : (
              <UploadPlaceholder
                toolName={tool.name}
                accepts={tool.accepts}
                acceptAttr={tool.acceptAttr}
                multiple={tool.multiple}
              />
            )}
          </div>
        </Container>
      </section>

      {/* Ad kept well below the tool interface, never beside upload controls. */}
      <Container className={tool.available ? "pt-12" : "pt-6"}>
        <AdSlot placement="tool-below-interface" className="mx-auto max-w-4xl" />
      </Container>

      <Container className="py-16">
        <ToolGuide tool={tool} />
      </Container>

      <section aria-labelledby="tool-faq-heading" className="pb-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 id="tool-faq-heading" className="text-center text-2xl font-extrabold tracking-tight text-ink">
              {tool.name} - Frequently Asked Questions
            </h2>
            <div className="mt-8">
              <FaqList items={faqs} />
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="related-heading" className="border-t border-slate-100 bg-slate-50/60 py-16">
        <Container>
          <h2 id="related-heading" className="text-2xl font-extrabold tracking-tight text-ink">
            Related PDF tools
          </h2>
          <ToolGrid tools={related} className="mt-6" />
        </Container>
      </section>

      <Container className="pt-12">
        <AdSlot placement="tool-bottom" className="mx-auto max-w-4xl" />
      </Container>
    </>
  );
}
