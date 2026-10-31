import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LEGAL_LAST_UPDATED } from "@/components/legal/legal-page";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = buildMetadata({
  title: "Disclaimer",
  description:
    "Disclaimer for PDF Master Tools: information about tool accuracy, availability, file backups, third-party trademarks and advertising.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer"
      path="/disclaimer"
      intro={`Please read this disclaimer before using ${siteConfig.name}.`}
      lastUpdated={LEGAL_LAST_UPDATED}
    >
      <p>
        <em>Placeholder notice: update this disclaimer to reflect your final service before launch.</em>
      </p>

      <h2>General information</h2>
      <p>
        The tools and content on {siteConfig.name} are provided for general use. While we work hard to make every tool
        accurate and reliable, we cannot guarantee that results will be error-free or suitable for every purpose.
      </p>

      <h2>Tool availability</h2>
      <p>
        The website is being released in phases. Some tool pages currently show the interface only, and file processing
        for those tools will be added in future updates. Each tool page clearly states whether the tool is ready.
      </p>

      <h2>Keep your original files</h2>
      <p>
        Always keep a copy of your original documents. Conversions between formats, compression and editing can change how
        a document looks. Check every result before relying on it, especially for legal, financial or official documents.
      </p>

      <h2>Not professional advice</h2>
      <p>
        Information on this website, including FAQs about signatures, passwords or legal acceptance of documents, is
        general information and not legal or professional advice.
      </p>

      <h2>Trademarks</h2>
      <p>
        Microsoft Word, Excel and PowerPoint, Apple HEIC and other product names are trademarks of their respective
        owners. {siteConfig.name} is not affiliated with or endorsed by these companies.
      </p>

      <h2>Advertising and external links</h2>
      <p>
        {siteConfig.name} may show third-party advertisements and link to external websites. We do not endorse and are
        not responsible for products, services or content offered by advertisers or linked websites.
      </p>

      <h2>Questions</h2>
      <p>
        If you have questions about this disclaimer, please <Link href="/contact">contact us</Link>. See also our{" "}
        <Link href="/terms-and-conditions">Terms and Conditions</Link> and{" "}
        <Link href="/privacy-policy">Privacy Policy</Link>.
      </p>
    </LegalPage>
  );
}
