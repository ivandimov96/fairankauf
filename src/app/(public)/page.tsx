import Link from "next/link";
import {
  ArrowRightIcon,
  BanknoteIcon,
  CheckIcon,
  FileCheckIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "lucide-react";

import { QuickStart } from "@/components/form/quick-start";
import { LogoMark } from "@/components/site/logo";
import { Button } from "@/components/ui/button";

const PROMISES = ["100 % kostenlos", "Unverbindlich", "Abholung und Abmeldung inklusive"];

const STEPS = [
  {
    title: "Auto beschreiben",
    text: "Marke, Modell, Kilometerstand und Zustand. Dauert etwa 2 Minuten, ganz bequem am Handy.",
  },
  {
    title: "Persönliches Angebot",
    text: "Wir melden uns bei Ihnen, so wie Sie es möchten: per Anruf, WhatsApp oder E-Mail. Mit einem fairen Preis.",
  },
  {
    title: "Verkaufen und Geld erhalten",
    text: "Wir schauen uns das Auto kurz an, Sie unterschreiben den Kaufvertrag und bekommen Ihr Geld.",
  },
];

const ANY_CONDITION = [
  "Mit Unfallschaden",
  "Mit technischen Mängeln",
  "Hoher Kilometerstand",
  "HU/TÜV abgelaufen",
  "Nicht fahrbereit",
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
    title: "Ohne Risiko",
    text: "Unser Angebot kostet Sie nichts. Sie entscheiden in Ruhe, ob Sie verkaufen.",
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

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        {/* Soft road-marking stripes in the background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07] [background:repeating-linear-gradient(115deg,transparent_0_46px,currentColor_46px_50px)]"
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pt-10 pb-14 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14 lg:pb-20">
          <div className="grid gap-6">
            <p className="w-fit rounded-full border border-ink-foreground/25 px-3 py-1 text-sm font-medium">
              Autoankauf von privat
            </p>
            <h1 className="text-[2.5rem] leading-[1.05] font-bold tracking-tight sm:text-5xl lg:text-[3.4rem]">
              <span className="block">
                Wir kaufen
                <br className="sm:hidden" /> Ihr Auto.
              </span>
              <span className="text-signal">Fair. Schnell. Ohne Stress.</span>
            </h1>
            <p className="hidden max-w-xl text-lg opacity-85 sm:block">
              Kein Inserat, keine Probefahrten mit Fremden, kein Feilschen. Sie beschreiben Ihr Auto, wir machen Ihnen
              ein ehrliches Angebot und kümmern uns um den Rest.
            </p>
            <ul className="grid gap-2.5 sm:flex sm:flex-wrap sm:gap-x-6">
              {PROMISES.map((p) => (
                <li key={p} className="flex items-center gap-2 font-medium">
                  <span className="flex size-6 items-center justify-center rounded-full bg-signal text-signal-foreground">
                    <CheckIcon aria-hidden className="size-4" strokeWidth={3} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4">
            <LogoMark className="h-12 justify-self-end sm:mr-2 sm:h-16" />
            <div className="rounded-2xl bg-card p-5 text-card-foreground shadow-2xl ring-1 ring-black/5 sm:p-7">
              <h2 className="text-2xl font-bold tracking-tight">Was ist Ihr Auto wert?</h2>
              <p className="mt-1 mb-5 text-muted-foreground">Starten Sie hier, den Rest fragen wir im nächsten Schritt.</p>
              <QuickStart />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="so-gehts" className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">In drei Schritten</p>
        <h2 id="so-gehts" className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          So einfach geht’s
        </h2>
        <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative grid content-start gap-3 border-t-2 border-primary pt-5">
              <span className="font-display text-5xl leading-none font-bold text-primary/20">0{i + 1}</span>
              <h3 className="text-xl font-bold">{s.title}</h3>
              <p className="text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Any condition */}
      <section aria-labelledby="jeder-zustand" className="bg-ink text-ink-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-[1fr_1.3fr] lg:items-center">
          <div>
            <h2 id="jeder-zustand" className="text-3xl font-bold tracking-tight sm:text-4xl">
              Jedes Auto. <span className="text-signal">In jedem Zustand.</span>
            </h2>
            <p className="mt-3 max-w-md opacity-85">
              Ob gepflegter Kombi oder Auto mit Macken: Wir machen Ihnen ein faires Angebot.
            </p>
          </div>
          <ul className="flex flex-wrap gap-2.5">
            {ANY_CONDITION.map((c) => (
              <li
                key={c}
                className="flex items-center gap-2 rounded-full bg-ink-foreground/10 px-4 py-2.5 font-medium ring-1 ring-ink-foreground/20"
              >
                <CheckIcon aria-hidden className="size-4 text-signal" strokeWidth={3} />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Benefits */}
      <section aria-labelledby="vorteile" className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <h2 id="vorteile" className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ihre Vorteile
        </h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <li key={b.title} className="grid content-start gap-3 rounded-2xl border bg-card p-6">
              <span className="flex size-12 items-center justify-center rounded-xl bg-signal text-signal-foreground">
                <b.icon aria-hidden className="size-6" />
              </span>
              <h3 className="text-lg font-bold">{b.title}</h3>
              <p className="text-muted-foreground">{b.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq" className="bg-muted">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:py-20 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 id="faq" className="text-3xl font-bold tracking-tight sm:text-4xl">
              Häufige Fragen
            </h2>
            <p className="mt-3 text-muted-foreground">Alles Wichtige zum Autoverkauf bei uns.</p>
          </div>
          <div className="grid gap-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-xl border bg-card px-5 open:shadow-sm">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-semibold outline-none focus-visible:underline [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span
                    aria-hidden
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-lg text-primary transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="pb-5 text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final call to action */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="relative grid gap-6 overflow-hidden rounded-3xl bg-ink p-8 text-ink-foreground sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Bereit für ein faires Angebot?</h2>
            <p className="mt-2 text-lg">Kostenlos und unverbindlich. In etwa 2 Minuten erledigt.</p>
          </div>
          <Button asChild size="xl" className="w-full sm:w-fit">
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
