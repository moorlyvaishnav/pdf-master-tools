import Link from "next/link";
import { Container } from "@/components/ui/container";
import { LogoMark } from "@/components/ui/logo";
import { categories } from "@/data/categories";
import { popularTools } from "@/data/tools";
import { legalNav, siteConfig } from "@/config/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-slate-200 bg-slate-50">
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label={`${siteConfig.name} - home`}>
              <LogoMark className="h-9 w-9" gradientId="pmt-logo-gradient-footer" />
              <span className="text-lg font-extrabold tracking-tight text-ink">{siteConfig.name}</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Free online tools to convert, edit, organise and manage PDF files - simple enough for anyone, on any
              device.
            </p>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">Tool Categories</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link href={`/tools/${category.id}`} className="text-muted transition-colors hover:text-brand-500">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">Popular Tools</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {popularTools.slice(0, 6).map((tool) => (
                <li key={tool.slug}>
                  <Link href={`/${tool.slug}`} className="text-muted transition-colors hover:text-brand-500">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">Company</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {legalNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-muted transition-colors hover:text-brand-500">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          <p>Free PDF tools for everyone. No sign-up required.</p>
        </div>
      </Container>
    </footer>
  );
}
