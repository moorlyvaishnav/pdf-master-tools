import { CircleCheck, FileInput, Info, Lightbulb } from "lucide-react";
import type { Tool } from "@/data/tools";

interface ToolGuideProps {
  tool: Tool;
}

/** "How to use" steps plus an instructions panel with formats, tips and use cases. */
export function ToolGuide({ tool }: ToolGuideProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <section aria-labelledby="how-to-heading" className="lg:col-span-3">
        <h2 id="how-to-heading" className="text-2xl font-extrabold tracking-tight text-ink">
          How to use {tool.name}
        </h2>
        <ol className="mt-6 space-y-4">
          {tool.steps.map((step, index) => (
            <li key={step} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <span
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-sm font-extrabold text-white"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="font-bold text-ink">Step {index + 1}</h3>
                <p className="mt-1 leading-relaxed text-muted">{step}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="instructions-heading" className="lg:col-span-2">
        <div className="h-full rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
          <h2 id="instructions-heading" className="flex items-center gap-2 text-xl font-extrabold text-ink">
            <Info className="h-5 w-5 text-brand-500" aria-hidden="true" />
            Instructions
          </h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex gap-3">
              <FileInput className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
              <div>
                <dt className="font-semibold text-ink">Accepted files</dt>
                <dd className="text-muted">
                  {tool.accepts}
                  {tool.multiple ? " - you can add several files at once." : " - one file at a time."}
                </dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
              <div>
                <dt className="font-semibold text-ink">Tip</dt>
                <dd className="text-muted">
                  Keep a copy of your original file. Tools always create a new file and never overwrite the original.
                </dd>
              </div>
            </div>
          </dl>

          <h3 className="mt-7 font-bold text-ink">Common uses</h3>
          <ul className="mt-3 space-y-2.5">
            {tool.useCases.map((useCase) => (
              <li key={useCase} className="flex gap-2.5 text-sm text-muted">
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                {useCase}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
