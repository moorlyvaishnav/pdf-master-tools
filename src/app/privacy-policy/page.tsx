import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LEGAL_LAST_UPDATED } from "@/components/legal/legal-page";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "Read the PDF Master Tools Privacy Policy: what information we collect, how files are handled, cookies, advertising and your privacy choices.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      path="/privacy-policy"
      intro={`This Privacy Policy explains how ${siteConfig.name} collects, uses and protects information when you use our website.`}
      lastUpdated={LEGAL_LAST_UPDATED}
    >
      <p>
        <em>
          Placeholder notice: this policy is a starting template. Review it with a qualified professional and update it
          before enabling file processing or advertising.
        </em>
      </p>

      <h2>1. Information we collect</h2>
      <p>We aim to collect as little information as possible. Depending on how you use the website, this may include:</p>
      <ul>
        <li>
          <strong>Usage information</strong> such as pages visited, browser type, device type and approximate location
          derived from your IP address, collected through server logs or analytics.
        </li>
        <li>
          <strong>Information you send us</strong>, for example when you email us through the{" "}
          <Link href="/contact">Contact Us</Link> page.
        </li>
      </ul>
      <p>We do not require you to create an account and we do not ask for your name to use any tool.</p>

      <h2>2. Files you use with our tools</h2>
      <p>
        Our working tools (JPG to PDF, PNG to PDF, PDF to JPG, PDF to PNG, Merge PDF, Split PDF, Compress PDF, Rotate
        PDF, Delete PDF Pages, Add Watermark, Add Page Numbers and Protect PDF) process your files entirely inside your
        web browser, on your own device. Passwords you enter in Protect PDF are also used only in your browser and are
        never sent to us. Your files are not uploaded to our servers, we never
        see their contents, and nothing is stored once you close or reload the page.
      </p>
      <p>
        On tool pages that are not working yet, files you select are only read by your browser to show their name and
        size. If a future tool ever needs to process files on a server, this section will be updated first to explain
        where files are processed, how long they are kept and when they are deleted. We will not sell your files or use
        their content for advertising.
      </p>

      <h2>3. Cookies</h2>
      <p>
        Cookies are small text files stored on your device. We may use essential cookies needed for the website to work,
        and, where permitted, cookies for analytics and advertising. You can control or delete cookies through your
        browser settings.
      </p>

      <h2>4. Advertising</h2>
      <p>
        We may display advertisements provided by third parties such as Google AdSense. These providers may use cookies or
        similar technologies to show ads based on your visits to this and other websites. Google&apos;s use of advertising
        cookies enables it and its partners to serve ads based on your browsing. You can learn more and manage
        personalised advertising in your Google Ads Settings. Where required by law, we will ask for your consent before
        such cookies are used.
      </p>

      <h2>5. How we use information</h2>
      <ul>
        <li>To operate, maintain and improve the website and its tools.</li>
        <li>To understand which tools are most useful.</li>
        <li>To respond to messages you send us.</li>
        <li>To keep the website secure and prevent abuse.</li>
      </ul>

      <h2>6. Sharing of information</h2>
      <p>
        We do not sell personal information. We may share limited information with service providers that help us run the
        website (for example hosting, analytics or advertising partners), or when required by law.
      </p>

      <h2>7. Data retention and security</h2>
      <p>
        We keep information only as long as needed for the purposes described above and use reasonable technical
        measures to protect it. No method of transmission over the internet is completely secure.
      </p>

      <h2>8. Your rights</h2>
      <p>
        Depending on where you live, you may have rights to access, correct or delete personal information, or to object
        to certain processing. To make a request, contact us at {siteConfig.contactEmail}.
      </p>

      <h2>9. Children&apos;s privacy</h2>
      <p>
        The website is not directed at children under 13, and we do not knowingly collect personal information from them.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The &ldquo;Last updated&rdquo; date at the top of this page
        shows when it was last changed.
      </p>

      <h2>11. Contact</h2>
      <p>
        If you have questions about this policy, please visit our <Link href="/contact">Contact Us</Link> page.
      </p>
    </LegalPage>
  );
}
