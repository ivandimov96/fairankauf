import Link from "next/link";

import { Logo } from "@/components/site/logo";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="grid gap-2">
          <Logo inverted />
          <p className="max-w-sm opacity-75">Ihr Auto fair verkaufen: kostenlos, unverbindlich und ohne Inserat.</p>
        </div>
        <nav aria-label="Rechtliches" className="flex gap-6">
          <Link href="/impressum" className="py-2 opacity-80 hover:opacity-100">
            Impressum
          </Link>
          <Link href="/datenschutz" className="py-2 opacity-80 hover:opacity-100">
            Datenschutz
          </Link>
        </nav>
      </div>
    </footer>
  );
}
