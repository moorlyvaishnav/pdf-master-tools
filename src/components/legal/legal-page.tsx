import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

interface LegalPageProps {
  title: string;
  path: string;
  intro: string;
  lastUpdated?: string;
  children: ReactNode;
}

/** Shared layout for About, Contact and legal pages. */
export function LegalPage({ title, path, intro, lastUpdated, children }: LegalPageProps) {
  return (
    <>
      <section className="bg-hero-glow pb-10 pt-10 sm:pt-14">
        <Container>
          <div className="mx-auto max-w-3xl">
            <Breadcrumbs items={[{ label: title, href: path }]} />
            <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">{title}</h1>
            <p className="mt-4 text-lg leading-relaxed text-muted">{intro}</p>
            {lastUpdated && <p className="mt-3 text-sm text-slate-500">Last updated: {lastUpdated}</p>}
          </div>
        </Container>
      </section>
      <Container className="pb-8">
        <article className="prose-page mx-auto max-w-3xl">{children}</article>
      </Container>
    </>
  );
}

export const LEGAL_LAST_UPDATED = "October 31, 2026";
