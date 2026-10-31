import type { Tool } from "@/data/tools";
import { getCategory } from "@/data/categories";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Client-side tool search. Every word in the query must appear in the tool's
 * name, summary, category or keywords. Name matches are ranked first.
 */
export function searchTools(allTools: Tool[], query: string): Tool[] {
  const q = normalize(query);
  if (!q) return allTools;
  const terms = q.split(" ");

  const scored = allTools
    .map((tool) => {
      const name = normalize(tool.name);
      const haystack = normalize(
        [tool.name, tool.summary, getCategory(tool.category).name, ...tool.keywords].join(" ")
      );
      // Match at the start of a word, so "word" finds "Word to PDF" but not "password".
      const words = haystack.split(" ");
      if (!terms.every((term) => words.some((word) => word.startsWith(term)))) return null;

      let score = 0;
      if (name === q) score += 100;
      if (name.startsWith(q)) score += 50;
      if (name.includes(q)) score += 25;
      score += terms.filter((term) => name.includes(term)).length * 10;
      return { tool, score };
    })
    .filter((entry): entry is { tool: Tool; score: number } => entry !== null);

  scored.sort((a, b) => b.score - a.score);
  return scored.map((entry) => entry.tool);
}
