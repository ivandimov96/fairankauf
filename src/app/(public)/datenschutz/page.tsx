import type { Metadata } from "next";

export const metadata: Metadata = { title: "Datenschutzerklärung | FairAnkauf" };

// PLACEHOLDER: replace with a complete privacy policy (e.g. generated with eRecht24)
// before launch. It must name Vercel (hosting), Neon (database),
// Cloudflare Turnstile (spam protection) and the WhatsApp notification provider.
export default function DatenschutzPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Datenschutzerklärung</h1>
      <p className="mt-4 rounded-md bg-accent p-3 text-sm">
        Platzhalter: Dieser Text wird vor dem Start durch eine vollständige Datenschutzerklärung ersetzt.
      </p>
      <h2 className="mt-8 text-xl font-semibold">1. Verantwortlicher</h2>
      <p className="mt-2">[Vorname Nachname], FairAnkauf, [Anschrift], [E-Mail-Adresse]</p>
      <h2 className="mt-8 text-xl font-semibold">2. Welche Daten wir verarbeiten</h2>
      <p className="mt-2">
        Wenn Sie unser Formular ausfüllen, verarbeiten wir Ihre Angaben zum Fahrzeug, Ihren
        Namen, Ihre Telefonnummer, optional Ihre E-Mail-Adresse sowie Postleitzahl und Ort, um Sie zu
        kontaktieren und Ihnen ein Angebot zu machen (Art. 6 Abs. 1 lit. a und b DSGVO).
      </p>
      <h2 className="mt-8 text-xl font-semibold">3. Speicherdauer und Löschung</h2>
      <p className="mt-2">
        [Speicherdauer]. Sie können jederzeit die Löschung Ihrer Daten verlangen. Eine formlose Nachricht an
        [E-Mail-Adresse] genügt.
      </p>
      <h2 className="mt-8 text-xl font-semibold">4. Dienstleister</h2>
      <p className="mt-2">[Hosting, Datenbank, Spamschutz, Benachrichtigungsdienst]</p>
      <h2 className="mt-8 text-xl font-semibold">5. Ihre Rechte</h2>
      <p className="mt-2">
        Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
        Datenübertragbarkeit, Widerruf Ihrer Einwilligung und Beschwerde bei einer Aufsichtsbehörde.
      </p>
      <h2 className="mt-8 text-xl font-semibold">6. Cookies</h2>
      <p className="mt-2">
        Auf den öffentlichen Seiten setzen wir keine Tracking-Cookies. Ihre Formulareingaben werden nur
        lokal in Ihrem Browser zwischengespeichert, bis Sie das Formular absenden.
      </p>
    </main>
  );
}
