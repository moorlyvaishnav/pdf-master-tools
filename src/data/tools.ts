import type { CategoryId } from "./categories";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Tool {
  slug: string;
  name: string;
  category: CategoryId;
  iconName: string;
  popular?: boolean;
  /** True when the tool is fully working (processing runs in the browser). */
  available?: boolean;
  /** One-line card description. */
  summary: string;
  /** SEO-friendly H1 heading for the tool page. */
  heading: string;
  /** Meta description (unique per tool, ~150 characters). */
  metaDescription: string;
  /** Intro paragraph shown under the heading. */
  intro: string;
  /** Human-readable list of accepted input formats. */
  accepts: string;
  /** Value for the file input's accept attribute. */
  acceptAttr: string;
  multiple: boolean;
  /** Three "how to use" steps. */
  steps: [string, string, string];
  /** Typical reasons people use this tool. */
  useCases: string[];
  /** Tool-specific FAQs (shared FAQs are appended on the page). */
  faqs: FaqItem[];
  /** Extra search keywords. */
  keywords: string[];
}

const PDF = ".pdf,application/pdf";

export const tools: Tool[] = [
  // ───────────────────────── IMAGE TO PDF ─────────────────────────
  {
    slug: "jpg-to-pdf",
    available: true,
    name: "JPG to PDF",
    category: "image-to-pdf",
    iconName: "file-image",
    popular: true,
    summary: "Convert JPG and JPEG photos into a single PDF document.",
    heading: "Convert JPG to PDF Online for Free",
    metaDescription:
      "Convert JPG and JPEG images to PDF online for free. Combine photos into one PDF, set page order and choose page size - no sign-up required.",
    intro:
      "Turn JPG and JPEG photos into a PDF you can email, print or upload to forms that only accept PDF. Add one image or many, arrange them in the order you want and save everything as a single document.",
    accepts: "JPG, JPEG",
    acceptAttr: ".jpg,.jpeg,image/jpeg",
    multiple: true,
    steps: [
      "Select or drag and drop one or more JPG images into the upload area.",
      "Arrange the images in the order you want and choose a page size and margin.",
      "Convert and download your new PDF document.",
    ],
    useCases: [
      "Submitting scanned receipts or ID photos to online forms",
      "Sharing a set of photos as one easy-to-open file",
      "Archiving handwritten notes captured with a phone camera",
    ],
    faqs: [
      {
        question: "Can I combine several JPG images into one PDF?",
        answer:
          "Yes. Add as many JPG images as you like (up to 100 at a time). Each image goes on its own page, in the order you arrange them.",
      },
      {
        question: "Will my photos lose quality?",
        answer:
          "No. JPG images are placed into the PDF exactly as they are, without re-compression, so the PDF keeps the original quality and resolution.",
      },
      {
        question: "Will sideways phone photos be fixed?",
        answer:
          "Yes. Photos taken on phones often store their rotation separately. The converter reads that information and places each photo upright in the PDF.",
      },
    ],
    keywords: ["jpeg", "photo", "picture", "image"],
  },
  {
    slug: "png-to-pdf",
    available: true,
    name: "PNG to PDF",
    category: "image-to-pdf",
    iconName: "file-image",
    summary: "Turn PNG images and screenshots into a PDF file.",
    heading: "Convert PNG to PDF Online",
    metaDescription:
      "Convert PNG images and screenshots to PDF for free. Keep sharp text and transparent backgrounds, combine multiple PNG files into one PDF.",
    intro:
      "PNG files are perfect for screenshots, diagrams and graphics with sharp edges. Convert them to PDF to bundle a set of screenshots into a report, share design mockups or print graphics at the right size.",
    accepts: "PNG",
    acceptAttr: ".png,image/png",
    multiple: true,
    steps: [
      "Add your PNG files using the file picker or drag and drop.",
      "Reorder the images and pick the page orientation that fits them best.",
      "Create the PDF and download it to your device.",
    ],
    useCases: [
      "Collecting app screenshots into a single bug report",
      "Sharing charts and diagrams with people who prefer PDF",
      "Printing graphics with consistent page sizes",
    ],
    faqs: [
      {
        question: "What happens to transparent areas in a PNG?",
        answer:
          "Transparency is kept. Transparent areas show the white page behind them, which is how PDF viewers and printers normally display them.",
      },
      {
        question: "Are screenshots kept sharp?",
        answer:
          "Yes. PNG images are stored losslessly in the PDF, so text and fine lines in screenshots stay crisp.",
      },
    ],
    keywords: ["screenshot", "graphic", "image"],
  },
  {
    slug: "images-to-pdf",
    name: "Multiple Images to PDF",
    category: "image-to-pdf",
    iconName: "images",
    summary: "Combine mixed JPG, PNG and other images into one PDF.",
    heading: "Combine Multiple Images into One PDF",
    metaDescription:
      "Merge many images into a single PDF online. Mix JPG, PNG, WebP and GIF files, drag to reorder pages and download one combined document.",
    intro:
      "When you have a folder of mixed image types, convert them all at once. Combine JPG, PNG, WebP and GIF images into one PDF with a consistent page size so the result looks like a single, organised document.",
    accepts: "JPG, PNG, WebP, GIF",
    acceptAttr: ".jpg,.jpeg,.png,.webp,.gif,image/*",
    multiple: true,
    steps: [
      "Select all the images you want to include - you can mix different formats.",
      "Drag the thumbnails into the right order and choose fit or fill page layout.",
      "Generate one combined PDF and download it.",
    ],
    useCases: [
      "Creating a photo portfolio or simple catalogue",
      "Turning multi-page phone scans into one document",
      "Bundling product images for a client or supplier",
    ],
    faqs: [
      {
        question: "Can I mix different image formats in one PDF?",
        answer:
          "Yes. This tool is intended for mixed batches - JPG, PNG, WebP and GIF files can all go into the same PDF.",
      },
      {
        question: "Is there a limit on the number of images?",
        answer:
          "Limits will be announced when processing launches. The goal is to support typical batches of dozens of images comfortably.",
      },
    ],
    keywords: ["batch", "combine images", "webp", "gif", "photos"],
  },
  {
    slug: "heic-to-pdf",
    name: "HEIC to PDF",
    category: "image-to-pdf",
    iconName: "smartphone",
    summary: "Convert iPhone HEIC photos into a universally readable PDF.",
    heading: "Convert HEIC to PDF (iPhone Photos)",
    metaDescription:
      "Convert HEIC and HEIF photos from iPhone and iPad to PDF online. Open your images anywhere, on Windows, Android or the web, without extra apps.",
    intro:
      "iPhones and iPads save photos in the space-saving HEIC format, which many computers and websites still cannot open. Convert HEIC photos to PDF so anyone can view, print or upload them.",
    accepts: "HEIC, HEIF",
    acceptAttr: ".heic,.heif,image/heic,image/heif",
    multiple: true,
    steps: [
      "Upload HEIC or HEIF photos taken on your iPhone or iPad.",
      "Put the photos in order and choose the page size.",
      "Convert to PDF and save the file.",
    ],
    useCases: [
      "Uploading iPhone photos to forms that reject HEIC",
      "Sharing pictures with Windows or Android users",
      "Printing photos from a phone without converting each one",
    ],
    faqs: [
      {
        question: "What is a HEIC file?",
        answer:
          "HEIC (High Efficiency Image Container) is the default photo format on modern iPhones. It saves space but is not supported everywhere, which is why converting to PDF is useful.",
      },
      {
        question: "Do I need to install anything to convert HEIC?",
        answer: "No. The tool will run in your web browser with nothing to install.",
      },
    ],
    keywords: ["heif", "iphone", "ios", "apple", "photo"],
  },

  // ───────────────────────── PDF CONVERSION ─────────────────────────
  {
    slug: "pdf-to-jpg",
    available: true,
    name: "PDF to JPG",
    category: "convert",
    iconName: "file-image",
    popular: true,
    summary: "Save PDF pages as high-quality JPG images.",
    heading: "Convert PDF to JPG Images",
    metaDescription:
      "Convert PDF pages to JPG images online for free. Pick pages, choose quality and resolution, then download single images or a ZIP. Files stay on your device.",
    intro:
      "Need a page from a PDF as a picture? Convert PDF pages into JPG images you can post online, drop into a presentation or send in chat apps that don't preview PDFs. Choose the pages, the resolution and the image quality.",
    accepts: "PDF",
    acceptAttr: PDF,
    multiple: false,
    steps: [
      "Upload the PDF you want to convert.",
      "Choose all pages or click the pages you want, then pick a resolution and JPG quality.",
      "Convert, then download each image or all of them as one ZIP file.",
    ],
    useCases: [
      "Posting a flyer or poster on social media",
      "Adding a PDF page to slides or a web page",
      "Sharing a single page in messaging apps",
    ],
    faqs: [
      {
        question: "Will each page become a separate image?",
        answer:
          "Yes. Every page you select becomes its own JPG file. You can download images one by one, or all of them together as a ZIP file.",
      },
      {
        question: "Which resolution should I choose?",
        answer:
          "150 DPI suits screens and sharing. Choose 300 DPI for printing or zooming in, or 72 DPI for the smallest files. Higher resolution means larger images.",
      },
      {
        question: "Should I choose JPG or PNG?",
        answer:
          "JPG gives smaller files and suits pages with photos. For pages that are mostly text, tables or line drawings, PDF to PNG keeps edges sharper.",
      },
    ],
    keywords: ["jpeg", "image", "picture", "export"],
  },
  {
    slug: "pdf-to-png",
    available: true,
    name: "PDF to PNG",
    category: "convert",
    iconName: "file-image",
    summary: "Export PDF pages as sharp, lossless PNG images.",
    heading: "Convert PDF to PNG Online",
    metaDescription:
      "Convert PDF pages to lossless PNG images online. Keep text and diagrams crisp, choose 72, 150 or 300 DPI, and download single images or a ZIP.",
    intro:
      "PNG keeps text, tables and diagrams perfectly sharp because it is lossless. Convert PDF pages to PNG when clarity matters more than file size - for documentation, design reviews or slides.",
    accepts: "PDF",
    acceptAttr: PDF,
    multiple: false,
    steps: [
      "Select the PDF file to convert.",
      "Choose all pages or click the pages you want, and pick the resolution (DPI).",
      "Convert, then download each PNG or all of them as a ZIP file.",
    ],
    useCases: [
      "Embedding diagrams in documentation or wikis",
      "Reviewing page layouts at high resolution",
      "Creating images with crisp text for presentations",
    ],
    faqs: [
      {
        question: "What resolution will the PNG images have?",
        answer:
          "You choose: 72, 150 or 300 DPI. An A4 page at 150 DPI is about 1240 x 1754 pixels; at 300 DPI it is about 2480 x 3508 pixels. Very large pages may be rendered a little smaller to stay within your browser's limits, and the tool tells you when that happens.",
      },
      {
        question: "Does PNG support transparent backgrounds?",
        answer:
          "PNG supports transparency, but PDF pages have a white background, so the exported images are white rather than transparent.",
      },
      {
        question: "Why are PNG files bigger than JPG?",
        answer:
          "PNG is lossless, so it keeps every pixel exactly. That makes it ideal for text and diagrams but larger for photos. Use PDF to JPG if you need smaller files.",
      },
    ],
    keywords: ["image", "lossless", "export", "screenshot"],
  },
  {
    slug: "pdf-to-word",
    name: "PDF to Word",
    category: "convert",
    iconName: "file-text",
    popular: true,
    summary: "Convert PDF documents into editable Word (DOCX) files.",
    heading: "Convert PDF to Word (DOCX)",
    metaDescription:
      "Convert PDF to an editable Word document (DOCX). Keep headings, paragraphs and basic formatting so you can edit text without retyping.",
    intro:
      "Stop retyping documents. Convert a PDF into an editable Word file so you can update text, reuse paragraphs and change formatting in Microsoft Word, LibreOffice or Google Docs.",
    accepts: "PDF",
    acceptAttr: PDF,
    multiple: false,
    steps: [
      "Upload the PDF document you want to edit in Word.",
      "Start the conversion - text, headings and simple tables are mapped to Word.",
      "Download the DOCX file and open it in your word processor.",
    ],
    useCases: [
      "Updating an old contract or CV when the source file is lost",
      "Reusing text from reports without copy-paste errors",
      "Editing forms that were shared only as PDF",
    ],
    faqs: [
      {
        question: "Will the layout be exactly the same in Word?",
        answer:
          "Simple documents convert closely. Complex layouts with many columns, text boxes or unusual fonts may need small adjustments after conversion.",
      },
      {
        question: "Can scanned PDFs be converted to Word?",
        answer:
          "Scanned PDFs contain images of text rather than real text. Converting them requires OCR (text recognition), which is planned for a later phase.",
      },
    ],
    keywords: ["docx", "doc", "microsoft word", "editable"],
  },
  {
    slug: "word-to-pdf",
    name: "Word to PDF",
    category: "convert",
    iconName: "file-text",
    popular: true,
    summary: "Convert DOC and DOCX documents into PDF.",
    heading: "Convert Word to PDF Online",
    metaDescription:
      "Convert Word documents (DOC, DOCX) to PDF online for free. Preserve fonts, images and layout so your document looks the same on every device.",
    intro:
      "Word files can look different on every computer. Converting to PDF locks in your fonts, spacing and images so the document looks exactly as intended when someone opens or prints it.",
    accepts: "DOC, DOCX",
    acceptAttr:
      ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    multiple: false,
    steps: [
      "Upload your DOC or DOCX file.",
      "Convert the document to PDF.",
      "Download the PDF, ready to share or print.",
    ],
    useCases: [
      "Sending CVs and cover letters in a reliable format",
      "Submitting assignments that must be in PDF",
      "Sharing reports that should not be edited by accident",
    ],
    faqs: [
      {
        question: "Will my fonts and images be kept?",
        answer:
          "The converter is designed to preserve fonts, images and page layout. Uncommon fonts may be substituted with a close match.",
      },
      {
        question: "Can I convert older .doc files?",
        answer: "Yes. Both the older .doc format and the modern .docx format are planned to be supported.",
      },
    ],
    keywords: ["docx", "doc", "microsoft word", "document"],
  },
  {
    slug: "excel-to-pdf",
    name: "Excel to PDF",
    category: "convert",
    iconName: "file-spreadsheet",
    summary: "Turn Excel spreadsheets into clean, printable PDFs.",
    heading: "Convert Excel to PDF",
    metaDescription:
      "Convert Excel spreadsheets (XLS, XLSX) to PDF online. Turn sheets, tables and charts into clean, printable PDF pages that anyone can open.",
    intro:
      "Spreadsheets are hard to read on phones and easy to change by mistake. Convert Excel workbooks to PDF to share invoices, price lists, schedules and reports in a fixed, printable format.",
    accepts: "XLS, XLSX",
    acceptAttr:
      ".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    multiple: false,
    steps: [
      "Upload an XLS or XLSX spreadsheet.",
      "Choose whether to convert the active sheet or the whole workbook.",
      "Download the finished PDF.",
    ],
    useCases: [
      "Sending invoices and quotes to clients",
      "Printing schedules, timetables and price lists",
      "Sharing financial summaries that should not be edited",
    ],
    faqs: [
      {
        question: "Will wide spreadsheets fit on the page?",
        answer:
          "Wide sheets will be scaled or split across pages. Setting a print area and orientation in Excel beforehand gives the best results.",
      },
      {
        question: "Are charts included in the PDF?",
        answer: "Yes, charts placed on a sheet are planned to be rendered into the PDF along with the cells.",
      },
    ],
    keywords: ["xlsx", "xls", "spreadsheet", "sheet", "table"],
  },
  {
    slug: "powerpoint-to-pdf",
    name: "PowerPoint to PDF",
    category: "convert",
    iconName: "presentation",
    summary: "Convert PPT and PPTX slides into a PDF handout.",
    heading: "Convert PowerPoint to PDF",
    metaDescription:
      "Convert PowerPoint presentations (PPT, PPTX) to PDF. Share slides as a compact handout that opens anywhere, with layout and images intact.",
    intro:
      "Share presentations without worrying about missing fonts or software. Converting PowerPoint to PDF creates a lightweight handout that keeps every slide's layout and opens on any phone or computer.",
    accepts: "PPT, PPTX",
    acceptAttr:
      ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation",
    multiple: false,
    steps: [
      "Upload your PPT or PPTX presentation.",
      "Convert the slides - each slide becomes one PDF page.",
      "Download the PDF handout.",
    ],
    useCases: [
      "Sending slides to attendees after a talk",
      "Submitting presentations to teachers or conferences",
      "Viewing slides on devices without PowerPoint",
    ],
    faqs: [
      {
        question: "Are animations and videos kept?",
        answer:
          "PDF is a static format, so animations, transitions and embedded videos are not included. Each slide is shown in its final state.",
      },
      {
        question: "Can speaker notes be included?",
        answer: "Exporting speaker notes is being considered for a future update.",
      },
    ],
    keywords: ["pptx", "ppt", "slides", "presentation", "deck"],
  },

  // ───────────────────────── PDF EDITING ─────────────────────────
  {
    slug: "edit-pdf",
    name: "Edit PDF",
    category: "edit",
    iconName: "pen",
    popular: true,
    summary: "Add text, shapes, images and annotations to any PDF.",
    heading: "Edit PDF Files Online",
    metaDescription:
      "Edit PDF files online for free. Add text, images, shapes and annotations, or white out content - all in your browser without installing software.",
    intro:
      "A simple all-in-one PDF editor for everyday changes. Add text boxes, insert images, draw shapes, cover up content and annotate pages, then save a new copy of your document.",
    accepts: "PDF",
    acceptAttr: PDF,
    multiple: false,
    steps: [
      "Open the PDF you want to edit.",
      "Use the toolbar to add text, images, shapes or annotations on any page.",
      "Apply your changes and download the edited PDF.",
    ],
    useCases: [
      "Filling in details on forms that are not fillable",
      "Adding a logo or photo to a document",
      "Marking up drafts with notes and shapes",
    ],
    faqs: [
      {
        question: "Can I change existing text in the PDF?",
        answer:
          "Changing existing text is handled by the dedicated PDF Text Editor tool. The Edit PDF tool focuses on adding new content on top of pages.",
      },
      {
        question: "Is the original file changed?",
        answer: "No. Your edits are saved into a new PDF that you download; the original file stays untouched.",
      },
    ],
    keywords: ["editor", "annotate", "modify", "change pdf"],
  },
  {
    slug: "pdf-text-editor",
    name: "PDF Text Editor",
    category: "edit",
    iconName: "type",
    summary: "Change existing text in a PDF directly on the page.",
    heading: "PDF Text Editor - Change Text in a PDF",
    metaDescription:
      "Edit existing text inside a PDF. Fix typos, update dates, names and numbers directly on the page while keeping the original layout.",
    intro:
      "Fix a typo, update a date or change a price without recreating the whole document. The PDF Text Editor lets you click on existing text and edit it in place while keeping the surrounding layout.",
    accepts: "PDF",
    acceptAttr: PDF,
    multiple: false,
    steps: [
      "Upload the PDF that contains the text you want to change.",
      "Click a line of text and type your correction.",
      "Save and download the updated PDF.",
    ],
    useCases: [
      "Correcting typos in a finished brochure or report",
      "Updating dates, prices or contact details",
      "Making quick fixes when the original file is unavailable",
    ],
    faqs: [
      {
        question: "Will the edited text match the original font?",
        answer:
          "The editor will try to reuse the original font. If the font is not embedded in the PDF, a visually similar font is used.",
      },
      {
        question: "Can I edit text in a scanned PDF?",
        answer:
          "Scanned pages are images, so their text cannot be edited directly. OCR support for scanned documents is planned for a later phase.",
      },
    ],
    keywords: ["change text", "fix typo", "modify text"],
  },
  {
    slug: "find-and-replace-pdf",
    name: "Find and Replace Text",
    category: "edit",
    iconName: "replace",
    summary: "Search for words in a PDF and replace every match.",
    heading: "Find and Replace Text in PDF",
    metaDescription:
      "Find and replace text in PDF files online. Search for a word or phrase and replace every occurrence across all pages in one step.",
    intro:
      "Need to change a company name, product name or date that appears many times? Search the whole PDF for a word or phrase and replace every occurrence at once instead of editing page by page.",
    accepts: "PDF",
    acceptAttr: PDF,
    multiple: false,
    steps: [
      "Upload your PDF document.",
      "Enter the text to find and the replacement text, then review the matches.",
      "Replace all matches and download the updated PDF.",
    ],
    useCases: [
      "Rebranding documents after a name change",
      "Updating a repeated date or version number",
      "Correcting a misspelled name throughout a file",
    ],
    faqs: [
      {
        question: "Is the search case-sensitive?",
        answer: "You will be able to choose case-sensitive or case-insensitive matching before replacing.",
      },
      {
        question: "Can I review matches before replacing?",
        answer: "Yes. The tool is designed to list every match so you can confirm the changes first.",
      },
    ],
    keywords: ["search", "replace", "substitute", "rename"],
  },
  {
    slug: "add-text-to-pdf",
    name: "Add Text to PDF",
    category: "edit",
    iconName: "text-cursor",
    summary: "Place new text boxes anywhere on your PDF pages.",
    heading: "Add Text to PDF",
    metaDescription:
      "Add text to any PDF online. Type on top of pages, fill in non-fillable forms and choose font, size and colour - free and easy to use.",
    intro:
      "Type directly onto a PDF to fill in a form, add a note or label a diagram. Place text boxes anywhere on the page and adjust the font, size and colour to match the document.",
    accepts: "PDF",
    acceptAttr: PDF,
    multiple: false,
    steps: [
      "Upload the PDF you want to type on.",
      "Click where you want the text, then type and style it.",
      "Download the PDF with your added text.",
    ],
    useCases: [
      "Filling in application forms that are not fillable",
      "Adding labels or captions to plans and diagrams",
      "Writing notes for reviewers",
    ],
    faqs: [
      {
        question: "Can I choose the font and colour?",
        answer: "Yes. Standard fonts, sizes and colours will be available for every text box.",
      },
      {
        question: "Can I move text after placing it?",
        answer: "Yes. Text boxes are planned to be draggable until you save the final PDF.",
      },
    ],
    keywords: ["type on pdf", "fill form", "text box", "write"],
  },
  {
    slug: "add-signature",
    name: "Add Signature",
    category: "edit",
    iconName: "pen-tool",
    summary: "Draw, type or upload a signature and place it on a PDF.",
    heading: "Add a Signature to PDF",
    metaDescription:
      "Sign PDF documents online. Draw, type or upload your signature, place it on any page and download the signed PDF - no account needed.",
    intro:
      "Sign documents without printing and scanning. Draw your signature with a mouse or finger, type it in a handwriting-style font or upload an image, then place it exactly where it needs to go.",
    accepts: "PDF",
    acceptAttr: PDF,
    multiple: false,
    steps: [
      "Upload the PDF that needs to be signed.",
      "Create your signature by drawing, typing or uploading an image, then position it.",
      "Download the signed PDF.",
    ],
    useCases: [
      "Signing rental agreements and consent forms",
      "Approving invoices and purchase orders",
      "Returning signed documents quickly from a phone",
    ],
    faqs: [
      {
        question: "Is this a legally binding digital signature?",
        answer:
          "This tool adds a visual electronic signature. Whether that is accepted depends on your country and the document type. Certificate-based digital signatures are not part of this tool.",
      },
      {
        question: "Is my signature saved?",
        answer: "No. Signatures are intended to stay on your device for the current session only.",
      },
    ],
    keywords: ["sign", "esign", "e-signature", "signature"],
  },
  {
    slug: "add-watermark",
    available: true,
    name: "Add Watermark",
    category: "edit",
    iconName: "droplets",
    summary: "Stamp a text watermark such as CONFIDENTIAL or DRAFT onto PDF pages.",
    heading: "Add a Watermark to PDF",
    metaDescription:
      "Add a text watermark to PDF files online. Mark pages CONFIDENTIAL, DRAFT or with your name - set size, color, opacity, angle and position, with a live preview.",
    intro:
      "Mark documents as CONFIDENTIAL, DRAFT, SAMPLE or with your company name. Choose the size, color, transparency, angle and position, see a live preview, and apply the watermark to every page or only the pages you choose.",
    accepts: "PDF",
    acceptAttr: PDF,
    multiple: false,
    steps: [
      "Upload the PDF to watermark.",
      "Type the watermark text and adjust size, color, opacity, rotation and position while watching the preview.",
      "Choose all pages or a page range, apply the watermark and download the file.",
    ],
    useCases: [
      "Marking drafts and confidential documents",
      "Adding your name or company to shared work",
      "Discouraging unauthorised sharing of previews",
    ],
    faqs: [
      {
        question: "Can I watermark only some pages?",
        answer:
          "Yes. Choose 'Selected pages' and enter pages or ranges such as 1-3, 7. The preview shows the first page that will be watermarked.",
      },
      {
        question: "Is a watermark a security feature?",
        answer:
          "No. A watermark is a visible label added on top of the page. It doesn't hide, remove or redact anything underneath, and people with PDF editing software can remove it. To stop others opening a file, use Protect PDF.",
      },
      {
        question: "Which characters can I use?",
        answer:
          "The watermark uses the standard PDF fonts, which support Latin letters (including accents such as é and ü), numbers and common symbols. Other scripts such as Hindi, Arabic, Chinese or Japanese aren't supported yet.",
      },
      {
        question: "Will my page sizes change?",
        answer:
          "No. The watermark is drawn on top of the existing pages; page size, orientation and content stay exactly the same.",
      },
    ],
    keywords: ["stamp", "text watermark", "confidential", "draft", "branding"],
  },
  {
    slug: "add-page-numbers",
    available: true,
    name: "Add Page Numbers",
    category: "edit",
    iconName: "hash",
    summary: "Insert page numbers with your choice of position, format and start number.",
    heading: "Add Page Numbers to PDF",
    metaDescription:
      "Add page numbers to PDF documents online. Choose top or bottom, left, center or right, a format such as 'Page 1 of 10', the starting number and which pages to number.",
    intro:
      "Make long documents easier to navigate and reference. Add page numbers at the top or bottom, on the left, center or right, choose a format like 'Page 1 of 20', pick the starting number and number only the pages you want - with a live preview.",
    accepts: "PDF",
    acceptAttr: PDF,
    multiple: false,
    steps: [
      "Upload your PDF document.",
      "Choose the position, format, font size, color and starting number while watching the preview.",
      "Choose all pages or a range, apply the numbers and download the PDF.",
    ],
    useCases: [
      "Preparing theses, reports and manuals",
      "Numbering merged documents before printing",
      "Making legal bundles easy to reference",
    ],
    faqs: [
      {
        question: "Can I skip the cover page?",
        answer:
          "Yes. Choose 'Only some pages' and enter, for example, 2-20. The first numbered page gets your starting number, so you can start at 1 on page 2.",
      },
      {
        question: "Which number formats are available?",
        answer:
          "Four formats: '1', 'Page 1', 'Page 1 of 10' and '1 / 10'. The total counts the pages you are numbering.",
      },
      {
        question: "Do rotated or landscape pages work?",
        answer:
          "Yes. Numbers are placed relative to the page as you see it, so they appear upright and in the chosen corner even on landscape or rotated pages.",
      },
    ],
    keywords: ["pagination", "numbering", "footer", "header"],
  },
  {
    slug: "highlight-pdf",
    name: "Highlight PDF",
    category: "edit",
    iconName: "highlighter",
    summary: "Highlight, underline and mark important text in PDFs.",
    heading: "Highlight Text in PDF",
    metaDescription:
      "Highlight text in PDF files online. Mark important passages in yellow, green or pink, underline or strike through text and download the result.",
    intro:
      "Study and review documents faster by marking what matters. Highlight key passages in different colours, underline definitions or strike through outdated text, then save a copy to share.",
    accepts: "PDF",
    acceptAttr: PDF,
    multiple: false,
    steps: [
      "Upload the PDF you want to mark up.",
      "Select text and choose highlight, underline or strikethrough and a colour.",
      "Download the highlighted PDF.",
    ],
    useCases: [
      "Studying textbooks and lecture notes",
      "Reviewing contracts and pointing out key clauses",
      "Marking changes for colleagues",
    ],
    faqs: [
      {
        question: "Will highlights show in other PDF readers?",
        answer: "Yes. Highlights are planned to be saved as standard PDF annotations that common readers display.",
      },
      {
        question: "Can I highlight scanned documents?",
        answer:
          "Text selection needs real text in the PDF. For scanned pages, a freehand highlight option is being considered.",
      },
    ],
    keywords: ["mark", "annotate", "underline", "strikethrough", "study"],
  },

  // ───────────────────────── PDF MANAGEMENT ─────────────────────────
  {
    slug: "merge-pdf",
    available: true,
    name: "Merge PDF",
    category: "organize",
    iconName: "combine",
    popular: true,
    summary: "Combine multiple PDF files into one document.",
    heading: "Merge PDF Files into One",
    metaDescription:
      "Merge PDF files online for free. Combine multiple PDFs into a single document, drag to set the order and download one tidy file.",
    intro:
      "Combine several PDFs into one organised document. Upload reports, invoices or scanned pages, drag them into the right order and download a single file that is easier to share and archive.",
    accepts: "PDF",
    acceptAttr: PDF,
    multiple: true,
    steps: [
      "Select two or more PDF files to combine.",
      "Drag the files into the order you want them to appear.",
      "Merge and download your combined PDF.",
    ],
    useCases: [
      "Combining invoices or statements for accounting",
      "Joining chapters into one book or report",
      "Sending one attachment instead of many",
    ],
    faqs: [
      {
        question: "How many PDFs can I merge at once?",
        answer:
          "Up to 100 files at once, each up to 100 MB and 300 MB in total. Because merging happens on your device, very large batches can be slow on older phones.",
      },
      {
        question: "Are bookmarks and links kept?",
        answer:
          "All pages, text, images and links on the pages are kept. Bookmarks (the outline panel) from the original files are not carried over, and interactive form fields may stop being fillable.",
      },
    ],
    keywords: ["combine", "join", "append", "unite"],
  },
  {
    slug: "split-pdf",
    available: true,
    name: "Split PDF",
    category: "organize",
    iconName: "scissors",
    popular: true,
    summary: "Split a PDF into separate files by page or range.",
    heading: "Split PDF Files by Page or Range",
    metaDescription:
      "Split PDF files online. Separate every page into its own file or split by custom page ranges - fast, free and easy to use.",
    intro:
      "Break a large PDF into smaller, focused files. Split every page into its own PDF, or define ranges such as 1-3 and 4-10 to create separate documents for each section.",
    accepts: "PDF",
    acceptAttr: PDF,
    multiple: false,
    steps: [
      "Upload the PDF you want to split.",
      "Choose custom page ranges, every page, or a fixed number of pages per file.",
      "Download the resulting PDF files.",
    ],
    useCases: [
      "Separating a scanned batch into individual documents",
      "Sending only the relevant chapter of a report",
      "Breaking large files into email-friendly parts",
    ],
    faqs: [
      {
        question: "What is the difference between Split PDF and Extract Pages?",
        answer:
          "Split PDF divides the whole document into several files. Extract PDF Pages creates one new PDF containing only the pages you pick.",
      },
      {
        question: "How will I download many files?",
        answer: "When a split produces more than one file, they are bundled into a single ZIP download. A single range downloads as a normal PDF.",
      },
    ],
    keywords: ["separate", "divide", "cut", "break apart"],
  },
  {
    slug: "compress-pdf",
    available: true,
    name: "Compress PDF",
    category: "organize",
    iconName: "minimize",
    popular: true,
    summary: "Reduce PDF file size by optimising images inside the file.",
    heading: "Compress PDF - Reduce PDF File Size",
    metaDescription:
      "Compress PDF files in your browser. Shrink photos and scans inside the PDF with Low, Recommended or High compression, and see the exact size saved.",
    intro:
      "Large PDFs are slow to send and often rejected by email and upload forms. This tool shrinks the photos and scanned pages inside your PDF and tidies the file structure, then shows you exactly how much smaller the file became. It never claims a reduction it didn't achieve.",
    accepts: "PDF",
    acceptAttr: PDF,
    multiple: false,
    steps: [
      "Upload the PDF you want to make smaller.",
      "Choose Low, Recommended or High compression.",
      "Compress, compare the original and new sizes, then download the smaller PDF.",
    ],
    useCases: [
      "Meeting email attachment size limits",
      "Uploading documents to job or government portals",
      "Saving storage space in cloud drives",
    ],
    faqs: [
      {
        question: "How much smaller will my PDF get?",
        answer:
          "It depends on what's inside. PDFs with photos or scanned pages often shrink by 50% or more. PDFs that are mostly text, fonts or drawings are usually already compact and may shrink very little.",
      },
      {
        question: "Why couldn't my PDF be compressed?",
        answer:
          "If the result wouldn't be smaller, we tell you and don't offer a larger file. This happens with files that are already optimised, or whose size comes from fonts, text, vector graphics or image types we leave untouched to protect quality (such as CMYK print images).",
      },
      {
        question: "Will compression reduce quality?",
        answer:
          "Text, fonts and drawings are never changed. Only images are re-encoded: Low keeps them close to the original, Recommended is a good balance for sharing, and High makes images noticeably softer. Your original file is never modified.",
      },
    ],
    keywords: ["reduce size", "shrink", "optimize", "smaller"],
  },
  {
    slug: "rotate-pdf",
    available: true,
    name: "Rotate PDF",
    category: "organize",
    iconName: "rotate",
    summary: "Rotate all or selected PDF pages permanently.",
    heading: "Rotate PDF Pages",
    metaDescription:
      "Rotate PDF pages online. Turn all pages or selected pages 90 or 180 degrees and save the orientation permanently.",
    intro:
      "Fix sideways or upside-down scans in seconds. Rotate every page or just the ones that need it by 90 or 180 degrees and save the corrected orientation permanently.",
    accepts: "PDF",
    acceptAttr: PDF,
    multiple: false,
    steps: [
      "Upload the PDF with pages to rotate.",
      "Rotate all pages at once or click individual pages to turn them.",
      "Save and download the corrected PDF.",
    ],
    useCases: [
      "Fixing scanned pages that came out sideways",
      "Turning landscape tables to the right orientation",
      "Preparing documents for comfortable on-screen reading",
    ],
    faqs: [
      {
        question: "Is the rotation permanent?",
        answer: "Yes. The new orientation is saved in the downloaded PDF, so it opens correctly everywhere.",
      },
      {
        question: "Can I rotate just one page?",
        answer: "Yes. Rotate individual pages with the buttons on each page, or turn the whole document at once.",
      },
    ],
    keywords: ["turn", "orientation", "landscape", "portrait", "flip"],
  },
  {
    slug: "delete-pdf-pages",
    available: true,
    name: "Delete PDF Pages",
    category: "organize",
    iconName: "trash",
    summary: "Remove unwanted pages from a PDF document.",
    heading: "Delete Pages from PDF",
    metaDescription:
      "Delete pages from a PDF online. Remove blank, duplicate or unwanted pages and download a clean document - simple and free.",
    intro:
      "Remove blank pages, duplicates or anything you do not want to share. Select the pages to delete and download a cleaner, shorter PDF.",
    accepts: "PDF",
    acceptAttr: PDF,
    multiple: false,
    steps: [
      "Upload your PDF document.",
      "Click the pages you want to remove or type page numbers.",
      "Download the PDF without those pages.",
    ],
    useCases: [
      "Removing blank pages from scans",
      "Taking out internal notes before sharing",
      "Trimming unnecessary appendices",
    ],
    faqs: [
      {
        question: "Can I undo a deletion?",
        answer: "Your original file is never changed. If you remove the wrong page, simply start again with the original.",
      },
      {
        question: "Can I delete several pages at once?",
        answer: "Yes. Select multiple pages or enter ranges such as 2, 5-7.",
      },
    ],
    keywords: ["remove pages", "erase", "cut pages"],
  },
  {
    slug: "extract-pdf-pages",
    name: "Extract PDF Pages",
    category: "organize",
    iconName: "file-output",
    summary: "Pull selected pages out into a new PDF.",
    heading: "Extract Pages from PDF",
    metaDescription:
      "Extract pages from a PDF into a new file. Pick the exact pages you need and save them as a separate, smaller PDF document.",
    intro:
      "Need only a few pages from a long document? Pick the exact pages you want and save them as a brand-new PDF, leaving the rest behind.",
    accepts: "PDF",
    acceptAttr: PDF,
    multiple: false,
    steps: [
      "Upload the source PDF.",
      "Select the pages to keep, by clicking thumbnails or typing ranges.",
      "Download the new PDF containing only those pages.",
    ],
    useCases: [
      "Sharing one signed page from a long contract",
      "Saving a single chapter or section",
      "Sending only the relevant pages of a statement",
    ],
    faqs: [
      {
        question: "Can I change the order of extracted pages?",
        answer: "Pages will be kept in their original order by default, with reordering planned as an option.",
      },
      {
        question: "Does the original PDF change?",
        answer: "No. Extraction creates a new file and leaves your original untouched.",
      },
    ],
    keywords: ["select pages", "save pages", "pick pages"],
  },
  {
    slug: "protect-pdf",
    available: true,
    name: "Protect PDF",
    category: "organize",
    iconName: "lock",
    summary: "Encrypt a PDF with AES-256 so it needs a password to open.",
    heading: "Protect PDF with a Password",
    metaDescription:
      "Password protect PDF files with AES-256 encryption, right in your browser. Your file is never uploaded. Set and confirm a password, then download the protected PDF.",
    intro:
      "Keep sensitive documents private. This tool encrypts your PDF with AES-256 - the PDF 2.0 standard also used by Adobe Acrobat - so it can only be opened with the password you set. Encryption happens entirely in your browser, so the file and password never leave your device.",
    accepts: "PDF",
    acceptAttr: PDF,
    multiple: false,
    steps: [
      "Upload the PDF you want to secure.",
      "Enter a password and type it again to confirm it.",
      "Encrypt the file and download the protected PDF.",
    ],
    useCases: [
      "Emailing payslips, bank statements or medical records",
      "Sharing confidential business documents",
      "Storing personal documents in the cloud",
    ],
    faqs: [
      {
        question: "How secure is the protection?",
        answer:
          "The PDF is encrypted with AES-256 using the PDF 2.0 standard security handler (the same method Adobe Acrobat calls AES-256). The encryption itself is strong, but the protection is only as good as your password: short or common passwords can be guessed by password-cracking software. Use a long, unique password.",
      },
      {
        question: "What if I forget the password?",
        answer:
          "It can't be recovered - not by us or anyone else, because we never see your file or password. Keep the password somewhere safe, such as a password manager.",
      },
      {
        question: "Can I stop people printing or copying the file?",
        answer:
          "No. This tool protects the file from being opened without the password. Anyone who has the password can open, print and copy it. PDF 'permission' restrictions are not enforced by many apps, so we don't offer them as a security feature.",
      },
      {
        question: "Which apps can open the protected PDF?",
        answer:
          "Any up-to-date PDF reader that supports AES-256, including Adobe Acrobat Reader (version X or newer), Chrome, Edge, Firefox, macOS Preview and most mobile PDF apps.",
      },
      {
        question: "Can I protect a PDF that's already encrypted or digitally signed?",
        answer:
          "No. Remove the existing protection first. Digitally signed PDFs are refused, because encrypting them would invalidate the signature.",
      },
    ],
    keywords: ["password", "encrypt", "secure", "lock"],
  },
  {
    slug: "unlock-pdf",
    name: "Unlock PDF",
    category: "organize",
    iconName: "unlock",
    summary: "Remove the password from a PDF you are allowed to open.",
    heading: "Unlock PDF - Remove a Known Password",
    metaDescription:
      "Remove the password from a PDF you own. Enter the known password once and save an unlocked copy that opens without prompting.",
    intro:
      "Tired of typing the same password every time you open your own document? If you know the password, enter it once and save an unlocked copy that opens without a prompt.",
    accepts: "PDF",
    acceptAttr: PDF,
    multiple: false,
    steps: [
      "Upload the password-protected PDF.",
      "Enter the document's current password.",
      "Download an unlocked copy of the file.",
    ],
    useCases: [
      "Removing the password from your own bank statements",
      "Making personal archives easier to search and open",
      "Preparing files you own for printing or merging",
    ],
    faqs: [
      {
        question: "Can this tool crack an unknown password?",
        answer:
          "No. Unlock PDF is only for files you are authorised to open and requires the correct password. It does not bypass or guess passwords.",
      },
      {
        question: "Is it legal to unlock a PDF?",
        answer:
          "Removing a password from a document you own or are permitted to access is generally fine. Do not use the tool on documents you are not authorised to open.",
      },
    ],
    keywords: ["remove password", "decrypt", "unprotect"],
  },

  // ───────────────────────── PDF UTILITIES ─────────────────────────
  {
    slug: "pdf-metadata-viewer",
    name: "PDF Metadata Viewer",
    category: "utilities",
    iconName: "info",
    summary: "See a PDF's title, author, creator app and dates.",
    heading: "PDF Metadata Viewer",
    metaDescription:
      "View PDF metadata online: title, author, subject, keywords, creator application, PDF version and creation or modification dates.",
    intro:
      "Find out what is stored inside a PDF beyond its pages. View the title, author, subject, keywords, the application that created it, the PDF version and when it was created or last modified.",
    accepts: "PDF",
    acceptAttr: PDF,
    multiple: false,
    steps: [
      "Upload the PDF you want to inspect.",
      "The tool reads the document properties.",
      "Review the metadata in a clear table.",
    ],
    useCases: [
      "Checking for personal data before publishing a document",
      "Verifying when a file was created or edited",
      "Auditing document titles for SEO and accessibility",
    ],
    faqs: [
      {
        question: "Why does PDF metadata matter?",
        answer:
          "Metadata can reveal author names, software and dates. Checking it before sharing helps protect your privacy.",
      },
      {
        question: "Can I edit the metadata?",
        answer: "This tool is for viewing. Metadata editing may be added in a later phase.",
      },
    ],
    keywords: ["properties", "author", "info", "document info", "exif"],
  },
  {
    slug: "pdf-page-counter",
    name: "PDF Page Counter",
    category: "utilities",
    iconName: "calculator",
    summary: "Count the pages in one or many PDF files instantly.",
    heading: "PDF Page Counter",
    metaDescription:
      "Count pages in PDF files online. Get the page count for one or many PDFs at once, with a total - useful for printing quotes and submissions.",
    intro:
      "Know exactly how many pages you are dealing with. Count the pages in a single PDF or a whole batch and see the total, which is handy for print quotes, translation estimates and submission limits.",
    accepts: "PDF",
    acceptAttr: PDF,
    multiple: true,
    steps: [
      "Add one or more PDF files.",
      "The tool counts the pages in each file.",
      "See the per-file counts and the overall total.",
    ],
    useCases: [
      "Estimating printing or translation costs",
      "Checking page limits for applications",
      "Auditing document batches",
    ],
    faqs: [
      {
        question: "Can I count pages in many PDFs at once?",
        answer: "Yes. The counter is designed for batches and shows both individual and total page counts.",
      },
      {
        question: "Does it work with password-protected PDFs?",
        answer: "Encrypted PDFs need the password to be read. Support for entering a password is planned.",
      },
    ],
    keywords: ["count pages", "number of pages", "page total"],
  },
  {
    slug: "pdf-to-text",
    name: "PDF to Text",
    category: "utilities",
    iconName: "file-search",
    summary: "Extract plain text from a PDF into a TXT file.",
    heading: "Convert PDF to Text (TXT)",
    metaDescription:
      "Extract text from PDF files online. Convert PDF to plain text (TXT) to copy, search, translate or reuse content without formatting.",
    intro:
      "Get the words out of a PDF without fighting with copy and paste. Extract the plain text from every page so you can search it, paste it elsewhere, translate it or feed it into other tools.",
    accepts: "PDF",
    acceptAttr: PDF,
    multiple: false,
    steps: [
      "Upload the PDF to extract text from.",
      "Choose all pages or a page range.",
      "Copy the text or download it as a TXT file.",
    ],
    useCases: [
      "Copying long passages for quotes or research",
      "Preparing content for translation",
      "Making document text searchable in other apps",
    ],
    faqs: [
      {
        question: "Why is no text extracted from my PDF?",
        answer:
          "If the PDF is a scan, its pages are images and contain no selectable text. OCR support for scans is planned for a future phase.",
      },
      {
        question: "Is formatting kept?",
        answer: "No. The output is plain text with line breaks, which is ideal for reusing content anywhere.",
      },
    ],
    keywords: ["txt", "extract text", "copy text", "plain text"],
  },
  {
    slug: "pdf-file-size-checker",
    name: "PDF File Size Checker",
    category: "utilities",
    iconName: "scale",
    summary: "Check a PDF's size against common upload limits.",
    heading: "PDF File Size Checker",
    metaDescription:
      "Check PDF file size online and see whether it fits common email and upload limits. Get a size breakdown and tips to make it smaller.",
    intro:
      "Find out if your PDF will be accepted before you try to send it. Check its exact size, compare it with common email and upload limits, and get pointers if it needs to be smaller.",
    accepts: "PDF",
    acceptAttr: PDF,
    multiple: true,
    steps: [
      "Select one or more PDF files.",
      "See the size of each file in KB or MB.",
      "Compare against common limits and compress if needed.",
    ],
    useCases: [
      "Checking files before emailing them",
      "Meeting portal limits for job or visa applications",
      "Finding the largest files in a batch",
    ],
    faqs: [
      {
        question: "What are common upload limits?",
        answer:
          "Many email services limit attachments to around 20-25 MB, while many online forms accept only 1-5 MB. Always check the specific limit you need to meet.",
      },
      {
        question: "My PDF is too big - what now?",
        answer: "Use the Compress PDF tool, or split the document into smaller parts with Split PDF.",
      },
    ],
    keywords: ["size", "mb", "kb", "upload limit", "file size"],
  },
];

