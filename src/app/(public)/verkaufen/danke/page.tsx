import type { Metadata } from "next";
import Link from "next/link";
import { CheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Vielen Dank",
  robots: { index: false },
};

const NEXT_STEPS = [
  "Wir prüfen Ihre Angaben.",
  "Wir melden uns bei Ihnen, so wie Sie es gewünscht haben, mit einem fairen Angebot.",
  "Passt das Angebot, vereinbaren wir einen Termin für Besichtigung und Übergabe.",
];

export default function ThankYouPage() {
  return (
    <main className="mx-auto grid w-full max-w-xl flex-1 content-center gap-6 px-4 py-14">
      <div className="grid justify-items-center gap-4 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-signal text-signal-foreground">
          <CheckIcon aria-hidden className="size-9" strokeWidth={3} />
        </span>
        <h1 className="text-4xl font-bold tracking-tight">Vielen Dank!</h1>
        <p className="text-lg">Wir melden uns in Kürze.</p>
      </div>
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="text-lg font-bold">So geht es weiter</h2>
        <ol className="mt-4 grid gap-4">
          {NEXT_STEPS.map((s, i) => (
            <li key={s} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <span className="pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
      </div>
      <Button asChild variant="outline" size="lg" className="justify-self-center">
        <Link href="/">Zur Startseite</Link>
      </Button>
    </main>
  );
}
