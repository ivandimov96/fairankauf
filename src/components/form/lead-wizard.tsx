"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, LoaderCircleIcon, LockIcon } from "lucide-react";

import { BrandPicker } from "@/components/form/brand-picker";
import { clearDraft, loadDraft, saveDraft } from "@/components/form/draft";
import { ChoiceGroup } from "@/components/form/choice-group";
import { Field, describedBy } from "@/components/form/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { TURNSTILE_SITE_KEY, Turnstile } from "@/components/form/turnstile";
import {
  ACCIDENT,
  BODY_TYPES,
  CONDITION,
  CONTACT_METHOD,
  FUEL,
  GEARBOX,
  MONTHS,
  POWER_UNIT,
  SERVICE_BOOK,
  YES_NO,
} from "@/lib/options";
import {
  EMPTY_LEAD_FORM,
  STEP_FIELDS,
  leadSchema,
  type LeadFormValues,
  type LeadInput,
} from "@/lib/validation/lead";
import { formatNumber } from "@/lib/money";
import { cn } from "@/lib/utils";
import { submitLead } from "@/server/actions/submit-lead";

const STEPS = [
  { key: "basics", title: "Ihr Auto", short: "Auto" },
  { key: "condition", title: "Zustand", short: "Zustand" },
  { key: "location", title: "Preis und Standort", short: "Preis & Ort" },
  { key: "contact", title: "Ihre Kontaktdaten", short: "Kontakt" },
] as const satisfies { key: keyof typeof STEP_FIELDS; title: string; short: string }[];

const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: thisYear - 1950 + 1 }, (_, i) => String(thisYear - i));
// The next HU is due within the next 2 years, or is already overdue.
const HU_YEARS = Array.from({ length: 8 }, (_, i) => String(thisYear + 2 - i));

