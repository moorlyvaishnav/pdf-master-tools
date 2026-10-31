pdf.js v6.2.108 (legacy build) by Mozilla, Apache-2.0 licensed.
Vendored here so PDF previews load at runtime without bundling.
To update: copy legacy/build/pdf.min.mjs, legacy/build/pdf.worker.min.mjs,
cmaps/, standard_fonts/, wasm/, iccs/ and LICENSE from the pdfjs-dist npm package
and update PDFJS_VERSION in src/lib/pdf/preview.ts.
