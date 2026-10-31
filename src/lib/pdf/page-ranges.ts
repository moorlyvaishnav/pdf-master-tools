/** Parsing of human page range input such as "1-3, 5, 8-10". Page numbers are 1-based. */

export interface PageRange {
  /** 1-based, inclusive */
  start: number;
  /** 1-based, inclusive */
  end: number;
}

export type RangeParseResult = { ok: true; ranges: PageRange[] } | { ok: false; error: string };

/**
 * Parse "1-3, 5, 8-10" into ranges. Accepts commas or spaces as separators,
 * en/em dashes, and open-ended ranges like "8-" (to the last page).
 */
export function parsePageRanges(input: string, pageCount: number): RangeParseResult {
  const cleaned = input
    .replace(/[–—]/g, "-") // en and em dashes
    .replace(/\s*-\s*/g, "-") // "1 - 3" -> "1-3"
    .trim();
  if (!cleaned) return { ok: false, error: "Enter at least one page or range, for example 1-3, 5." };

  const parts = cleaned
    .split(/[,;]+|\s+(?=\d)/)
    .map((part) => part.replace(/\s+/g, ""))
    .filter(Boolean);
  const ranges: PageRange[] = [];

  for (const part of parts) {
    const match = /^(\d+)(?:-(\d*))?$/.exec(part);
    if (!match) return { ok: false, error: `"${part}" is not a valid page or range.` };
    const start = Number(match[1]);
    const end = match[2] === undefined ? start : match[2] === "" ? pageCount : Number(match[2]);
    if (start < 1 || end < 1) return { ok: false, error: "Page numbers start at 1." };
    if (start > pageCount || end > pageCount) {
      return { ok: false, error: `This PDF has ${pageCount} page${pageCount === 1 ? "" : "s"}; "${part}" is out of range.` };
    }
    if (start > end) return { ok: false, error: `"${part}" goes backwards. Write it as ${end}-${start}.` };
    ranges.push({ start, end });
  }
  return { ok: true, ranges };
}

/** Parse ranges into a sorted set of 0-based page indexes. */
export function parsePageSelection(
  input: string,
  pageCount: number
): { ok: true; pages: number[] } | { ok: false; error: string } {
  const result = parsePageRanges(input, pageCount);
  if (!result.ok) return result;
  const set = new Set<number>();
  for (const { start, end } of result.ranges) for (let p = start; p <= end; p++) set.add(p - 1);
  return { ok: true, pages: [...set].sort((a, b) => a - b) };
}

/** Turn 0-based indexes into compact text, e.g. [0,1,2,4] -> "1-3, 5". */
export function formatPageList(indexes: number[]): string {
  const sorted = [...new Set(indexes)].sort((a, b) => a - b);
  const parts: string[] = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    parts.push(i === j ? `${sorted[i] + 1}` : `${sorted[i] + 1}-${sorted[j] + 1}`);
    i = j + 1;
  }
  return parts.join(", ");
}

export function describeRange({ start, end }: PageRange): string {
  return start === end ? `page ${start}` : `pages ${start}-${end}`;
}

/** Split into consecutive chunks of `size` pages. */
export function fixedSizeRanges(pageCount: number, size: number): PageRange[] {
  const ranges: PageRange[] = [];
  for (let start = 1; start <= pageCount; start += size) {
    ranges.push({ start, end: Math.min(pageCount, start + size - 1) });
  }
  return ranges;
}