export function LeadWizard() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [restored, setRestored] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const honeypotRef = React.useRef<HTMLInputElement>(null);
  const [turnstileToken, setTurnstileToken] = React.useState<string | undefined>();

  const form = useForm<LeadFormValues, unknown, LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: EMPTY_LEAD_FORM,
    mode: "onTouched",
  });
  const {
    register,
    control,
    formState: { errors },
  } = form;
  const err = (name: FieldPath<LeadFormValues>) => errors[name]?.message as string | undefined;

  // Restore a saved draft once, after hydration. localStorage only exists in the
  // browser, so reading it during render would make server and client HTML differ.
  React.useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      form.reset({ ...EMPTY_LEAD_FORM, ...draft.values });
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from browser storage
      setStep(Math.min(Math.max(draft.step, 0), STEPS.length - 1));
    }
    setRestored(true);
  }, [form]);

  // Save on every change once restored.
  React.useEffect(() => {
    if (!restored) return;
    saveDraft({ step, values: form.getValues() });
    return form.subscribe({
      formState: { values: true },
      callback: ({ values }) => saveDraft({ step, values }),
    });
  }, [form, step, restored]);

  function goTo(next: number) {
    setStep(next);
    window.scrollTo({ top: 0 });
    // Move focus to the step heading so screen readers announce the new step.
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  async function next() {
    const fields = STEP_FIELDS[STEPS[step]!.key] as FieldPath<LeadFormValues>[];
    const ok = await form.trigger(fields, { shouldFocus: true });
    if (ok) goTo(step + 1);
  }

  const onValid = () => {
    setSubmitError(null);
    startTransition(async () => {
      // Send the raw form values; the server parses them with the same schema.
      const result = await submitLead(form.getValues(), {
        website: honeypotRef.current?.value,
        turnstileToken,
      });
      if (result.ok) {
        clearDraft();
        router.push("/verkaufen/danke");
        return;
      }
      setSubmitError(result.message);
      if (result.fieldErrors) {
        const names = Object.keys(result.fieldErrors);
        for (const name of names) {
          form.setError(name as FieldPath<LeadFormValues>, { message: result.fieldErrors[name] });
        }
        const firstStep = STEPS.findIndex((s) =>
          (STEP_FIELDS[s.key] as readonly string[]).some((f) => names.includes(f)),
        );
        if (firstStep >= 0 && firstStep !== step) goTo(firstStep);
      }
    });
  };

  // Client validation failed on submit: jump to the first step with an error.
  const onInvalid = (invalid: Partial<Record<string, unknown>>) => {
    const firstStep = STEPS.findIndex((s) => (STEP_FIELDS[s.key] as readonly string[]).some((f) => f in invalid));
    if (firstStep >= 0 && firstStep !== step) goTo(firstStep);
  };

  const current = STEPS[step]!;
  const isLast = step === STEPS.length - 1;
  const contactMethod = useWatch({ control, name: "contactMethod" });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (isLast) void form.handleSubmit(onValid, onInvalid)(e);
        else void next();
      }}
      className="grid gap-6"
    >
      <div className="grid gap-4">
        <ol aria-label={`Schritt ${step + 1} von ${STEPS.length}`} className="grid grid-cols-4 gap-1.5">
          {STEPS.map((s, i) => {
            const done = i < step;
            const label = (
              <>
                <span
                  className={cn(
                    "h-1.5 rounded-full transition-colors",
                    i <= step ? "bg-primary" : "bg-primary/15",
                  )}
                />
                <span
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium sm:text-sm",
                    i === step ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {done && <CheckIcon aria-hidden className="size-3.5 text-primary" strokeWidth={3} />}
                  {s.short}
                </span>
              </>
            );
            return (
              <li key={s.key} aria-current={i === step ? "step" : undefined}>
                {done ? (
                  // Completed steps can be reopened.
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    disabled={pending}
                    className="grid w-full gap-2 rounded-sm pb-1 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    {label}
                    <span className="sr-only">(bearbeiten)</span>
                  </button>
                ) : (
                  <div className="grid gap-2 pb-1">{label}</div>
                )}
              </li>
            );
          })}
        </ol>
        <div>
          <p className="text-sm text-muted-foreground">
            Schritt {step + 1} von {STEPS.length}
          </p>
          <h1 ref={headingRef} tabIndex={-1} className="mt-1 text-3xl font-bold tracking-tight outline-none">
            {current.title}
          </h1>
        </div>
      </div>

      {current.key === "basics" && (
        <div className="grid gap-5">
          <Field id="brand" label="Marke" error={err("brand")}>
            <Controller
              control={control}
              name="brand"
              render={({ field }) => (
                <BrandPicker
                  id="brand"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={err("brand")}
                  describedBy={describedBy("brand", err("brand"))}
                />
              )}
            />
          </Field>

          <Field id="model" label="Modell" hint="z. B. Golf 1.4 TSI" error={err("model")}>
            <Input
              id="model"
              autoComplete="off"
              aria-invalid={!!err("model")}
              aria-describedby={describedBy("model", err("model"), "hint")}
              {...register("model")}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field id="firstRegYear" label="Erstzulassung" error={err("firstRegYear")}>
              <NativeSelect
                id="firstRegYear"
                aria-invalid={!!err("firstRegYear")}
                aria-describedby={describedBy("firstRegYear", err("firstRegYear"))}
                {...register("firstRegYear")}
              >
                <option value="">Jahr</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field id="firstRegMonth" label="Monat" optional error={err("firstRegMonth")}>
              <NativeSelect id="firstRegMonth" {...register("firstRegMonth")}>
                <option value="">–</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={String(i + 1)}>
                    {m}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          </div>

          <Field id="mileageKm" label="Kilometerstand (km)" error={err("mileageKm")}>
            <Input
              id="mileageKm"
              inputMode="numeric"
              placeholder="z. B. 120.000"
              aria-invalid={!!err("mileageKm")}
              aria-describedby={describedBy("mileageKm", err("mileageKm"))}
              {...register("mileageKm")}
            />
          </Field>

          <ChoiceGroup
            name="fuel"
            legend="Kraftstoff"
            options={FUEL}
            columns={3}
            error={err("fuel")}
            inputProps={register("fuel")}
          />

          <ChoiceGroup
            name="gearbox"
            legend="Getriebe"
            options={GEARBOX}
            error={err("gearbox")}
            inputProps={register("gearbox")}
          />

          <Field id="power" label="Leistung" optional error={err("power")}>
            <div className="grid grid-cols-[1fr_6rem] gap-2">
              <Input
                id="power"
                inputMode="numeric"
                aria-invalid={!!err("power")}
                aria-describedby={describedBy("power", err("power"))}
                {...register("power")}
              />
              <NativeSelect aria-label="Einheit der Leistung" {...register("powerUnit")}>
                {Object.entries(POWER_UNIT).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </Field>

          <Field id="bodyType" label="Karosserieform" optional>
            <NativeSelect id="bodyType" {...register("bodyType")}>
              <option value="">Bitte wählen</option>
              {BODY_TYPES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>
      )}

      {current.key === "condition" && (
        <div className="grid gap-5">
          <ChoiceGroup
            name="condition"
            legend="Allgemeiner Zustand"
            options={CONDITION}
            error={err("condition")}
            inputProps={register("condition")}
          />
          <ChoiceGroup
            name="accident"
            legend="Unfallschaden"
            options={ACCIDENT}
            columns={3}
            error={err("accident")}
            inputProps={register("accident")}
          />
          <ChoiceGroup
            name="drivable"
            legend="Ist das Auto fahrbereit?"
            options={YES_NO}
            error={err("drivable")}
            inputProps={register("drivable")}
          />
          <Controller
            control={control}
            name="huDue"
            render={({ field }) => {
              // Stored as "YYYY-MM"; shown as two German selects instead of the
              // browser's month picker, which follows the phone's language.
              const [year = "", month = ""] = field.value ? field.value.split("-") : [];
              // A half-filled date ("2027-") fails validation ("Bitte wählen Sie Monat und Jahr.")
              const set = (y: string, m: string) => field.onChange(y || m ? `${y}-${m}` : "");
              return (
                <fieldset className="grid gap-2" aria-describedby={err("huDue") ? "huDue-error" : undefined}>
                  <legend className="mb-2 flex gap-2 text-sm font-medium">
                    Nächste HU/TÜV fällig
                    <span className="font-normal text-muted-foreground">(optional)</span>
                  </legend>
                  <div className="grid grid-cols-2 gap-3">
                    <NativeSelect
                      id="huDue"
                      aria-label="HU-Monat"
                      aria-invalid={!!err("huDue")}
                      value={month}
                      onChange={(e) => set(year, e.target.value)}
                      onBlur={field.onBlur}
                    >
                      <option value="">Monat</option>
                      {MONTHS.map((m, i) => (
                        <option key={m} value={String(i + 1).padStart(2, "0")}>
                          {m}
                        </option>
                      ))}
                    </NativeSelect>
                    <NativeSelect
                      aria-label="HU-Jahr"
                      aria-invalid={!!err("huDue")}
                      value={year}
                      onChange={(e) => set(e.target.value, month)}
                      onBlur={field.onBlur}
                    >
                      <option value="">Jahr</option>
                      {HU_YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                  {err("huDue") && (
                    <p id="huDue-error" role="alert" className="text-sm text-destructive">
                      {err("huDue")}
                    </p>
                  )}
                </fieldset>
              );
            }}
          />
          <ChoiceGroup
            name="serviceBook"
            legend="Scheckheftgepflegt?"
            options={SERVICE_BOOK}
            columns={3}
            error={err("serviceBook")}
            inputProps={register("serviceBook")}
          />
          <Field id="previousOwners" label="Anzahl Vorbesitzer" error={err("previousOwners")}>
            <Input
              id="previousOwners"
              inputMode="numeric"
              placeholder="z. B. 1"
              aria-invalid={!!err("previousOwners")}
              aria-describedby={describedBy("previousOwners", err("previousOwners"))}
              {...register("previousOwners")}
            />
          </Field>
          <Field
            id="defects"
            label="Bekannte Mängel"
            optional
            hint="z. B. Kratzer hinten links, Klimaanlage kühlt nicht"
            error={err("defects")}
          >
            <Textarea
              id="defects"
              aria-invalid={!!err("defects")}
              aria-describedby={describedBy("defects", err("defects"), "hint")}
              {...register("defects")}
            />
          </Field>
        </div>
      )}

      {current.key === "location" && (
        <div className="grid gap-5">
          <Field
            id="desiredPrice"
            label="Ihre Preisvorstellung (€)"
            optional
            hint="Wenn Sie keine Vorstellung haben, lassen Sie das Feld leer."
            error={err("desiredPrice")}
          >
            <Input
              id="desiredPrice"
              inputMode="numeric"
              placeholder="z. B. 8.500"
              aria-invalid={!!err("desiredPrice")}
              aria-describedby={describedBy("desiredPrice", err("desiredPrice"), "hint")}
              {...register("desiredPrice")}
            />
          </Field>
          <div className="grid grid-cols-[7rem_1fr] gap-3">
            <Field id="plz" label="PLZ" error={err("plz")}>
              <Input
                id="plz"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={5}
                aria-invalid={!!err("plz")}
                aria-describedby={describedBy("plz", err("plz"))}
                {...register("plz")}
              />
            </Field>
            <Field id="city" label="Ort" error={err("city")}>
              <Input
                id="city"
                autoComplete="address-level2"
                aria-invalid={!!err("city")}
                aria-describedby={describedBy("city", err("city"))}
                {...register("city")}
              />
            </Field>
          </div>
        </div>
      )}

      {current.key === "contact" && (
        <div className="grid gap-5">
          <CarSummary values={form.getValues()} />
          <Field id="name" label="Name" error={err("name")}>
            <Input
              id="name"
              autoComplete="name"
              aria-invalid={!!err("name")}
              aria-describedby={describedBy("name", err("name"))}
              {...register("name")}
            />
          </Field>
          <Field id="phone" label="Telefonnummer" hint="z. B. 0151 23456789" error={err("phone")}>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              aria-invalid={!!err("phone")}
              aria-describedby={describedBy("phone", err("phone"), "hint")}
              {...register("phone")}
            />
          </Field>
          <Field id="email" label="E-Mail" optional={contactMethod !== "EMAIL"} error={err("email")}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!err("email")}
              aria-describedby={describedBy("email", err("email"))}
              {...register("email")}
            />
          </Field>
          <ChoiceGroup
            name="contactMethod"
            legend="Wie sollen wir Sie kontaktieren?"
            options={CONTACT_METHOD}
            columns={3}
            error={err("contactMethod")}
            inputProps={register("contactMethod")}
          />
          <div className="grid gap-2">
            <label className="flex items-start gap-3 text-sm leading-relaxed">
              <input
                type="checkbox"
                className="mt-0.5 size-5 shrink-0 accent-primary"
                aria-invalid={!!err("consent")}
                aria-describedby={err("consent") ? "consent-error" : undefined}
                {...register("consent")}
              />
              <span>
                Ich bin einverstanden, dass FairAnkauf meine Angaben verarbeitet, um mich wegen meines
                Autos zu kontaktieren. Details in der{" "}
                <Link href="/datenschutz" target="_blank" className="text-primary underline underline-offset-4">
                  Datenschutzerklärung
                </Link>
                .
              </span>
            </label>
            {err("consent") && (
              <p id="consent-error" role="alert" className="text-sm text-destructive">
                {err("consent")}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Honeypot: invisible to people, bots fill it in. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Webseite</label>
        <input ref={honeypotRef} id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {isLast && <Turnstile onToken={setTurnstileToken} />}

      {submitError && (
        <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {submitError}
        </p>
      )}

      {isLast && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <LockIcon aria-hidden className="size-4 shrink-0" />
          Kostenlos und unverbindlich. Ihre Angaben gehen nur an uns.
        </p>
      )}

      <div className="sticky bottom-0 -mx-5 grid grid-cols-[auto_1fr] gap-3 border-t bg-card/95 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        {step > 0 ? (
          <Button type="button" variant="outline" size="lg" onClick={() => goTo(step - 1)} disabled={pending}>
            <ArrowLeftIcon aria-hidden />
            Zurück
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" size="lg" disabled={pending || (isLast && !!TURNSTILE_SITE_KEY && !turnstileToken)}>
          {pending ? (
            <>
              <LoaderCircleIcon aria-hidden className="animate-spin" />
              Wird gesendet…
            </>
          ) : isLast ? (
            "Angebot anfordern"
          ) : (
            <>
              Weiter
              <ArrowRightIcon aria-hidden />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

/** "Volkswagen Golf · 2016 · 123.000 km": reassures the seller before sending. */
function CarSummary({ values }: { values: LeadFormValues }) {
  const km = Number(String(values.mileageKm ?? "").replace(/[\s.]/g, ""));
  const parts = [
    [values.brand, values.model].filter(Boolean).join(" "),
    values.firstRegYear,
    Number.isFinite(km) && km > 0 ? `${formatNumber(km)} km` : "",
  ].filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <div className="rounded-xl bg-accent px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">Ihr Auto</p>
      <p className="font-semibold">{parts.join(" · ")}</p>
    </div>
  );
}
