import type { Metadata } from "next";

import { LeadWizard } from "@/components/form/lead-wizard";

export const metadata: Metadata = {
  title: "Auto verkaufen – Daten eingeben | FairAnkauf",
  description: "Beschreiben Sie Ihr Auto in wenigen Schritten und erhalten Sie ein faires Angebot.",
};

export default function SellPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 pt-6">
      <LeadWizard />
    </main>
  );
}
