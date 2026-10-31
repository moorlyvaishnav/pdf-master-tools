import type { Metadata } from "next";
import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ToolGrid } from "@/components/tools/tool-grid";
import { popularTools } from "@/data/tools";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Container className="py-20">
      <div className="text-center">
        <FileQuestion className="mx-auto h-14 w-14 text-brand-500" aria-hidden="true" strokeWidth={1.6} />
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Page not found</h1>
        <p className="mx-auto mt-3 max-w-lg text-muted">
          The page you are looking for does not exist or has moved. Try one of our popular tools or browse the full list.
        </p>
        <Link
          href="/tools"
          className="mt-7 inline-flex rounded-xl bg-brand-gradient px-6 py-3 font-bold text-white shadow-md shadow-indigo-500/25 transition hover:opacity-95"
        >
          Browse all PDF tools
        </Link>
      </div>
      <h2 className="mt-16 text-xl font-extrabold text-ink">Popular tools</h2>
      <ToolGrid tools={popularTools.slice(0, 8)} className="mt-6" />
    </Container>
  );
}
