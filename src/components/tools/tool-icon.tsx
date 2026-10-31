import {
  Calculator,
  Combine,
  Droplets,
  FileImage,
  FileOutput,
  FileSearch,
  FileSpreadsheet,
  FileText,
  Hash,
  Highlighter,
  Image as ImageIcon,
  Images,
  Info,
  Layers,
  Lock,
  LockOpen,
  Minimize2,
  PenLine,
  PenTool,
  Presentation,
  RefreshCw,
  Replace,
  RotateCw,
  Scale,
  Scissors,
  Smartphone,
  TextCursorInput,
  Trash2,
  Type,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps the serialisable icon names stored in /data to Lucide components.
 * Keeping names as strings lets tool data be passed safely between
 * server and client components.
 */
const iconMap: Record<string, LucideIcon> = {
  image: ImageIcon,
  refresh: RefreshCw,
  pen: PenLine,
  layers: Layers,
  wrench: Wrench,
  "file-image": FileImage,
  images: Images,
  smartphone: Smartphone,
  "file-text": FileText,
  "file-spreadsheet": FileSpreadsheet,
  presentation: Presentation,
  type: Type,
  replace: Replace,
  "text-cursor": TextCursorInput,
  "pen-tool": PenTool,
  droplets: Droplets,
  hash: Hash,
  highlighter: Highlighter,
  combine: Combine,
  scissors: Scissors,
  minimize: Minimize2,
  rotate: RotateCw,
  trash: Trash2,
  "file-output": FileOutput,
  lock: Lock,
  unlock: LockOpen,
  info: Info,
  calculator: Calculator,
  "file-search": FileSearch,
  scale: Scale,
};

interface ToolIconProps {
  name: string;
  className?: string;
}

export function ToolIcon({ name, className = "h-6 w-6" }: ToolIconProps) {
  const Icon = iconMap[name] ?? FileText;
  return <Icon className={className} aria-hidden="true" strokeWidth={1.8} />;
}