const freeFaq: FaqItem = {
  question: "Is this tool free to use?",
  answer: "Yes. PDF Master Tools is free for everyone, with no mandatory account and no payment required.",
};

/** FAQs shown on every tool page; wording depends on whether the tool is working yet. */
export function getSharedFaqs(tool: Tool): FaqItem[] {
  if (tool.available) {
    return [
      freeFaq,
      {
        question: "Are my files uploaded to a server?",
        answer: `No. ${tool.name} runs entirely in your web browser. Your files are never uploaded to our servers and nothing is kept after you close the page.`,
      },
      {
        question: "Which devices and browsers are supported?",
        answer:
          "Any up-to-date browser such as Chrome, Edge, Firefox or Safari, on Windows, macOS, Android or iPhone. Very large files use more memory, so they may be slow on older phones.",
      },
    ];
  }
  return [
    freeFaq,
    {
      question: "Is the tool working yet?",
      answer:
        "Not yet. This tool is still being built and will be enabled in an upcoming update. You can bookmark this page and check back.",
    },
    {
      question: "What happens to my files?",
      answer:
        "Right now, files you choose on this page are not uploaded or processed at all - they stay on your device.",
    },
  ];
}

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: CategoryId): Tool[] {
  return tools.filter((t) => t.category === category);
}

export const popularTools: Tool[] = tools.filter((t) => t.popular);

/** Related tools: same category first, excluding the current tool. */
export function getRelatedTools(tool: Tool, limit = 4): Tool[] {
  const sameCategory = tools.filter((t) => t.category === tool.category && t.slug !== tool.slug);
  const others = popularTools.filter((t) => t.category !== tool.category);
  return [...sameCategory, ...others].slice(0, limit);
}
