import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { siteConfig } from "@/config/site";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - Free Online PDF Tools`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "pdf tools",
    "free pdf tools",
    "merge pdf",
    "compress pdf",
    "pdf to word",
    "jpg to pdf",
    "edit pdf",
    "split pdf",
  ],
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: `${siteConfig.name} - Free Online PDF Tools`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary",
    title: `${siteConfig.name} - Free Online PDF Tools`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main-content"
          className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-semibold text-brand-600 shadow focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
