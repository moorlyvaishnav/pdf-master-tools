interface JsonLdProps {
  data: Record<string, unknown>;
}

/** Renders schema.org structured data. Content is generated from our own static data. */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
