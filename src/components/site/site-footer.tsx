import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© FairAnkauf</p>
        <nav aria-label="Rechtliches" className="flex gap-6">
          <Link href="/impressum" className="py-2 hover:text-foreground">
            Impressum
          </Link>
          <Link href="/datenschutz" className="py-2 hover:text-foreground">
            Datenschutz
          </Link>
        </nav>
      </div>
    </footer>
  );
}
