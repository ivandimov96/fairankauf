import Link from "next/link";
import {
  ArrowRightIcon,
  BanknoteIcon,
  ClipboardListIcon,
  FileCheckIcon,
  HandshakeIcon,
  MessageCircleIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const STEPS = [
  {
    icon: ClipboardListIcon,
    title: "Daten eingeben",
    text: "Beschreiben Sie Ihr Auto in wenigen Minuten, ganz bequem am Handy.",
  },
  {
    icon: MessageCircleIcon,
    title: "Angebot erhalten",
    text: "Wir melden uns persönlich bei Ihnen und nennen Ihnen ein faires, verbindliches Angebot.",
  },
  {
    icon: HandshakeIcon,
    title: "Auto verkaufen, Geld bekommen",
    text: "Wir schauen uns das Auto kurz an, Sie unterschreiben den Kaufvertrag und erhalten Ihr Geld.",
  },
];

const BENEFITS = [
  {
    icon: BanknoteIcon,
    title: "Schnelle Bezahlung",
    text: "Sie erhalten Ihr Geld direkt bei der Übergabe.",
  },
  {
    icon: TruckIcon,
    title: "Kostenlose Abholung",
    text: "Wir holen das Auto bei Ihnen ab, auch wenn es nicht mehr fährt.",
  },
  {
    icon: FileCheckIcon,
    title: "Kostenlose Abmeldung",
    text: "Um die Abmeldung bei der Zulassungsstelle kümmern wir uns.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Unverbindlich",
    text: "Unser Angebot kostet Sie nichts. Sie entscheiden in Ruhe.",
  },
];

const FAQ = [
  {
    q: "Kostet mich die Anfrage etwas?",
    a: "Nein. Die Anfrage, das Angebot, die Abholung und die Abmeldung sind für Sie kostenlos und unverbindlich.",
  },
  {
    q: "Wie schnell bekomme ich ein Angebot?",
    a: "In der Regel melden wir uns noch am selben Tag bei Ihnen, spätestens am nächsten Werktag.",
  },
  {
    q: "Kaufen Sie auch Autos mit Schaden oder ohne TÜV?",
    a: "Ja. Wir kaufen Autos in jedem Zustand, auch mit Unfallschaden, technischen Mängeln, hohem Kilometerstand oder abgelaufener HU.",
  },
  {
    q: "Wie werde ich bezahlt?",
    a: "Sie erhalten den vereinbarten Betrag bei der Übergabe, per Sofortüberweisung oder auf Wunsch in bar.",
  },
  {
    q: "Welche Unterlagen brauche ich?",
    a: "Fahrzeugschein und Fahrzeugbrief (Zulassungsbescheinigung Teil I und II), Ihren Personalausweis und alle Schlüssel. Ein Serviceheft und Rechnungen sind ein Plus.",
  },
  {
    q: "Muss ich das Angebot annehmen?",
    a: "Nein. Wenn Ihnen unser Angebot nicht zusagt, lehnen Sie einfach ab. Es entstehen Ihnen keine Kosten.",
  },
];

function CtaButton({ className }: { className?: string }) {
  return (
    <Button asChild size="lg" className={className}>
      <Link href="/verkaufen">
        Jetzt Auto bewerten lassen
        <ArrowRightIcon aria-hidden />
      </Link>
    </Button>
  );
}

export default function HomePage() {
  return (
    <main>
      <section className="bg-gradient-to-b from-accent to-background">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 pt-12 pb-16 sm:pt-20">
          <p className="text-sm font-medium text-primary">Autoankauf von privat</p>
          <h1 className="max-w-2xl text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
            Ihr Auto verkaufen: fair bewertet, schnell bezahlt.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Kein Inserat, keine Probefahrten mit Fremden, kein Feilschen. Sie beschreiben Ihr Auto, wir
            machen Ihnen ein ehrliches Angebot und kümmern uns um den Rest.
          </p>
          <CtaButton className="w-full sm:w-fit" />
          <p className="text-sm text-muted-foreground">Kostenlos und unverbindlich. Dauert etwa 2 Minuten.</p>
        </div>
      </section>

      <section aria-labelledby="so-gehts" className="mx-auto max-w-5xl px-4 py-14">
        <h2 id="so-gehts" className="text-2xl font-semibold tracking-tight">
          So einfach geht&apos;s
        </h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="grid gap-3 rounded-xl border bg-card p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <s.icon aria-hidden className="size-5 text-primary" />
              </div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="vorteile" className="bg-muted/50">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <h2 id="vorteile" className="text-2xl font-semibold tracking-tight">
            Ihre Vorteile
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <li key={b.title} className="flex gap-4 rounded-xl bg-card p-5 shadow-xs">
                <b.icon aria-hidden className="mt-0.5 size-6 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold">{b.title}</h3>
                  <p className="mt-1 text-muted-foreground">{b.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="faq" className="mx-auto w-full max-w-3xl px-4 py-14">
        <h2 id="faq" className="text-2xl font-semibold tracking-tight">
          Häufige Fragen
        </h2>
        <div className="mt-6 divide-y rounded-xl border bg-card">
          {FAQ.map((f) => (
            <details key={f.q} className="group px-5">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-medium outline-none focus-visible:underline [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden className="text-xl text-primary transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-4 text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-16">
        <div className="grid gap-4 rounded-2xl bg-primary p-8 text-primary-foreground sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Was ist Ihr Auto wert?</h2>
            <p className="mt-2 opacity-90">Jetzt Daten eingeben und ein faires Angebot erhalten.</p>
          </div>
          <Button asChild size="lg" variant="secondary" className="w-full sm:w-fit">
            <Link href="/verkaufen">
              Angebot anfordern
              <ArrowRightIcon aria-hidden />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
