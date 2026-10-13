import Link from "next/link";

import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 32 32" className={cn("size-8", className)}>
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path d="M9 16.5l4.5 4.5L23 11.5" fill="none" className="stroke-signal" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 rounded-md font-display text-xl font-bold tracking-tight outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <LogoMark />
      <span>
        Fair<span className={inverted ? "text-signal" : "text-primary"}>Ankauf</span>
      </span>
    </Link>
  );
}
