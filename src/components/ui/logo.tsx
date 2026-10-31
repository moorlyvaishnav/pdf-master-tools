import Link from "next/link";
import { siteConfig } from "@/config/site";

interface LogoProps {
  className?: string;
}

interface LogoMarkProps extends LogoProps {
  /** Must be unique per page when the mark is shown more than once (e.g. header and footer). */
  gradientId?: string;
}

/** Original PDF Master Tools logo: a folded-corner document mark with a check stroke. */
export function LogoMark({ className = "h-9 w-9", gradientId = "pmt-logo-gradient" }: LogoMarkProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="10" fill={`url(#${gradientId})`} />
      <path d="M13 9.5h10.5L29 15v15a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 12 30V11a1.5 1.5 0 0 1 1-1.5Z" fill="#fff" />
      <path d="M23.5 9.5V14a1 1 0 0 0 1 1H29" fill="#c7d2fe" />
      <path d="m15.5 22.5 3 3 6-6.5" fill="none" stroke="#4f46e5" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 rounded-lg ${className}`}
      aria-label={`${siteConfig.name} - home`}
    >
      <LogoMark className="h-9 w-9 transition-transform duration-300 group-hover:-rotate-6" />
      <span className="text-lg font-extrabold tracking-tight text-ink">
        PDF <span className="text-gradient">Master</span>
        <span className="hidden font-semibold text-slate-500 sm:inline"> Tools</span>
      </span>
    </Link>
  );
}
