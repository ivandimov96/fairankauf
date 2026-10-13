"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

/** Header shortcut to the form; hidden while the seller is already in it. */
export function HeaderCta() {
  const pathname = usePathname();
  if (pathname.startsWith("/verkaufen")) return null;
  return (
    <Button asChild size="sm" className="h-10 px-4">
      <Link href="/verkaufen">Angebot anfordern</Link>
    </Button>
  );
}
