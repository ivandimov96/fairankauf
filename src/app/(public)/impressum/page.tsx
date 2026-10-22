import type { Metadata } from "next";

import { COMPANY, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = { title: "Impressum" };

export default function ImpressumPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight">Impressum</h1>
      <h2 className="mt-8 text-xl font-bold">Angaben gemäß § 5 DDG</h2>
      <p className="mt-2">
        Betreiber der Website „{SITE_NAME}“:
        <br />
        <strong>{COMPANY.name}</strong>
        <br />
        {COMPANY.street}
        <br />
        {COMPANY.city}
      </p>
      <h2 className="mt-8 text-xl font-bold">Kontakt</h2>
      <p className="mt-2">
        Telefon:{" "}
        <a href={`tel:${COMPANY.phoneE164}`} className="underline underline-offset-4">
          {COMPANY.phone}
        </a>
        <br />
        Erreichbar auch per WhatsApp unter dieser Nummer.
      </p>
      <h2 className="mt-8 text-xl font-bold">Umsatzsteuer-ID</h2>
      <p className="mt-2">
        Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:
        <br />
        {COMPANY.vatId}
      </p>
      <h2 className="mt-8 text-xl font-bold">Verbraucherstreitbeilegung</h2>
      <p className="mt-2">
        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </p>
      <h2 className="mt-8 text-xl font-bold">Haftung für Inhalte und Links</h2>
      <p className="mt-2">
        Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
        Vollständigkeit und Aktualität der Inhalte übernehmen wir jedoch keine Gewähr. Unser
        Angebot für Ihr Fahrzeug ist unverbindlich und wird erst mit einem schriftlichen
        Kaufvertrag wirksam. Für die Inhalte verlinkter externer Seiten sind ausschließlich
        deren Betreiber verantwortlich.
      </p>
    </main>
  );
}
