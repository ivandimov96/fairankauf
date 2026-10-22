import Link from "next/link";

import { LOGO_BODY, LOGO_STRIPE, LOGO_VIEWBOX } from "@/components/site/logo-paths";
import { cn } from "@/lib/utils";

/** The car silhouette: body in the current text color, stripe in the brand red. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox={LOGO_VIEWBOX} className={cn("h-7 w-auto shrink-0", className)}>
      <path d={LOGO_BODY} fill="currentColor" fillRule="evenodd" />
      <path d={LOGO_STRIPE} className="fill-signal" fillRule="evenodd" />
    </svg>
  );
}

/** Mark and name, linking home. `inverted` on dark backgrounds. */
export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex w-fit items-center gap-2.5 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        inverted ? "text-ink-foreground" : "text-ink",
      )}
    >
      <LogoMark className="h-7 sm:h-8" />
      <span className="grid font-display text-[0.95rem] leading-[1.1] font-bold tracking-tight sm:text-lg">
        <span>Wir kaufen</span>
        <span className="text-signal">Ihr Auto</span>
      </span>
    </Link>
  );
}
