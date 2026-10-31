interface SectionHeadingProps {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "center",
  as: Tag = "h2",
}: SectionHeadingProps) {
  const alignment = align === "center" ? "mx-auto text-center" : "text-left";
  return (
    <div className={`max-w-2xl ${alignment}`}>
      {eyebrow && (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-brand-500">{eyebrow}</p>
      )}
      <Tag id={id} className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        {title}
      </Tag>
      {description && <p className="mt-3 text-base leading-relaxed text-muted">{description}</p>}
    </div>
  );
}
