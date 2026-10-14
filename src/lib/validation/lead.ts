import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import { z } from "zod";

import type { LeadSummary } from "@/lib/notifications/format";
import {
  ACCIDENT,
  BODY_TYPES,
  CONDITION,
  CONTACT_METHOD,
  FUEL,
  GEARBOX,
  POWER_UNIT,
  SERVICE_BOOK,
  YES_NO,
  keysOf,
} from "@/lib/options";

// One schema for the client form (react-hook-form) and the Server Action.
// Form inputs are strings; the schema trims, converts and range-checks them.
// Error messages are German because they are shown to sellers. Zod's own
// fallback messages are German too.
z.config(z.locales.de());

const MIN_YEAR = 1950;

function currentYear() {
  return new Date().getFullYear();
}

/** Accepts "120000", "120.000", "120 000". Returns NaN for anything else. */
function parseInteger(value: string): number {
  const cleaned = value.replace(/[\s.]/g, "");
  return /^\d+$/.test(cleaned) ? Number(cleaned) : Number.NaN;
}

const requiredText = (max: number, message: string) =>
  z.string().trim().min(1, message).max(max, `Bitte höchstens ${max} Zeichen.`);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Bitte höchstens ${max} Zeichen.`)
    .transform((v) => v || null);

const requiredInt = (min: number, max: () => number, message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .transform(parseInteger)
    .refine((n) => Number.isInteger(n) && n >= min && n <= max(), message);

const optionalInt = (min: number, max: number, message: string) =>
  z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : parseInteger(v)))
    .refine((n) => n === null || (Number.isInteger(n) && n >= min && n <= max), message);

const choice = <T extends Record<string, string>>(obj: T, message: string) =>
  z.enum(keysOf(obj), { error: message });

export const leadStep1 = z.object({
  brand: requiredText(60, "Bitte wählen Sie die Marke."),
  model: requiredText(80, "Bitte geben Sie das Modell ein."),
  firstRegYear: requiredInt(MIN_YEAR, currentYear, "Bitte geben Sie ein gültiges Jahr ein."),
  firstRegMonth: optionalInt(1, 12, "Bitte wählen Sie einen Monat."),
  mileageKm: requiredInt(0, () => 2_000_000, "Bitte geben Sie den Kilometerstand ein."),
  fuel: choice(FUEL, "Bitte wählen Sie die Kraftstoffart."),
  gearbox: choice(GEARBOX, "Bitte wählen Sie das Getriebe."),
  power: optionalInt(1, 2000, "Bitte geben Sie eine gültige Leistung ein."),
  powerUnit: choice(POWER_UNIT, "Bitte wählen Sie kW oder PS."),
  bodyType: z.union([z.enum(BODY_TYPES), z.literal("")]).transform((v) => v || null),
});

export const leadStep2 = z.object({
  condition: choice(CONDITION, "Bitte wählen Sie den Zustand."),
  accident: choice(ACCIDENT, "Bitte beantworten Sie die Frage zum Unfallschaden."),
  drivable: choice(YES_NO, "Bitte beantworten Sie, ob das Auto fahrbereit ist."),
  // <input type="month"> gives "YYYY-MM"; empty when not filled in.
  huDue: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{4}-(0[1-9]|1[0-2])$/.test(v), "Bitte wählen Sie Monat und Jahr.")
    .transform((v) => v || null),
  serviceBook: choice(SERVICE_BOOK, "Bitte wählen Sie eine Option."),
  previousOwners: requiredInt(0, () => 20, "Bitte geben Sie die Anzahl der Vorbesitzer ein."),
  defects: optionalText(2000),
});

export const leadStep4 = z.object({
  desiredPrice: optionalInt(1, 1_000_000, "Bitte geben Sie einen Betrag in Euro ein."),
  plz: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Bitte geben Sie eine 5-stellige Postleitzahl ein."),
  city: requiredText(80, "Bitte geben Sie den Ort ein."),
});

export const leadStep5 = z.object({
  name: requiredText(100, "Bitte geben Sie Ihren Namen ein."),
  phone: z
    .string()
    .trim()
    .transform((v, ctx) => {
      const parsed = parsePhoneNumberFromString(v, "DE");
      if (!parsed?.isValid()) {
        ctx.addIssue({ code: "custom", message: "Bitte geben Sie eine gültige Telefonnummer ein." });
        return z.NEVER;
      }
      return parsed.number; // E.164
    }),
  email: z
    .union([z.email("Bitte geben Sie eine gültige E-Mail-Adresse ein."), z.literal("")])
    .transform((v) => v || null),
  contactMethod: choice(CONTACT_METHOD, "Bitte wählen Sie, wie wir Sie erreichen sollen."),
  consent: z.literal(true, { error: "Bitte stimmen Sie der Datenverarbeitung zu." }),
});

export const leadSchema = leadStep1
  .extend(leadStep2.shape)
  .extend(leadStep4.shape)
  .extend(leadStep5.shape)
  .refine((v) => !(v.email === null && v.contactMethod === "EMAIL"), {
    path: ["email"],
    message: "Bitte geben Sie Ihre E-Mail-Adresse ein, wenn wir Sie per E-Mail kontaktieren sollen.",
    // Run even when other fields (e.g. the consent box) are still invalid, so the
    // seller sees every problem on the last step at once.
    when: ({ issues }) => !issues.some((i) => i.path?.[0] === "email" || i.path?.[0] === "contactMethod"),
  });

/** What the form holds (all strings / booleans). */
export type LeadFormValues = z.input<typeof leadSchema>;
/** What the server works with after parsing. */
export type LeadInput = z.output<typeof leadSchema>;

/** Fields per wizard step, used to validate one step at a time. */
export const STEP_FIELDS = {
  basics: Object.keys(leadStep1.shape),
  condition: Object.keys(leadStep2.shape),
  location: Object.keys(leadStep4.shape),
  contact: Object.keys(leadStep5.shape),
} as const satisfies Record<string, string[]>;

/** Starting values; choice fields stay unset until the seller picks one. */
export const EMPTY_LEAD_FORM = {
  brand: "",
  model: "",
  firstRegYear: "",
  firstRegMonth: "",
  mileageKm: "",
  power: "",
  powerUnit: "PS",
  bodyType: "",
  huDue: "",
  previousOwners: "",
  defects: "",
  desiredPrice: "",
  plz: "",
  city: "",
  name: "",
  phone: "",
  email: "",
} satisfies Partial<LeadFormValues>;

const PS_TO_KW = 0.73549875;

/** Maps parsed form input to what the notification message shows. */
export function toLeadSummary(input: LeadInput): LeadSummary {
  const powerKw =
    input.power === null
      ? null
      : input.powerUnit === "KW"
        ? input.power
        : Math.round(input.power * PS_TO_KW);
  const [huYear, huMonth] = input.huDue ? input.huDue.split("-").map(Number) : [null, null];

  return {
    brand: input.brand,
    model: input.model,
    firstRegYear: input.firstRegYear,
    firstRegMonth: input.firstRegMonth,
    mileageKm: input.mileageKm,
    fuel: input.fuel,
    gearbox: input.gearbox,
    powerKw,
    bodyType: input.bodyType,
    condition: input.condition,
    accident: input.accident,
    drivable: input.drivable === "JA",
    huDueYear: huYear ?? null,
    huDueMonth: huMonth ?? null,
    serviceBook: input.serviceBook,
    previousOwners: input.previousOwners,
    defects: input.defects,
    desiredPriceCents: input.desiredPrice === null ? null : input.desiredPrice * 100,
    plz: input.plz,
    city: input.city,
    name: input.name,
    phone: input.phone,
    email: input.email,
    contactMethod: input.contactMethod,
  };
}
