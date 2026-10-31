import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LEGAL_LAST_UPDATED } from "@/components/legal/legal-page";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = buildMetadata({
  title: "Terms and Conditions",
  description:
    "The terms and conditions for using PDF Master Tools, including acceptable use, your responsibilities for files, and limitations of liability.",
  path: "/terms-and-conditions",
});

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms and Conditions"
      path="/terms-and-conditions"
      intro={`By using ${siteConfig.name}, you agree to these Terms and Conditions. Please read them carefully.`}
      lastUpdated={LEGAL_LAST_UPDATED}
    >
      <p>
        <em>
          Placeholder notice: these terms are a starting template. Have them reviewed by a qualified professional before
          relying on them.
        </em>
      </p>

      <h2>1. Use of the service</h2>
      <p>
        {siteConfig.name} provides free online tools for working with PDF and related files. You may use the website for
        personal and commercial purposes in line with these terms and all applicable laws.
      </p>

      <h2>2. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the tools with files you do not have the right to use, copy or modify.</li>
        <li>Remove passwords or restrictions from documents you are not authorised to access.</li>
        <li>Upload content that is illegal, harmful, or infringes the rights of others.</li>
        <li>Attempt to disrupt, overload or gain unauthorised access to the website or its systems.</li>
        <li>Use automated means to access the tools at a volume that harms the service for others.</li>
      </ul>

      <h2>3. Your files and content</h2>
      <p>
        You keep all rights to the files you use with our tools. You are responsible for the content of your files and for
        keeping your own backup copies.
      </p>

      <h2>4. Availability</h2>
      <p>
        The website is being released in phases and some tools are not yet functional. We may add, change or remove tools
        at any time, and we do not guarantee that the website will always be available or error-free.
      </p>

      <h2>5. Intellectual property</h2>
      <p>
        The {siteConfig.name} name, logo, design and website content are owned by us and may not be copied without
        permission. Product names such as Word, Excel and PowerPoint belong to their respective owners and are used only
        to describe file formats.
      </p>

      <h2>6. Disclaimer of warranties</h2>
      <p>
        The website and tools are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any
        kind. See our <Link href="/disclaimer">Disclaimer</Link> for more information.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {siteConfig.name} is not liable for any indirect, incidental or
        consequential damages, or for any loss of data, arising from your use of the website.
      </p>

      <h2>8. Third-party links and advertising</h2>
      <p>
        The website may contain advertisements or links to third-party websites. We are not responsible for the content or
        practices of those websites.
      </p>

      <h2>9. Changes to these terms</h2>
      <p>
        We may update these terms from time to time. Continued use of the website after changes are published means you
        accept the updated terms.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions about these terms can be sent through our <Link href="/contact">Contact Us</Link> page.
      </p>
    </LegalPage>
  );
}
