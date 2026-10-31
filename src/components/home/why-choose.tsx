import { BadgeCheck, Gauge, Globe, LayoutGrid, ShieldCheck, Smartphone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const reasons = [
  {
    icon: BadgeCheck,
    title: "Completely free",
    text: "Every tool is free to use. No trials, no premium paywall and no credit card.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy first",
    text: "No mandatory account. We are designing every tool to handle your files with as little data as possible.",
  },
  {
    icon: LayoutGrid,
    title: "30 tools in one place",
    text: "Convert, edit, organise and inspect PDFs without jumping between different websites.",
  },
  {
    icon: Smartphone,
    title: "Works on every device",
    text: "A responsive design that is just as easy to use on a phone or tablet as on a desktop.",
  },
  {
    icon: Gauge,
    title: "Fast and lightweight",
    text: "Pages load quickly and stay simple, even on slower mobile connections.",
  },
  {
    icon: Globe,
    title: "Made for everyone",
    text: "Clear instructions and plain language, so anyone can get their PDF task done.",
  },
];

export function WhyChoose() {
  return (
    <section aria-labelledby="why-heading" className="bg-slate-50 py-20">
      <Container>
        <SectionHeading
          id="why-heading"
          eyebrow="Why PDF Master Tools"
          title="Why choose PDF Master Tools"
          description="Built to be the simplest, most trustworthy place to work with PDF files online."
        />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-2xl bg-white p-6 ring-1 ring-slate-200 transition hover:ring-indigo-200">
              <Icon className="h-7 w-7 text-brand-500" aria-hidden="true" strokeWidth={1.8} />
              <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
