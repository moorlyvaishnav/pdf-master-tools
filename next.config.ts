import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // ESLint is not part of the Phase 1 toolchain (keeps dependencies minimal).
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      {
        // pdf.js (PDF previews) is loaded as an ES module, which browsers only
        // accept with a JavaScript content type.
        source: "/pdfjs/:file(.*\\.mjs)",
        headers: [{ key: "Content-Type", value: "text/javascript; charset=utf-8" }],
      },
    ];
  },
};

export default nextConfig;
