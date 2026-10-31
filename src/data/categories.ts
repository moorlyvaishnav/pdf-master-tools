export type CategoryId = "image-to-pdf" | "convert" | "edit" | "organize" | "utilities";

export interface ToolCategory {
  id: CategoryId;
  /** Short name shown on section headings and chips. */
  name: string;
  /** H1 used on the category page. */
  heading: string;
  description: string;
  /** Longer intro used on the category landing page (unique content for SEO). */
  intro: string;
  iconName: string;
  /** Tailwind classes for the category accent (icon background + text). */
  accent: string;
}

export const categories: ToolCategory[] = [
  {
    id: "image-to-pdf",
    name: "Image to PDF",
    heading: "Image to PDF Converters",
    description: "Turn photos, scans and screenshots into clean, shareable PDF documents.",
    intro:
      "Photos and screenshots are hard to share as a tidy set. These tools combine JPG, PNG and HEIC images into a single PDF that keeps page order, prints well and opens on every device.",
    iconName: "image",
    accent: "bg-sky-50 text-sky-600 ring-sky-100",
  },
  {
    id: "convert",
    name: "PDF Conversion",
    heading: "PDF Conversion Tools",
    description: "Convert PDFs to images and Office formats, or turn documents into PDF.",
    intro:
      "Move content in and out of PDF without retyping it. Export pages as JPG or PNG images, turn a PDF into an editable Word file, or convert Word, Excel and PowerPoint files into PDFs that look the same everywhere.",
    iconName: "refresh",
    accent: "bg-blue-50 text-blue-600 ring-blue-100",
  },
  {
    id: "edit",
    name: "PDF Editing",
    heading: "PDF Editing Tools",
    description: "Add text, signatures, watermarks, page numbers and highlights to PDFs.",
    intro:
      "Make changes to a PDF without the original source file. Fix typos, fill in details, sign documents, mark important passages and brand your files with watermarks and page numbers.",
    iconName: "pen",
    accent: "bg-violet-50 text-violet-600 ring-violet-100",
  },
  {
    id: "organize",
    name: "PDF Management",
    heading: "PDF Management Tools",
    description: "Merge, split, compress, rotate, reorder and secure your PDF files.",
    intro:
      "Keep documents organised and easy to share. Combine files, pull out the pages you need, shrink large PDFs for email and add or remove password protection on files you own.",
    iconName: "layers",
    accent: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  },
  {
    id: "utilities",
    name: "PDF Utilities",
    heading: "PDF Utility Tools",
    description: "Inspect PDF metadata, count pages, extract text and check file size.",
    intro:
      "Quick answers about any PDF. See who created a file and when, count its pages, pull out the plain text and check whether it is small enough to upload or attach.",
    iconName: "wrench",
    accent: "bg-fuchsia-50 text-fuchsia-600 ring-fuchsia-100",
  },
];

export function getCategory(id: CategoryId): ToolCategory {
  const category = categories.find((c) => c.id === id);
  if (!category) throw new Error(`Unknown category: ${id}`);
  return category;
}

export function isCategoryId(value: string): value is CategoryId {
  return categories.some((c) => c.id === value);
}
