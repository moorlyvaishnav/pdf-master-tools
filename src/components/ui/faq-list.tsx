import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/data/tools";
import { JsonLd } from "./json-ld";

interface FaqListProps {
  items: FaqItem[];
  /** Emit FAQPage structured data (use once per page). */
  withSchema?: boolean;
}

/** Accessible accordion built on native <details>, so it works without JavaScript. */
export function FaqList({ items, withSchema = true }: FaqListProps) {
  return (
    <>
      <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        {items.map((item) => (
          <details key={item.question} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-ink transition-colors hover:bg-slate-50 sm:px-6 [&::-webkit-details-marker]:hidden">
              <span>{item.question}</span>
              <ChevronDown
                className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="px-5 pb-5 leading-relaxed text-muted sm:px-6">{item.answer}</p>
          </details>
        ))}
      </div>
      {withSchema && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          }}
        />
      )}
    </>
  );
}
