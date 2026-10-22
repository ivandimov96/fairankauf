import { formatEuro, formatNumber } from "@/lib/money";
import {
  ACCIDENT,
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
  SELL_TIMING,
  SERVICE_BOOK,
  YES_NO,
} from "@/lib/options";
import { formatPhone, waMeLink } from "@/lib/phone";

/**
 * Everything the seller entered. The message is the only record of a lead (there
 * is no database), so it must carry all of it. Optional fields are left out when empty.
 */
export type LeadSummary = {
  brand: string;
  model: string;
  firstRegYear: number;
  firstRegMonth: number | null;
  mileageKm: number;
  fuel: keyof typeof FUEL;
  gearbox: keyof typeof GEARBOX;
  drivetrain: keyof typeof DRIVETRAIN;
  doors: keyof typeof DOORS;
  color: keyof typeof COLORS;
  powerKw: number | null;
  displacement?: keyof typeof DISPLACEMENT | null;
  bodyType?: string | null;
  condition: keyof typeof CONDITION;
  accident: keyof typeof ACCIDENT;
  drivable: boolean;
  huDueYear?: number | null;
  huDueMonth?: number | null;
  serviceBook?: keyof typeof SERVICE_BOOK;
  interior?: keyof typeof INTERIOR;
  lights?: keyof typeof LIGHTS | null;
  extras?: (keyof typeof EXTRAS)[];
  previousOwners?: number;
  defects?: string | null;
  sellTiming: keyof typeof SELL_TIMING;
  desiredPriceCents: number | null;
  plz: string;
  city: string;
  name: string;
  phone: string;
  email?: string | null;
  contactMethod: keyof typeof CONTACT_METHOD;
};

function firstReg(lead: LeadSummary) {
  return lead.firstRegMonth
    ? `${String(lead.firstRegMonth).padStart(2, "0")}/${lead.firstRegYear}`
    : String(lead.firstRegYear);
}

/** "Karosserie: Kombi · Innen: Leder · HU: 03/2027 · …", or "" when none is set. */
function details(lead: LeadSummary) {
  const parts: string[] = [];
  if (lead.bodyType) parts.push(`Karosserie: ${lead.bodyType}`);
  if (lead.displacement) parts.push(`Hubraum: ${DISPLACEMENT[lead.displacement]}`);
  if (lead.interior) parts.push(`Innen: ${INTERIOR[lead.interior]}`);
  if (lead.lights) parts.push(`Licht: ${LIGHTS[lead.lights]}`);
  if (lead.extras?.length) parts.push(`Extras: ${lead.extras.map((e) => EXTRAS[e]).join(", ")}`);
  if (lead.huDueYear && lead.huDueMonth) parts.push(`HU: ${String(lead.huDueMonth).padStart(2, "0")}/${lead.huDueYear}`);
  if (lead.serviceBook) parts.push(`Scheckheft: ${SERVICE_BOOK[lead.serviceBook]}`);
  if (lead.previousOwners !== undefined) parts.push(`Vorbesitzer: ${lead.previousOwners}`);
  return parts.join(" · ");
}

function price(lead: LeadSummary) {
  return lead.desiredPriceCents === null ? "keine Angabe" : formatEuro(lead.desiredPriceCents);
}

/** Email subject: "Neue Anfrage: Volkswagen Golf 1.4 TSI, EZ 2016, 123.000 km". */
export function leadSubject(lead: LeadSummary): string {
  return `Neue Anfrage: ${lead.brand} ${lead.model}, EZ ${lead.firstRegYear}, ${formatNumber(lead.mileageKm)} km`;
}

/**
 * The lead as WhatsApp template parameters, one per line of the template body
 * (docs/DEPLOY.md has the body). Meta rejects parameters with line breaks, tabs,
 * four or more spaces in a row, or no text at all, so each one is a single
 * trimmed line and "–" when there is nothing to say.
 */
/** "Benzin · Manuell · Frontantrieb · 5 Türen · Schwarz · 92 kW" */
function engine(lead: LeadSummary) {
  const power = lead.powerKw ? ` · ${lead.powerKw} kW` : "";
  return `${FUEL[lead.fuel]} · ${GEARBOX[lead.gearbox]} · ${DRIVETRAIN[lead.drivetrain]} · ${DOORS[lead.doors]} Türen · ${COLORS[lead.color]}${power}`;
}

export function formatTemplateParams(lead: LeadSummary): string[] {
  const extras = [details(lead), lead.defects ? `Mängel: ${lead.defects}` : ""].filter(Boolean).join(" · ");
  const contact = [
    lead.name,
    `${formatPhone(lead.phone)} (${CONTACT_METHOD[lead.contactMethod]})`,
    lead.email ?? "",
  ].filter(Boolean);
  return [
    `${lead.brand} ${lead.model}`,
    `EZ ${firstReg(lead)} · ${formatNumber(lead.mileageKm)} km`,
    engine(lead),
    `${CONDITION[lead.condition]} · Unfall: ${ACCIDENT[lead.accident]} · Fahrbereit: ${lead.drivable ? YES_NO.JA : YES_NO.NEIN}`,
    extras,
    price(lead),
    SELL_TIMING[lead.sellTiming],
    `${lead.plz} ${lead.city}`,
    contact.join(" · "),
  ].map(templateParam);
}

const PARAM_MAX = 300;

function templateParam(value: string): string {
  const oneLine = value.replace(/\s+/g, " ").trim();
  if (!oneLine) return "–";
  return oneLine.length > PARAM_MAX ? `${oneLine.slice(0, PARAM_MAX - 1)}…` : oneLine;
}

/** The full lead as plain text, one field per line. */
export function formatLeadMessage(lead: LeadSummary): string {
  const car = [
    `🚗 Neue Anfrage: ${lead.brand} ${lead.model}`,
    `EZ ${firstReg(lead)} · ${formatNumber(lead.mileageKm)} km`,
    engine(lead),
    `Zustand: ${CONDITION[lead.condition]} · Unfall: ${ACCIDENT[lead.accident]} · Fahrbereit: ${lead.drivable ? YES_NO.JA : YES_NO.NEIN}`,
    details(lead),
    lead.defects ? `Mängel: ${lead.defects}` : "",
    `Preisvorstellung: ${price(lead)}`,
    `Verkauf: ${SELL_TIMING[lead.sellTiming]}`,
    `Ort: ${lead.plz} ${lead.city}`,
  ];
  const seller = [
    `👤 ${lead.name}`,
    `📞 ${formatPhone(lead.phone)} (bevorzugt: ${CONTACT_METHOD[lead.contactMethod]})`,
    lead.email ? `✉️ ${lead.email}` : "",
    `💬 ${waMeLink(lead.phone)}`,
  ];
  const lines = (xs: string[]) => xs.filter(Boolean).join("\n");
  return `${lines(car)}\n\n${lines(seller)}`;
}
