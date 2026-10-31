import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

interface PageMetaInput {
  /** Page title without the site name (the layout template appends it). */
  title: string;
  description: string;
  /** Path beginning with "/" - used for the canonical URL. */
  path: string;
  /** Set true for the homepage so the title is used as-is. */
  absoluteTitle?: boolean;
}

/** Builds consistent, unique metadata (title, description, canonical, OG, Twitter). */
export function buildMetadata({ title, description, path, absoluteTitle }: PageMetaInput): Metadata {
  const url = `${siteConfig.url}${path === "/" ? "" : path}`;
  const fullTitle = absoluteTitle ? title : `${title} | ${siteConfig.name}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url,
      title: fullTitle,
      description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description,
    },
  };
}

export function absoluteUrl(path: string): string {
  return `${siteConfig.url}${path === "/" ? "" : path}`;
}
