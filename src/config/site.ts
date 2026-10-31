/**
 * Central site configuration.
 * Update NEXT_PUBLIC_SITE_URL (see .env.example) before deploying so that
 * canonical URLs, Open Graph tags, sitemap.xml and robots.txt are correct.
 */
function normalizeUrl(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export const siteConfig = {
  name: "PDF Master Tools",
  shortName: "PDF Master",
  url: normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL || "https://www.example.com"),
  tagline: "All Your PDF Tools in One Place",
  description:
    "Free online PDF tools to convert, edit, merge, split, compress and manage PDF files. Simple, fast and built for everyone, on any device.",
  // Placeholder contact address - replace with your real support email.
  contactEmail: "support@example.com",
  locale: "en_US",
  showAdPlaceholders: process.env.NEXT_PUBLIC_SHOW_AD_PLACEHOLDERS !== "false",
} as const;

export const mainNav = [
  { label: "Home", href: "/" },
  { label: "All PDF Tools", href: "/tools" },
  { label: "Edit PDF", href: "/tools/edit" },
  { label: "Convert PDF", href: "/tools/convert" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
] as const;

export const legalNav = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms and Conditions", href: "/terms-and-conditions" },
  { label: "Disclaimer", href: "/disclaimer" },
] as const;
