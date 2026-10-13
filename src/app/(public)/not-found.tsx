import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto grid w-full max-w-xl flex-1 content-center justify-items-center gap-4 px-4 py-16 text-center">
      <p className="text-sm font-medium text-primary">Fehler 404</p>
      <h1 className="text-4xl font-bold tracking-tight">Diese Seite gibt es nicht.</h1>
      <p className="text-muted-foreground">Vielleicht hat sich ein Tippfehler in die Adresse eingeschlichen.</p>
      <Button asChild size="lg" className="mt-2">
        <Link href="/">Zur Startseite</Link>
      </Button>
    </main>
  );
}
