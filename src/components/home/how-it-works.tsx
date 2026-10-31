import { Download, MousePointerClick, Upload } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const steps = [
  {
    icon: MousePointerClick,
    title: "Choose a tool",
    text: "Pick from 30 PDF tools, or search for what you need - merge, compress, convert, sign and more.",
  },
  {
    icon: Upload,
    title: "Add your file",
    text: "Drag and drop your file into the upload area, or select it from your computer or phone.",
  },
  {
    icon: Download,
    title: "Download the result",
    text: "Adjust the options, run the tool and save your new file. No account, no email, no waiting list.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="scroll-mt-24 py-20">
      <Container>
        <SectionHeading
          id="how-heading"
          eyebrow="How it works"
          title="Three simple steps for every PDF task"
          description="Every tool follows the same easy flow, so once you know one, you know them all."
        />
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <li
              key={title}
              className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:shadow-card-hover"
            >
              <span className="absolute right-5 top-5 text-5xl font-extrabold text-slate-100" aria-hidden="true">
                {index + 1}
              </span>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-md shadow-indigo-500/25">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-ink">
                <span className="sr-only">Step {index + 1}: </span>
                {title}
              </h3>
              <p className="mt-2 leading-relaxed text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
