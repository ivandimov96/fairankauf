import type { Metadata } from "next";

import { COMPANY } from "@/lib/site";

export const metadata: Metadata = { title: "Datenschutzerklärung" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed">{children}</div>
    </section>
  );
}

/**
 * Says only what this site does with data: nothing is stored here, a request
 * is delivered to us by email and WhatsApp, no cookies, no tracking. Keep it
 * in step with the lead form and lib/notifications.
 */
export default function DatenschutzPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight">Datenschutzerklärung</h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        Kurz und klar: welche Daten wir verarbeiten, wofür, und welche Rechte Sie haben.
      </p>

      <Section title="1. Verantwortlicher">
        <p>
          {COMPANY.name}
          <br />
          {COMPANY.street}
          <br />
          {COMPANY.city}
          <br />
          Telefon:{" "}
          <a href={`tel:${COMPANY.phoneE164}`} className="underline underline-offset-4">
            {COMPANY.phone}
          </a>
        </p>
      </Section>

      <Section title="2. Ihre Anfrage über das Formular">
        <p>
          <strong>Welche Daten:</strong> Ihre Angaben zum Fahrzeug (Marke, Modell, Erstzulassung,
          Kilometerstand, Ausstattung, Zustand), Ihre Preisvorstellung und der gewünschte
          Verkaufszeitpunkt, Postleitzahl und Ort, Vor- und Nachname, Telefonnummer, Ihr bevorzugter
          Kontaktweg und, wenn Sie möchten, Ihre E-Mail-Adresse.
        </p>
        <p>
          <strong>Wofür:</strong> um Ihr Fahrzeug zu bewerten, Ihnen ein Angebot zu machen und Sie dazu
          zu kontaktieren (Art. 6 Abs. 1 lit. b DSGVO).
        </p>
        <p>
          <strong>Wie:</strong> Die Website speichert Ihre Anfrage nicht. Beim Absenden wird sie uns per
          E-Mail an unser Geschäftspostfach und per WhatsApp an unser Geschäftstelefon zugestellt
          (WhatsApp Business Platform der Meta Platforms Ireland Limited, Dublin, Irland).
        </p>
        <p>
          <strong>Spamschutz:</strong> Beim Absenden wird Ihre IP-Adresse kurz geprüft, um
          automatische Massenanfragen abzuwehren (Art. 6 Abs. 1 lit. f DSGVO). Sie wird nicht
          dauerhaft gespeichert.
        </p>
      </Section>

      <Section title="3. Unsere Antwort">
        <p>
          Wir melden uns auf dem Weg, den Sie gewählt haben: per Anruf, WhatsApp oder E-Mail. Bei
          WhatsApp gelten zusätzlich die Datenschutzbestimmungen von WhatsApp. Wenn Sie das nicht
          möchten, wählen Sie im Formular „Anruf“ oder „E-Mail“.
        </p>
      </Section>

      <Section title="4. Speicherdauer">
        <p>
          Wir bewahren Ihre Anfrage nur so lange auf, wie wir sie bearbeiten. Kommt kein Kauf
          zustande, löschen wir sie danach. Kommt ein Kauf zustande, bewahren wir die
          Vertragsunterlagen so lange auf, wie es das Handels- und Steuerrecht vorschreibt
          (§ 257 HGB, § 147 AO).
        </p>
      </Section>

      <Section title="5. Besuch der Website">
        <p>
          Die Website wird von Vercel auf Servern in Frankfurt am Main betrieben. Beim Aufruf fallen
          technische Zugriffsdaten an (IP-Adresse, Uhrzeit, aufgerufene Seite, Browser). Sie dienen
          nur dem sicheren Betrieb der Website (Art. 6 Abs. 1 lit. f DSGVO) und werden nach kurzer
          Zeit gelöscht. Mit Vercel besteht ein Vertrag zur Auftragsverarbeitung.
        </p>
      </Section>

      <Section title="6. Keine Cookies, kein Tracking">
        <p>
          Wir setzen keine Cookies, keine Analyse-Tools und keine Werbung ein. Damit Ihre Eingaben
          beim Ausfüllen nicht verloren gehen, merkt sich Ihr Browser sie nur auf Ihrem eigenen Gerät,
          bis Sie das Formular absenden.
        </p>
      </Section>

      <Section title="7. Ihre Rechte">
        <p>
          Sie können jederzeit Auskunft über Ihre Daten verlangen, sie berichtigen oder löschen
          lassen, die Verarbeitung einschränken lassen, Ihre Daten herausverlangen und einer
          Verarbeitung widersprechen (Art. 15 bis 21 DSGVO). Eine kurze Nachricht an die oben
          genannten Kontaktdaten genügt.
        </p>
        <p>
          Außerdem können Sie sich bei einer Datenschutz-Aufsichtsbehörde beschweren. Für uns
          zuständig ist der Hessische Beauftragte für Datenschutz und Informationsfreiheit,
          Wiesbaden.
        </p>
      </Section>

      <p className="mt-10 text-sm text-muted-foreground">Stand: Oktober 2026</p>
    </main>
  );
}
