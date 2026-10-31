import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = buildMetadata({
  title: "About Us",
  description:
    "Learn about PDF Master Tools - a free collection of 30 online PDF tools built to make converting, editing and managing PDF files simple for everyone.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <LegalPage
      title="About Us"
      path="/about"
      intro={`${siteConfig.name} is a free website that brings everyday PDF tasks together in one simple, trustworthy place.`}
    >
      <h2>Our mission</h2>
      <p>
        PDF files are everywhere - in schools, offices, government services and small businesses. Yet simple jobs like
        combining two files, making a document smaller or turning photos into a PDF often mean installing software,
        creating accounts or paying for a subscription. We believe these tasks should be quick, free and available to
        anyone with a web browser.
      </p>

      <h2>What we offer</h2>
      <p>
        {siteConfig.name} includes 30 tools organised into five groups: image to PDF, PDF conversion, PDF editing, PDF
        management and PDF utilities. Every tool has its own page with clear instructions, a step-by-step guide and answers
        to common questions. You can explore everything from the <Link href="/tools">All PDF Tools</Link> page.
      </p>

      <h2>Our principles</h2>
      <ul>
        <li>
          <strong>Free for everyone.</strong> No paid plans, no trials and no mandatory sign-up.
        </li>
        <li>
          <strong>Privacy by design.</strong> We aim to collect as little data as possible and to explain clearly how files
          are handled.
        </li>
        <li>
          <strong>Simple and accessible.</strong> Plain language, a clean interface and a design that works on phones,
          tablets and desktops.
        </li>
        <li>
          <strong>Honest about what works.</strong> Each tool page states clearly whether the tool is available yet.
        </li>
      </ul>

      <h2>Where we are today</h2>
      <p>
        We are launching in phases. Twelve tools already work today and run entirely in your browser:{" "}
        <Link href="/jpg-to-pdf">JPG to PDF</Link>, <Link href="/png-to-pdf">PNG to PDF</Link>,{" "}
        <Link href="/pdf-to-jpg">PDF to JPG</Link>, <Link href="/pdf-to-png">PDF to PNG</Link>,{" "}
        <Link href="/merge-pdf">Merge PDF</Link>, <Link href="/split-pdf">Split PDF</Link>,{" "}
        <Link href="/compress-pdf">Compress PDF</Link>, <Link href="/rotate-pdf">Rotate PDF</Link>,{" "}
        <Link href="/delete-pdf-pages">Delete PDF Pages</Link>, <Link href="/add-watermark">Add Watermark</Link>,{" "}
        <Link href="/add-page-numbers">Add Page Numbers</Link> and <Link href="/protect-pdf">Protect PDF</Link>. The
        remaining tools are being added in upcoming releases. If you have suggestions, we would love to hear them on our{" "}
        <Link href="/contact">contact page</Link>.
      </p>

      <h2>How the website is funded</h2>
      <p>
        To keep every tool free, {siteConfig.name} may display advertising. Ads are always clearly labelled and kept
        separate from the tools themselves.
      </p>
    </LegalPage>
  );
}
