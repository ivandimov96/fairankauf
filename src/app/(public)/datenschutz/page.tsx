import type { Metadata } from "next";

export const metadata: Metadata = { title: "Datenschutzerklärung" };

// PLACEHOLDER: replace with a complete privacy policy (e.g. generated with eRecht24)
// before launch. The provider list below is accurate for this app; keep it.
export default function DatenschutzPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight">Datenschutzerklärung</h1>
      <p className="mt-4 rounded-lg bg-signal/40 p-3 text-sm">
        Platzhalter: Dieser Text wird vor dem Start durch eine vollständige Datenschutzerklärung ersetzt.
      </p>
      <h2 className="mt-8 text-xl font-bold">1. Verantwortlicher</h2>
      <p className="mt-2">[Vorname Nachname], FairAnkauf, [Anschrift], [E-Mail-Adresse]</p>
      <h2 className="mt-8 text-xl font-bold">2. Welche Daten wir verarbeiten</h2>
      <p className="mt-2">
        Wenn Sie unser Formular ausfüllen, verarbeiten wir Ihre Angaben zum Fahrzeug, Ihren
        Namen, Ihre Telefonnummer, optional Ihre E-Mail-Adresse sowie Postleitzahl und Ort, um Sie zu
        kontaktieren und Ihnen ein Angebot zu machen (Art. 6 Abs. 1 lit. a und b DSGVO).
      </p>
      <h2 className="mt-8 text-xl font-bold">3. Speicherdauer und Löschung</h2>
      <p className="mt-2">
        Wir speichern Ihre Angaben nicht auf unserer Website. Sie werden direkt an uns übermittelt und
        so lange aufbewahrt, wie es für die Bearbeitung Ihrer Anfrage nötig ist
        [Speicherdauer]. Sie können jederzeit die Löschung Ihrer Daten verlangen. Eine formlose Nachricht an
        [E-Mail-Adresse] genügt.
      </p>
      <h2 className="mt-8 text-xl font-bold">4. Dienstleister</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Hosting: Vercel Inc. (Server in Frankfurt am Main)</li>
        <li>Spamschutz: Cloudflare Turnstile (Cloudflare Inc.)</li>
      </ul>
      <p className="mt-2">[Angaben zu Auftragsverarbeitung und Drittlandübermittlung ergänzen]</p>
      <h2 className="mt-8 text-xl font-bold">5. Ihre Rechte</h2>
      <p className="mt-2">
        Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
        Datenübertragbarkeit, Widerruf Ihrer Einwilligung und Beschwerde bei einer Aufsichtsbehörde.
      </p>
      <h2 className="mt-8 text-xl font-bold">6. Cookies</h2>
      <p className="mt-2">
        Wir setzen keine Tracking-Cookies und keine Analyse-Tools ein. Ihre Formulareingaben werden nur
        lokal in Ihrem Browser zwischengespeichert, bis Sie das Formular absenden.
      </p>
    </main>
  );
}
