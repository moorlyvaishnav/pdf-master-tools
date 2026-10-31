import type { Tool } from "@/data/tools";
import { ToolCard } from "./tool-card";

interface ToolGridProps {
  tools: Tool[];
  headingLevel?: "h3" | "h4";
  className?: string;
}

export function ToolGrid({ tools, headingLevel = "h3", className = "" }: ToolGridProps) {
  return (
    <ul className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}>
      {tools.map((tool) => (
        <li key={tool.slug}>
          <ToolCard tool={tool} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
