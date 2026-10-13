import type { Metadata } from "next";

export const metadata: Metadata = { title: "Impressum" };

// PLACEHOLDER: replace with your real details (e.g. generated with eRecht24) before launch.
export default function ImpressumPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight">Impressum</h1>
      <p className="mt-4 rounded-lg bg-signal/40 p-3 text-sm">
        Platzhalter: Dieser Text wird vor dem Start durch die echten Angaben ersetzt.
      </p>
      <h2 className="mt-8 text-xl font-bold">Angaben gemäß § 5 DDG</h2>
      <p className="mt-2">
        [Vorname Nachname]
        <br />
        FairAnkauf
        <br />
        [Straße Hausnummer]
        <br />
        [PLZ Ort]
      </p>
      <h2 className="mt-8 text-xl font-bold">Kontakt</h2>
      <p className="mt-2">
        Telefon: [Telefonnummer]
        <br />
        E-Mail: [E-Mail-Adresse]
      </p>
      <h2 className="mt-8 text-xl font-bold">Umsatzsteuer-ID</h2>
      <p className="mt-2">Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: [USt-IdNr.]</p>
      <h2 className="mt-8 text-xl font-bold">Verbraucherstreitbeilegung</h2>
      <p className="mt-2">
        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    </main>
  );
}
