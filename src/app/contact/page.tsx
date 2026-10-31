import type { Metadata } from "next";
import Link from "next/link";
import { Bug, Lightbulb, Mail, MessageSquare } from "lucide-react";
import { LegalPage } from "@/components/legal/legal-page";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = buildMetadata({
  title: "Contact Us",
  description:
    "Contact the PDF Master Tools team with questions, feedback, bug reports or tool suggestions. We read every message.",
  path: "/contact",
});

const topics = [
  { icon: MessageSquare, title: "General questions", text: "Questions about the website or how a tool works." },
  { icon: Bug, title: "Report a problem", text: "Something not working as expected? Tell us the page and your device." },
  { icon: Lightbulb, title: "Suggest a tool", text: "Missing a PDF tool you need? We are always planning new ones." },
];

export default function ContactPage() {
  return (
    <LegalPage
      title="Contact Us"
      path="/contact"
      intro="We would love to hear from you - whether it is a question, a bug report or an idea for a new tool."
    >
      <div className="my-8 rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white">
            <Mail className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="mt-0! mb-1! text-lg font-bold text-ink">Email us</h2>
            <p className="mb-0! text-muted">
              Send your message to{" "}
              <a href={`mailto:${siteConfig.contactEmail}`} className="font-semibold">
                {siteConfig.contactEmail}
              </a>
              . We aim to reply within 2-3 business days.
            </p>
          </div>
        </div>
      </div>

      <h2>What can we help with?</h2>
      <ul className="list-none! pl-0! grid gap-4 sm:grid-cols-3">
        {topics.map(({ icon: Icon, title, text }) => (
          <li key={title} className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <Icon className="h-6 w-6 text-brand-500" aria-hidden="true" />
            <h3 className="mt-3! mb-1! text-base">{title}</h3>
            <p className="mb-0! text-sm">{text}</p>
          </li>
        ))}
      </ul>

      <h2>Before you write</h2>
      <p>
        Many common questions are answered in the FAQ section of each tool page and on our{" "}
        <Link href="/">homepage</Link>. For questions about data and privacy, please read our{" "}
        <Link href="/privacy-policy">Privacy Policy</Link>.
      </p>
      <p>
        Please do not send PDF files or personal documents by email unless we ask for them to investigate a specific
        problem.
      </p>
    </LegalPage>
  );
}
