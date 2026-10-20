import type { Metadata } from "next";

import { LeadWizard } from "@/components/form/lead-wizard";

export const metadata: Metadata = {
  title: "Auto verkaufen – Daten eingeben",
  alternates: { canonical: "/verkaufen" },
  description: "Beschreiben Sie Ihr Auto in wenigen Schritten und erhalten Sie ein faires Angebot.",
};

export default function SellPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-3 pt-4 pb-10 sm:px-4 sm:pt-8">
      <LeadWizard />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Ihre Eingaben werden automatisch auf diesem Gerät gespeichert.
      </p>
    </main>
  );
}
