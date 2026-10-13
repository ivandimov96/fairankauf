import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Vielen Dank",
  robots: { index: false },
};

export default function ThankYouPage() {
  return (
    <main className="mx-auto grid w-full max-w-xl flex-1 content-center justify-items-center gap-4 px-4 py-16 text-center">
      <CircleCheckIcon aria-hidden className="size-14 text-primary" />
      <h1 className="text-3xl font-semibold tracking-tight">Vielen Dank!</h1>
      <p className="text-lg">Wir melden uns in Kürze.</p>
      <p className="text-muted-foreground">
        Wir haben Ihre Angaben erhalten und rufen Sie an oder schreiben Ihnen, so wie Sie es gewünscht haben.
      </p>
      <Button asChild variant="outline" size="lg" className="mt-4">
        <Link href="/">Zur Startseite</Link>
      </Button>
    </main>
  );
}
