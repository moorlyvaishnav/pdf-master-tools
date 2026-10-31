import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { tools } from "@/data/tools";
import { categories } from "@/data/categories";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/tools`, lastModified, changeFrequency: "weekly", priority: 0.9 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${base}/tools/${category.id}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const toolPages: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${base}/${tool.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: tool.popular ? 0.9 : 0.7,
  }));

  const infoPages: MetadataRoute.Sitemap = [
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms-and-conditions",
    "/disclaimer",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [...staticPages, ...categoryPages, ...toolPages, ...infoPages];
}
