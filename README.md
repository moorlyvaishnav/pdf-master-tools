# PDF Master Tools

Free online PDF tools website.

- **Phase 1:** website structure, 42 pages, search, SEO.
- **Phase 2:** JPG to PDF, PNG to PDF, Merge PDF, Split PDF, Rotate PDF, Delete PDF Pages.
- **Phase 3 (current):** PDF to JPG, PDF to PNG, Compress PDF, Add Watermark, Add Page Numbers, Protect PDF.

All 12 working tools run entirely in the browser — files and passwords are never uploaded.
The other 18 tool pages still show a "coming soon" notice.

## Tech stack

- Next.js 15 (App Router) + React 19
- TypeScript (strict)
- Tailwind CSS v4 (via `@tailwindcss/postcss`)
- Lucide React icons
- [pdf-lib](https://pdf-lib.js.org) — creates and edits PDFs in the browser (MIT)
- [pdf.js](https://mozilla.github.io/pdf.js/) — page previews (Apache-2.0), vendored in `public/pdfjs/`
- [JSZip](https://stuk.github.io/jszip/) — bundles Split PDF results into a ZIP (MIT)
- Static generation for every page — deploys to Vercel's free tier with no server costs

## Requirements

- Node.js 18.18 or newer (Node 20 or 22 LTS recommended) — <https://nodejs.org>
- npm (comes with Node.js)

## Run locally

```bash
cd pdf-master-tools
npm install
cp .env.example .env.local      # then edit NEXT_PUBLIC_SITE_URL
npm run dev                      # http://localhost:3000
```

Production build (do this before every deploy):

```bash
npm run build
npm run start                    # serves the production build on http://localhost:3000
```

Type-check only: `npm run typecheck`

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Your live domain, e.g. `https://www.pdfmastertools.com`. Used for canonical URLs, Open Graph, `sitemap.xml`, `robots.txt`. |
| `NEXT_PUBLIC_SHOW_AD_PLACEHOLDERS` | `false` hides the "Advertisement" placeholder boxes. |

## Upload to GitHub

1. Create an empty repository on <https://github.com/new> (no README, no .gitignore).
2. In the project folder:

```bash
git init
git add .
git commit -m "Phase 1: PDF Master Tools website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/pdf-master-tools.git
git push -u origin main
```

## Deploy on Vercel

1. Sign in at <https://vercel.com> with your GitHub account.
2. **Add New → Project**, import the `pdf-master-tools` repository.
3. Framework preset: **Next.js** (auto-detected). Leave build settings as default.
4. Under **Environment Variables** add `NEXT_PUBLIC_SITE_URL` = your domain (or the `*.vercel.app` URL for now).
5. Click **Deploy**.
6. Later, add your own domain under **Project → Settings → Domains**, update `NEXT_PUBLIC_SITE_URL`, and redeploy.
7. Submit `https://YOUR-DOMAIN/sitemap.xml` in Google Search Console.

## Project structure

```
src/
├── app/                        # Routes (App Router)
│   ├── layout.tsx              # Root layout: font, header, footer, default metadata
│   ├── page.tsx                # Homepage
│   ├── globals.css             # Tailwind v4 theme + utilities
│   ├── icon.svg                # Favicon
│   ├── not-found.tsx           # 404 page
│   ├── sitemap.ts              # /sitemap.xml
│   ├── robots.ts               # /robots.txt
│   ├── [tool]/page.tsx         # 30 tool pages: /merge-pdf, /jpg-to-pdf, ...
│   ├── tools/page.tsx          # /tools  – all tools + instant search
│   ├── tools/[category]/page.tsx  # /tools/edit, /tools/convert, ...
│   ├── about/  contact/  privacy-policy/  terms-and-conditions/  disclaimer/
├── components/
│   ├── layout/                 # header.tsx (responsive + mobile menu), footer.tsx
│   ├── home/                   # hero, how-it-works, why-choose
│   ├── tools/                  # tool-card, tool-grid, category-section, tool-icon
│   ├── search/                 # hero-search (suggestions), tool-search (instant filter), search-input
│   ├── tool-page/              # tool-hero, upload-placeholder, tool-guide
│   ├── ads/ad-slot.tsx         # Reusable advertisement placeholder
│   ├── legal/legal-page.tsx    # Shared layout for legal/info pages
│   └── ui/                     # logo, container, section-heading, breadcrumbs, faq-list, json-ld
├── config/site.ts              # Site name, URL, contact email, navigation
├── data/                       # tools.ts (all 30 tools + content), categories.ts, home-faqs.ts
└── lib/                        # seo.ts (metadata builder), search.ts (search logic)
```

## How the working tools are built

- Processing code: `src/lib/pdf/` (pure functions, no UI) — `images-to-pdf.ts`, `operations.ts` (merge, split,
  rotate, delete), `page-ranges.ts`, `files.ts` (type detection by file content, limits), `preview.ts` (pdf.js
  thumbnails and page-to-image rendering), `compress.ts` (image re-encoding + lossless clean-up), `stamp.ts`
  (watermarks and page numbers, rotation-aware), `encrypt.ts` (AES-256 password protection).
- Protect PDF implements the PDF 2.0 standard security handler (AES-256, revision 6) with the browser's WebCrypto
  API, because pdf-lib has no encryption support. Output was verified with qpdf, pypdf and poppler.
- Tool screens: `src/components/tool-ui/` — shared dropzone, progress bar, error and result panels, page tiles,
  and one component per tool in `tools/`.
- `src/components/tool-ui/tool-workspace.tsx` lazy-loads each tool, so pdf-lib only downloads on those six pages.
- A tool is switched on by `available: true` in `src/data/tools.ts`, plus an entry in `tool-workspace.tsx`.
- pdf.js is served from `public/pdfjs/` and imported at runtime (not bundled). See `public/pdfjs/README.txt`
  to update it.

## Where to edit things

- **Tool names, descriptions, steps, FAQs** → `src/data/tools.ts`
- **Categories** → `src/data/categories.ts`
- **Navigation, contact email** → `src/config/site.ts` (replace `support@example.com`)
- **Legal text** → `src/app/privacy-policy`, `terms-and-conditions`, `disclaimer` (placeholder templates — have them reviewed)

## Google AdSense (later)

`src/components/ads/ad-slot.tsx` is the single place to add AdSense. Each slot has a `placement`
(`home-top`, `home-between`, `tool-below-interface`, `tool-bottom`). After approval, replace the
placeholder box with your `<ins class="adsbygoogle">` unit and load the AdSense script in `layout.tsx`.
Slots are labelled "Advertisement", reserve height to avoid layout shift, and are kept away from upload/download controls.

## Known limitations

- 24 of 30 tools are not functional yet (their pages say so).
- Files are processed in browser memory: limits are 100 MB per file and 300 MB per batch; very large files can be
  slow on older phones.
- Password-protected PDFs are rejected with a clear message (Unlock PDF comes later).
- Merge PDF does not keep bookmarks (outlines); interactive form fields may stop being fillable after merging.
- JPG to PDF corrects rotated phone photos (EXIF orientation) but ignores rare mirrored orientations.
- Page previews are rendered for the first 300 pages; larger files still work with numbered placeholders.
- PDF to JPG/PNG converts up to 50 pages per run at 300 DPI (150 at 150 DPI, 300 at 72 DPI) to protect phone
  memory; very large pages are rendered slightly smaller to stay within browser canvas limits (the tool says so).
- Compress PDF only reduces images (JPEG and 8-bit RGB/gray images); fonts, text, vector art, CMYK, indexed,
  JPEG 2000 and JBIG2 images are left unchanged. If the result isn't at least 1% smaller, no file is offered.
- Watermarks and page numbers use the standard PDF fonts, which support Latin characters only (no Hindi, Arabic,
  Chinese, Japanese, etc. yet). Watermarks are visible overlays, not redaction or security.
- Protect PDF sets an opening password (all permissions allowed for anyone with the password); it does not offer
  print/copy restrictions. Digitally signed PDFs are refused. Forgotten passwords cannot be recovered.
- Contact page uses a `mailto:` link (no backend form).
- No Open Graph image yet (text-only social previews).
- Legal pages are placeholder templates.
- No cookie-consent banner yet — needed before enabling AdSense for EU/UK visitors.
