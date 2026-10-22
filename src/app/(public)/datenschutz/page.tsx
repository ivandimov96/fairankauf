import type { Metadata } from "next";

import { COMPANY, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = { title: "Datenschutzerklärung" };

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 text-xl font-bold">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-2">{children}</p>;
}

/**
 * Describes exactly what this site does with data: no database, no cookies, no
 * tracking; a request goes to our mailbox and, as a WhatsApp message, through
 * Meta. Keep this page in step with lib/notifications and the lead form.
 */
export default function DatenschutzPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight">Datenschutzerklärung</h1>
      <P>
        Wir freuen uns über Ihr Interesse an „{SITE_NAME}“. Der Schutz Ihrer persönlichen Daten ist
        uns wichtig. Hier erfahren Sie, welche Daten wir beim Besuch dieser Website und beim
        Ausfüllen unseres Formulars verarbeiten, wofür wir sie nutzen und welche Rechte Sie haben.
      </P>

      <H2>1. Verantwortlicher</H2>
      <P>
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
      </P>

      <H2>2. Hosting und Server-Logs</H2>
      <P>
        Diese Website wird bei Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA,
        gehostet. Die Seite wird auf Servern in Frankfurt am Main ausgeliefert. Bei jedem Aufruf
        verarbeitet Vercel in unserem Auftrag automatisch die Daten, die Ihr Browser übermittelt:
        IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, übertragene Datenmenge, Browsertyp und
        Betriebssystem sowie die zuvor besuchte Seite. Diese Daten dienen ausschließlich dem
        sicheren und stabilen Betrieb der Website und der Fehleranalyse (Art. 6 Abs. 1 lit. f
        DSGVO) und werden nach kurzer Zeit gelöscht. Mit Vercel besteht ein Vertrag zur
        Auftragsverarbeitung; soweit Daten in die USA übermittelt werden, geschieht dies auf
        Grundlage der EU-Standardvertragsklauseln und der Zertifizierung von Vercel nach dem
        EU-US Data Privacy Framework.
      </P>

      <H2>3. Anfrageformular „Auto verkaufen“</H2>
      <P>
        Wenn Sie unser Formular ausfüllen, verarbeiten wir die Angaben zu Ihrem Fahrzeug (zum
        Beispiel Marke, Modell, Erstzulassung, Kilometerstand, Ausstattung und Zustand), Ihre
        Preisvorstellung und den gewünschten Verkaufszeitpunkt, Postleitzahl und Ort des
        Fahrzeugs, Ihren Vor- und Nachnamen, Ihre Telefonnummer, Ihren bevorzugten Kontaktweg
        sowie optional Ihre E-Mail-Adresse. Wir nutzen diese Daten, um Ihr Fahrzeug zu bewerten,
        Ihnen ein Angebot zu machen und Sie dazu zu kontaktieren. Rechtsgrundlage ist Art. 6
        Abs. 1 lit. b DSGVO (Maßnahmen vor einem möglichen Vertragsschluss auf Ihre Anfrage).
      </P>
      <P>
        Die Website speichert Ihre Anfrage nicht. Sie wird beim Absenden an uns übermittelt, und
        zwar auf zwei Wegen:
      </P>
      <ul className="mt-2 list-disc space-y-2 pl-5">
        <li>
          <strong>per E-Mail</strong> an unser geschäftliches E-Mail-Postfach, und
        </li>
        <li>
          <strong>per WhatsApp</strong> als Nachricht an unser Geschäftstelefon über die WhatsApp
          Business Platform von Meta Platforms Ireland Limited, Merrion Road, Dublin 4, D04 X2K5,
          Irland. Diese Nachricht enthält Ihre Fahrzeugangaben, Ihren Namen, Ihre Telefonnummer,
          den Ort und, falls angegeben, Ihre E-Mail-Adresse. Meta kann die Nachricht dabei auch
          auf Servern in den USA verarbeiten (Meta Platforms, Inc.). Die Übermittlung stützt sich
          auf die Zertifizierung von Meta nach dem EU-US Data Privacy Framework sowie die
          EU-Standardvertragsklauseln. Informationen zum Datenschutz bei WhatsApp finden Sie
          unter{" "}
          <a
            href="https://www.whatsapp.com/legal/privacy-policy-eea"
            className="underline underline-offset-4"
            rel="noopener noreferrer"
            target="_blank"
          >
            whatsapp.com/legal/privacy-policy-eea
          </a>
          .
        </li>
      </ul>
      <P>
        Zum Schutz vor automatisierten Spam-Einsendungen prüfen wir jede Absendung technisch
        (ein für Menschen unsichtbares Formularfeld und eine Begrenzung der Anfragen pro
        IP-Adresse). Dafür wird Ihre IP-Adresse für höchstens eine Stunde im Arbeitsspeicher des
        Servers gehalten (Art. 6 Abs. 1 lit. f DSGVO).
      </P>

      <H2>4. Kontaktaufnahme nach Ihrer Anfrage</H2>
      <P>
        Wir melden uns auf dem Weg, den Sie im Formular gewählt haben: per Telefon, per WhatsApp
        oder per E-Mail. Schreiben wir Ihnen über WhatsApp, verarbeitet WhatsApp (Meta) dabei Ihre
        Telefonnummer und den Nachrichteninhalt nach seinen eigenen Datenschutzbestimmungen. Wenn
        Sie das nicht möchten, wählen Sie im Formular einfach „Anruf“ oder „E-Mail“ als Kontaktweg.
        Die weitere Kommunikation, zum Beispiel zu Besichtigung, Angebot und Abholung, erfolgt auf
        Grundlage von Art. 6 Abs. 1 lit. b DSGVO.
      </P>

      <H2>5. Speicherdauer</H2>
      <P>
        Wir bewahren Ihre Anfrage so lange auf, wie es für ihre Bearbeitung nötig ist. Kommt kein
        Kauf zustande, löschen wir die Anfrage, sobald sie erledigt ist. Kommt ein Kauf zustande,
        bewahren wir die Vertragsunterlagen so lange auf, wie es das Handels- und Steuerrecht
        vorschreibt (§ 257 HGB, § 147 AO: in der Regel sechs bzw. zehn Jahre).
      </P>

      <H2>6. Zwischenspeicherung Ihrer Eingaben im Browser</H2>
      <P>
        Damit Ihre Eingaben beim Wechsel zwischen den Formularschritten oder bei einem Neuladen
        der Seite nicht verloren gehen, speichert Ihr Browser sie vorübergehend lokal auf Ihrem
        Gerät (Local Storage). Diese Daten verlassen Ihr Gerät nicht und werden beim Absenden des
        Formulars gelöscht. Die Speicherung ist technisch notwendig, damit das Formular wie von
        Ihnen gewünscht funktioniert (§ 25 Abs. 2 Nr. 2 TDDDG). Sie können die Daten jederzeit
        über die Einstellungen Ihres Browsers löschen.
      </P>

      <H2>7. Keine Cookies, kein Tracking</H2>
      <P>
        Diese Website setzt keine Cookies, keine Analyse- oder Werbe-Tools und keine Inhalte von
        Social-Media-Plattformen ein. Wir erstellen keine Nutzungsprofile.
      </P>

      <H2>8. Datensicherheit</H2>
      <P>
        Alle Daten werden zwischen Ihrem Browser und unserer Website verschlüsselt übertragen
        (TLS/HTTPS). Der Zugriff auf unser E-Mail-Postfach und unser Geschäftstelefon ist durch
        Passwörter beziehungsweise Gerätesperren geschützt.
      </P>

      <H2>9. Ihre Rechte</H2>
      <P>
        Sie haben gegenüber uns das Recht auf Auskunft über die zu Ihrer Person gespeicherten Daten
        (Art. 15 DSGVO), auf Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der
        Verarbeitung (Art. 18) und Datenübertragbarkeit (Art. 20). Einer Verarbeitung, die auf
        Art. 6 Abs. 1 lit. f DSGVO beruht, können Sie jederzeit widersprechen (Art. 21). Zur
        Ausübung Ihrer Rechte genügt eine formlose Nachricht an die oben genannten Kontaktdaten.
      </P>
      <P>
        Außerdem haben Sie das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
        Für uns zuständig ist der Hessische Beauftragte für Datenschutz und Informationsfreiheit,
        Gustav-Stresemann-Ring 1, 65189 Wiesbaden.
      </P>

      <H2>10. Änderungen</H2>
      <P>
        Wir passen diese Datenschutzerklärung an, wenn sich unsere Website oder die rechtlichen
        Vorgaben ändern. Es gilt die jeweils hier veröffentlichte Fassung.
        <br />
        Stand: Oktober 2026
      </P>
    </main>
  );
}
