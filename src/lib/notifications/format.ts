import { formatEuro, formatNumber } from "@/lib/money";
import {
  ACCIDENT,
  CONDITION,
  CONTACT_METHOD,
  DRIVETRAIN,
  FUEL,
  GEARBOX,
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
  powerKw: number | null;
  bodyType?: string | null;
  condition: keyof typeof CONDITION;
  accident: keyof typeof ACCIDENT;
  drivable: boolean;
  huDueYear?: number | null;
  huDueMonth?: number | null;
  serviceBook?: keyof typeof SERVICE_BOOK;
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

/** "Karosserie: Kombi · HU: 03/2027 · Scheckheft: Ja · Vorbesitzer: 2", or "" when none is set. */
function details(lead: LeadSummary) {
  const parts: string[] = [];
  if (lead.bodyType) parts.push(`Karosserie: ${lead.bodyType}`);
  if (lead.huDueYear && lead.huDueMonth) parts.push(`HU: ${String(lead.huDueMonth).padStart(2, "0")}/${lead.huDueYear}`);
  if (lead.serviceBook) parts.push(`Scheckheft: ${SERVICE_BOOK[lead.serviceBook]}`);
  if (lead.previousOwners !== undefined) parts.push(`Vorbesitzer: ${lead.previousOwners}`);
  return parts.join(" · ");
}

function price(lead: LeadSummary) {
  return lead.desiredPriceCents === null ? "keine Angabe" : formatEuro(lead.desiredPriceCents);
}

/** The full lead as plain text, one field per line. */
export function formatLeadMessage(lead: LeadSummary): string {
  const power = lead.powerKw ? ` · ${lead.powerKw} kW` : "";
  const car = [
    `🚗 Neue Anfrage: ${lead.brand} ${lead.model}`,
    `EZ ${firstReg(lead)} · ${formatNumber(lead.mileageKm)} km`,
    `${FUEL[lead.fuel]} · ${GEARBOX[lead.gearbox]} · ${DRIVETRAIN[lead.drivetrain]}${power}`,
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
