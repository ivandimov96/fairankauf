"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CarFrontIcon,
  CheckIcon,
  LoaderCircleIcon,
  LockIcon,
  MapPinIcon,
  UserRoundIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react";

import { clearDraft, loadDraft, saveDraft } from "@/components/form/draft";
import { CheckGroup } from "@/components/form/check-group";
import { ChoiceGroup } from "@/components/form/choice-group";
import { Field, FieldErrors, describedBy } from "@/components/form/field";
import { BRAND_LABELS, ListPicker, MODEL_LABELS } from "@/components/form/list-picker";
import { LogoMark } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { TURNSTILE_SITE_KEY, Turnstile } from "@/components/form/turnstile";
import {
  ACCIDENT,
  BODY_TYPES,
  BRANDS,
  COLORS,
  CONDITION,
  CONTACT_METHOD,
  DISPLACEMENT,
  DOORS,
  DRIVETRAIN,
  EXTRAS,
  FUEL,
  GEARBOX,
  INTERIOR,
  LIGHTS,
  MONTHS,
  POWER_UNIT,
  SELL_TIMING,
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
import { modelsFor } from "@/lib/models";
import { formatNumber } from "@/lib/money";
import { cn } from "@/lib/utils";
import { submitLead } from "@/server/actions/submit-lead";

const STEPS = [
  { key: "basics", title: "Ihr Auto", short: "Auto", hint: "Die Eckdaten", icon: CarFrontIcon },
  { key: "condition", title: "Zustand", short: "Zustand", hint: "Wie ist es in Schuss?", icon: WrenchIcon },
  { key: "location", title: "Preis und Standort", short: "Preis & Ort", hint: "Wann, wo, wie viel", icon: MapPinIcon },
  { key: "contact", title: "Ihre Kontaktdaten", short: "Kontakt", hint: "Wie erreichen wir Sie?", icon: UserRoundIcon },
] as const satisfies { key: keyof typeof STEP_FIELDS; title: string; short: string; hint: string; icon: LucideIcon }[];

const TRUST = ["100 % kostenlos und unverbindlich", "Antwort in der Regel am selben Tag", "Abholung und Abmeldung inklusive"];

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
  type FieldName = keyof LeadFormValues;
  const err = (name: FieldName) => errors[name]?.message as string | undefined;
  /**
   * register() plus: a field that already shows an error is re-checked on every
   * change, so the message disappears as soon as the seller fixes it. Otherwise
   * (mode "onTouched") it would only go away on blur, which moves the layout at
   * the moment the seller taps "Weiter" and the tap misses the button.
   */
  const reg = (name: FieldPath<LeadFormValues>) =>
    register(name, {
      onChange: () => {
        if (form.getFieldState(name).error) void form.trigger(name);
      },
    });
  // Kilometerstand gets thousands separators ("123.000") once the seller leaves the field.
  const mileageReg = register("mileageKm", {
    onChange: () => {
      if (form.getFieldState("mileageKm").error) void form.trigger("mileageKm");
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/[\s.]/g, "");
      if (/^\d+$/.test(digits)) form.setValue("mileageKm", formatNumber(Number(digits)), { shouldValidate: true });
    },
  });
  // An electric car has no gearbox to choose and no engine size to ask for.
  const fuelReg = register("fuel", {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      if (form.getFieldState("fuel").error) void form.trigger("fuel");
      if (e.target.value === "ELEKTRO") {
        if (!form.getValues("gearbox")) form.setValue("gearbox", "AUTOMATIK", { shouldValidate: true });
        form.setValue("displacement", "");
      }
    },
  });

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
        honeypot: honeypotRef.current?.value,
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
  const fuel = useWatch({ control, name: "fuel" });
  const brand = useWatch({ control, name: "brand" });
  // The brand the model list belongs to. Typing in the brand box empties the
  // brand until an entry is picked; the model keeps its list meanwhile.
  const [modelBrand, setModelBrand] = React.useState(brand);
  if (brand && brand !== modelBrand) setModelBrand(brand);
  const models = React.useMemo(() => modelsFor(modelBrand), [modelBrand]);

  return (
    <div className="grid gap-4 lg:grid-cols-[17rem_1fr] lg:items-start lg:gap-6">
      {/* Desktop: progress and trust points next to the form */}
      <aside
        aria-label="Fortschritt"
        className="hidden rounded-2xl bg-ink p-6 text-ink-foreground lg:sticky lg:top-20 lg:grid lg:gap-7"
      >
        <div>
          <LogoMark className="h-9" />
          <h2 className="mt-5 text-xl font-bold">Ihr Angebot in 4 Schritten</h2>
          <p className="mt-1 text-sm opacity-75">Dauert etwa 2 Minuten.</p>
        </div>
        <ol className="grid gap-1">
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            const inner = (
              <>
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    done && "bg-signal text-signal-foreground",
                    active && "bg-ink-foreground text-ink",
                    !done && !active && "border border-ink-foreground/30 text-ink-foreground/70",
                  )}
                >
                  {done ? <CheckIcon aria-hidden className="size-4" strokeWidth={3} /> : i + 1}
                </span>
                <span className="grid text-left">
                  <span className={cn("font-semibold", !done && !active && "opacity-70")}>{s.title}</span>
                  <span className="text-xs opacity-70">{s.hint}</span>
                </span>
              </>
            );
            return (
              <li key={s.key} aria-current={active ? "step" : undefined}>
                {done ? (
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    disabled={pending}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 outline-none hover:bg-ink-foreground/10 focus-visible:ring-[3px] focus-visible:ring-signal/60"
                  >
                    {inner}
                    <span className="sr-only">(bearbeiten)</span>
                  </button>
                ) : (
                  <div className={cn("flex items-center gap-3 rounded-lg px-2 py-2", active && "bg-ink-foreground/10")}>
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        <ul className="grid gap-2.5 border-t border-ink-foreground/15 pt-5 text-sm">
          {TRUST.map((t) => (
            <li key={t} className="flex items-start gap-2">
              <CheckIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-signal" strokeWidth={3} />
              {t}
            </li>
          ))}
        </ul>
      </aside>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (isLast) void form.handleSubmit(onValid, onInvalid)(e);
          else void next();
        }}
        className="grid rounded-2xl border bg-card shadow-sm"
      >
        <div className="grid gap-5 px-5 pt-5 sm:px-8 sm:pt-7">
          {/* Phone and tablet: compact progress bar */}
          <ol aria-label={`Schritt ${step + 1} von ${STEPS.length}`} className="grid grid-cols-4 gap-1.5 lg:hidden">
            {STEPS.map((s, i) => {
              const done = i < step;
              const label = (
                <>
                  <span
                    className={cn("h-1.5 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-primary/15")}
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

          <div className="flex items-start gap-4">
            <span className="hidden size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary sm:flex">
              <current.icon aria-hidden className="size-6" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">
                Schritt {step + 1} von {STEPS.length}
              </p>
              <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold tracking-tight outline-none sm:text-3xl">
                {current.title}
              </h1>
            </div>
          </div>
        </div>

        <div className="grid gap-5 px-5 py-6 sm:px-8">
          {current.key === "basics" && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="brand" label="Marke" error={err("brand")}>
                  <Controller
                    control={control}
                    name="brand"
                    render={({ field }) => (
                      <ListPicker
                        id="brand"
                        options={BRANDS}
                        labels={BRAND_LABELS}
                        value={field.value}
                        onChange={(v) => {
                          // A different brand clears the model; retyping the same one keeps it.
                          if (v && v !== modelBrand && form.getValues("model")) form.setValue("model", "");
                          field.onChange(v);
                          if (err("brand")) void form.trigger("brand");
                          // Straight on to the model: its list opens on focus.
                          if (v && !form.getValues("model") && modelsFor(v).length > 0) {
                            requestAnimationFrame(() => document.getElementById("model")?.focus());
                          }
                        }}
                        onBlur={field.onBlur}
                        error={err("brand")}
                        describedBy={describedBy("brand", err("brand"))}
                      />
                    )}
                  />
                </Field>
                {models.length > 0 ? (
                  <Field id="model" label="Modell" error={err("model")}>
                    <Controller
                      control={control}
                      name="model"
                      render={({ field }) => (
                        <ListPicker
                          key={modelBrand}
                          id="model"
                          options={models}
                          labels={MODEL_LABELS}
                          value={field.value}
                          onChange={(v) => {
                            field.onChange(v);
                            if (err("model")) void form.trigger("model");
                          }}
                          onBlur={field.onBlur}
                          error={err("model")}
                          describedBy={describedBy("model", err("model"))}
                        />
                      )}
                    />
                  </Field>
                ) : (
                  <Field id="model" label="Modell" hint="z. B. Golf 1.4 TSI" error={err("model")}>
                    <Input
                      id="model"
                      autoComplete="off"
                      aria-invalid={!!err("model")}
                      aria-describedby={describedBy("model", err("model"), "hint")}
                      {...reg("model")}
                    />
                  </Field>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid content-start gap-2">
                  <div className="grid grid-cols-2 gap-3">
                    <Field id="firstRegYear" label="Erstzulassung">
                      <NativeSelect
                        id="firstRegYear"
                        aria-invalid={!!err("firstRegYear")}
                        aria-describedby={describedBy("firstRegYear", err("firstRegYear"))}
                        {...reg("firstRegYear")}
                      >
                        <option value="">Jahr</option>
                        {YEARS.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </NativeSelect>
                    </Field>
                    <Field id="firstRegMonth" label="Monat" optional>
                      <NativeSelect
                        id="firstRegMonth"
                        aria-invalid={!!err("firstRegMonth")}
                        aria-describedby={describedBy("firstRegMonth", err("firstRegMonth"))}
                        {...reg("firstRegMonth")}
                      >
                        <option value="">–</option>
                        {MONTHS.map((m, i) => (
                          <option key={m} value={String(i + 1)}>
                            {m}
                          </option>
                        ))}
                      </NativeSelect>
                    </Field>
                  </div>
                  <FieldErrors
                    errors={[
                      ["firstRegYear", err("firstRegYear")],
                      ["firstRegMonth", err("firstRegMonth")],
                    ]}
                  />
                </div>
                <Field id="mileageKm" label="Kilometerstand (km)" error={err("mileageKm")}>
                  <Input
                    id="mileageKm"
                    inputMode="numeric"
                    placeholder="z. B. 120.000"
                    aria-invalid={!!err("mileageKm")}
                    aria-describedby={describedBy("mileageKm", err("mileageKm"))}
                    {...mileageReg}
                  />
                </Field>
              </div>

              <ChoiceGroup
                name="fuel"
                legend="Kraftstoff"
                options={FUEL}
                columns="grid-cols-3 sm:grid-cols-6"
                error={err("fuel")}
                inputProps={fuelReg}
              />

              <div className="grid gap-5 sm:grid-cols-[2fr_3fr]">
                <ChoiceGroup
                  name="gearbox"
                  legend="Getriebe"
                  options={GEARBOX}
                  error={err("gearbox")}
                  inputProps={reg("gearbox")}
                />
                <ChoiceGroup
                  name="drivetrain"
                  legend="Antrieb"
                  options={DRIVETRAIN}
                  columns="grid-cols-3"
                  hint="Die meisten Autos haben Frontantrieb."
                  error={err("drivetrain")}
                  inputProps={reg("drivetrain")}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <ChoiceGroup
                  name="doors"
                  legend="Türen"
                  options={DOORS}
                  columns="grid-cols-4"
                  error={err("doors")}
                  inputProps={reg("doors")}
                />
                <Field id="color" label="Farbe" error={err("color")}>
                  <NativeSelect
                    id="color"
                    aria-invalid={!!err("color")}
                    aria-describedby={describedBy("color", err("color"))}
                    {...reg("color")}
                  >
                    <option value="">Bitte wählen</option>
                    {Object.entries(COLORS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
              </div>

              <OptionalSection>
                <div className={cn("grid gap-5", fuel === "ELEKTRO" ? "sm:grid-cols-2" : "sm:grid-cols-3")}>
                  <Field id="power" label="Leistung" hint="Fahrzeugschein, Feld P.2 (in kW)." error={err("power")}>
                    <div className="grid grid-cols-[1fr_6rem] gap-2">
                      <Input
                        id="power"
                        inputMode="numeric"
                        placeholder="z. B. 150"
                        aria-invalid={!!err("power")}
                        aria-describedby={describedBy("power", err("power"), "hint")}
                        {...reg("power")}
                      />
                      <NativeSelect aria-label="Einheit der Leistung" {...reg("powerUnit")}>
                        {Object.entries(POWER_UNIT).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </NativeSelect>
                    </div>
                  </Field>
                  {fuel !== "ELEKTRO" && (
                    <Field id="displacement" label="Hubraum">
                      <NativeSelect id="displacement" {...reg("displacement")}>
                        <option value="">Bitte wählen</option>
                        {Object.entries(DISPLACEMENT).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </NativeSelect>
                    </Field>
                  )}
                  <Field id="bodyType" label="Karosserieform">
                    <NativeSelect id="bodyType" {...reg("bodyType")}>
                      <option value="">Bitte wählen</option>
                      {BODY_TYPES.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </NativeSelect>
                  </Field>
                </div>
              </OptionalSection>
            </>
          )}

          {current.key === "condition" && (
            <>
              <ChoiceGroup
                name="condition"
                legend="Allgemeiner Zustand"
                options={CONDITION}
                columns="grid-cols-2 sm:grid-cols-4"
                error={err("condition")}
                inputProps={reg("condition")}
              />
              <ChoiceGroup
                name="interiorCondition"
                legend="Innenzustand"
                options={CONDITION}
                columns="grid-cols-2 sm:grid-cols-4"
                error={err("interiorCondition")}
                inputProps={reg("interiorCondition")}
              />
              <div className="grid gap-5 sm:grid-cols-[3fr_2fr]">
                <ChoiceGroup
                  name="accident"
                  legend="Unfallschaden"
                  options={ACCIDENT}
                  columns="grid-cols-3"
                  error={err("accident")}
                  inputProps={reg("accident")}
                />
                <ChoiceGroup
                  name="drivable"
                  legend="Ist das Auto fahrbereit?"
                  options={YES_NO}
                  error={err("drivable")}
                  inputProps={reg("drivable")}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <ChoiceGroup
                  name="serviceBook"
                  legend="Scheckheftgepflegt?"
                  options={SERVICE_BOOK}
                  columns="grid-cols-3"
                  error={err("serviceBook")}
                  inputProps={reg("serviceBook")}
                />
                <Field id="previousOwners" label="Anzahl Vorbesitzer" error={err("previousOwners")}>
                  <Input
                    id="previousOwners"
                    inputMode="numeric"
                    placeholder="z. B. 1"
                    aria-invalid={!!err("previousOwners")}
                    aria-describedby={describedBy("previousOwners", err("previousOwners"))}
                    {...reg("previousOwners")}
                  />
                </Field>
              </div>
              <ChoiceGroup
                name="interior"
                legend="Material der Innenausstattung"
                options={INTERIOR}
                columns="grid-cols-3 sm:grid-cols-5"
                error={err("interior")}
                inputProps={reg("interior")}
              />
              <OptionalSection>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Controller
                    control={control}
                    name="huDue"
                    render={({ field }) => {
                      // Stored as "YYYY-MM"; shown as two German selects instead of the
                      // browser's month picker, which follows the phone's language.
                      const [year = "", month = ""] = field.value ? field.value.split("-") : [];
                      // A half-filled date ("2027-") fails validation ("Bitte wählen Sie Monat und Jahr.")
                      const set = (y: string, m: string) => {
                        field.onChange(y || m ? `${y}-${m}` : "");
                        if (err("huDue")) void form.trigger("huDue");
                      };
                      return (
                        <fieldset
                          className="grid content-start gap-2"
                          aria-describedby={err("huDue") ? "huDue-error" : undefined}
                        >
                          <legend className="mb-2 text-sm leading-none font-medium">Nächste HU/TÜV fällig</legend>
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
                  <Field id="lights" label="Scheinwerfer">
                    <NativeSelect id="lights" {...reg("lights")}>
                      <option value="">Bitte wählen</option>
                      {Object.entries(LIGHTS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </NativeSelect>
                  </Field>
                </div>
                <CheckGroup
                  name="extras"
                  legend="Ausstattung"
                  options={EXTRAS}
                  columns="grid-cols-2 sm:grid-cols-4"
                  inputProps={reg("extras")}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    id="defects"
                    label="Bekannte Mängel"
                    hint="z. B. Kratzer hinten links, Klimaanlage kühlt nicht"
                    error={err("defects")}
                  >
                    <Textarea
                      id="defects"
                      rows={2}
                      className="min-h-11"
                      aria-invalid={!!err("defects")}
                      aria-describedby={describedBy("defects", err("defects"), "hint")}
                      {...reg("defects")}
                    />
                  </Field>
                  <Field
                    id="notes"
                    label="Sonstiges"
                    hint="Was wir noch wissen sollten, z. B. Tuning, neue Reifen, Anhängerkupplung"
                    error={err("notes")}
                  >
                    <Textarea
                      id="notes"
                      rows={2}
                      className="min-h-11"
                      aria-invalid={!!err("notes")}
                      aria-describedby={describedBy("notes", err("notes"), "hint")}
                      {...reg("notes")}
                    />
                  </Field>
                </div>
              </OptionalSection>
            </>
          )}

          {current.key === "location" && (
            <>
              <ChoiceGroup
                name="sellTiming"
                legend="Wann möchten Sie Ihr Auto verkaufen?"
                options={SELL_TIMING}
                columns="grid-cols-2 sm:grid-cols-4"
                error={err("sellTiming")}
                inputProps={reg("sellTiming")}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  id="desiredPrice"
                  label="Ihre Preisvorstellung (€)"
                  optional
                  hint="Ohne Vorstellung? Einfach leer lassen."
                  error={err("desiredPrice")}
                >
                  <Input
                    id="desiredPrice"
                    inputMode="numeric"
                    placeholder="z. B. 8.500"
                    aria-invalid={!!err("desiredPrice")}
                    aria-describedby={describedBy("desiredPrice", err("desiredPrice"), "hint")}
                    {...reg("desiredPrice")}
                  />
                </Field>
                {/* PLZ and Ort share one row; their errors go below it so the inputs stay aligned. */}
                <div className="grid content-start gap-2">
                  <div className="grid grid-cols-[6.5rem_1fr] gap-3">
                    <Field id="plz" label="PLZ">
                      <Input
                        id="plz"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        maxLength={5}
                        placeholder="12345"
                        aria-invalid={!!err("plz")}
                        aria-describedby={describedBy("plz", err("plz"))}
                        {...reg("plz")}
                      />
                    </Field>
                    <Field id="city" label="Ort">
                      <Input
                        id="city"
                        autoComplete="address-level2"
                        aria-invalid={!!err("city")}
                        aria-describedby={describedBy("city", err("city"))}
                        {...reg("city")}
                      />
                    </Field>
                  </div>
                  <FieldErrors
                    errors={[
                      ["plz", err("plz")],
                      ["city", err("city")],
                    ]}
                  />
                </div>
              </div>
            </>
          )}

          {current.key === "contact" && (
            <>
              <CarSummary values={form.getValues()} />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="firstName" label="Vorname" error={err("firstName")}>
                  <Input
                    id="firstName"
                    autoComplete="given-name"
                    aria-invalid={!!err("firstName")}
                    aria-describedby={describedBy("firstName", err("firstName"))}
                    {...reg("firstName")}
                  />
                </Field>
                <Field id="lastName" label="Nachname" error={err("lastName")}>
                  <Input
                    id="lastName"
                    autoComplete="family-name"
                    aria-invalid={!!err("lastName")}
                    aria-describedby={describedBy("lastName", err("lastName"))}
                    {...reg("lastName")}
                  />
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="phone" label="Telefonnummer" hint="z. B. 0151 23456789" error={err("phone")}>
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    aria-invalid={!!err("phone")}
                    aria-describedby={describedBy("phone", err("phone"), "hint")}
                    {...reg("phone")}
                  />
                </Field>
                <Field id="email" label="E-Mail" optional={contactMethod !== "EMAIL"} error={err("email")}>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={!!err("email")}
                    aria-describedby={describedBy("email", err("email"))}
                    {...reg("email")}
                  />
                </Field>
              </div>
              <ChoiceGroup
                name="contactMethod"
                legend="Wie sollen wir Sie kontaktieren?"
                options={CONTACT_METHOD}
                columns="grid-cols-3 sm:max-w-sm"
                error={err("contactMethod")}
                inputProps={reg("contactMethod")}
              />
              <div className="grid gap-2">
                <Label className="flex items-start gap-3 text-sm leading-relaxed font-normal">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-5 shrink-0 accent-primary"
                    aria-invalid={!!err("consent")}
                    aria-describedby={err("consent") ? "consent-error" : undefined}
                    {...reg("consent")}
                  />
                  <span>
                    Ich bin einverstanden, dass „Wir kaufen Ihr Auto“ meine Angaben verarbeitet, um mich wegen meines Autos zu
                    kontaktieren. Details in der{" "}
                    <Link href="/datenschutz" target="_blank" className="text-primary underline underline-offset-4">
                      Datenschutzerklärung
                    </Link>
                    .
                  </span>
                </Label>
                {err("consent") && (
                  <p id="consent-error" role="alert" className="text-sm text-destructive">
                    {err("consent")}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Honeypot: invisible to people, bots fill it in. */}
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            {/* Deliberately meaningless name and label: browsers and password managers
                autofill fields called "website" or "email", which made real sellers look like bots. */}
            <label htmlFor="fa-hp">Dieses Feld bitte leer lassen</label>
            <input
              ref={honeypotRef}
              id="fa-hp"
              name="fa-hp"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
              data-form-type="other"
            />
          </div>

          {isLast && <Turnstile onToken={setTurnstileToken} />}

          {submitError && (
            <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {submitError}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-b-2xl border-t bg-muted/40 px-5 py-4 max-sm:sticky max-sm:bottom-0 max-sm:bg-card/95 max-sm:backdrop-blur sm:px-8">
          {step > 0 ? (
            <Button type="button" variant="outline" size="lg" onClick={() => goTo(step - 1)} disabled={pending}>
              <ArrowLeftIcon aria-hidden />
              Zurück
            </Button>
          ) : (
            <p className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
              <LockIcon aria-hidden className="size-4 shrink-0" />
              Kostenlos und unverbindlich
            </p>
          )}
          <Button
            type="submit"
            size="lg"
            className="max-sm:flex-1"
            disabled={pending || (isLast && !!TURNSTILE_SITE_KEY && !turnstileToken)}
          >
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
    </div>
  );
}

/** Fields the seller may skip, grouped after the required ones so the must-haves come first. */
function OptionalSection({ children }: { children: React.ReactNode }) {
  return (
    <section aria-labelledby="optional-heading" className="grid gap-5 border-t pt-5">
      <div>
        <h2 id="optional-heading" className="font-semibold">
          Weitere Angaben <span className="font-normal text-muted-foreground">(optional)</span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Je mehr wir wissen, desto genauer wird unser Angebot.</p>
      </div>
      {children}
    </section>
  );
}

/** "Volkswagen Golf · 2016 · 123.000 km": reassures the seller before sending. */
function CarSummary({ values }: { values: LeadFormValues }) {
  const km = Number(String(values.mileageKm ?? "").replace(/[\s.]/g, ""));
  const parts = [
    [values.brand, values.model].filter(Boolean).join(" "),
    values.firstRegYear ? `EZ ${values.firstRegYear}` : "",
    Number.isFinite(km) && km > 0 ? `${formatNumber(km)} km` : "",
    values.fuel ? FUEL[values.fuel] : "",
  ].filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <div className="flex items-center gap-3 rounded-xl bg-accent px-4 py-3">
      <CarFrontIcon aria-hidden className="size-5 shrink-0 text-primary" />
      <div>
        <p className="text-xs font-medium text-muted-foreground">Ihr Auto</p>
        <p className="font-semibold">{parts.join(" · ")}</p>
      </div>
    </div>
  );
}
