import Link from "next/link";
import { ArrowRight, ShieldCheck, Smartphone, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { HeroSearch } from "@/components/search/hero-search";
import { ToolIcon } from "@/components/tools/tool-icon";
import { getToolBySlug, type Tool } from "@/data/tools";

// Quick shortcuts shown under the search bar.
const shortcutSlugs = ["merge-pdf", "compress-pdf", "pdf-to-word", "jpg-to-pdf", "edit-pdf", "split-pdf"];
const shortcuts = shortcutSlugs
  .map((slug) => getToolBySlug(slug))
  .filter((tool): tool is Tool => Boolean(tool));

const highlights = [
  { icon: Sparkles, label: "100% free" },
  { icon: ShieldCheck, label: "No sign-up needed" },
  { icon: Smartphone, label: "Works on any device" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero-glow" aria-labelledby="hero-heading">
      {/* Decorative grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]"
        aria-hidden="true"
      />
      <Container className="relative pb-16 pt-14 text-center sm:pb-20 sm:pt-20">
        <p className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3.5 py-1.5 text-xs font-bold text-brand-500 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-500" aria-hidden="true" />
          30 PDF tools · One simple website
        </p>

        <h1
          id="hero-heading"
          className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl"
        >
          All Your <span className="text-gradient">PDF Tools</span> in One Place
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
          Convert, Edit, Merge, Compress and Manage PDF Files Easily. 100% Free.
        </p>

        <div className="mt-9">
          <HeroSearch />
        </div>

        <div className="mt-6">
          <p className="text-sm font-semibold text-slate-500">Popular:</p>
          <ul className="mt-3 flex flex-wrap justify-center gap-2" aria-label="Popular PDF tools">
            {shortcuts.map((tool) => (
              <li key={tool.slug}>
                <Link
                  href={`/${tool.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:text-brand-500"
                >
                  <ToolIcon name={tool.iconName} className="h-4 w-4" />
                  {tool.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:opacity-95 hover:shadow-xl"
          >
            Explore All PDF Tools
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-base font-bold text-ink ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            How it works
          </Link>
        </div>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
          {highlights.map(({ icon: Icon, label }) => (
            <li key={label} className="inline-flex items-center gap-2">
              <Icon className="h-4 w-4 text-brand-500" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
