import { formatEuro, formatNumber } from "@/lib/money";
import { ACCIDENT, CONDITION, CONTACT_METHOD, FUEL, GEARBOX, SERVICE_BOOK, YES_NO } from "@/lib/options";
import { formatPhone, waMeLink } from "@/lib/phone";

/**
 * Everything the seller entered. WhatsApp is the only record of a lead (there is
 * no database), so the message must carry all of it. Optional fields are left out
 * of the message when empty.
 */
export type LeadSummary = {
  brand: string;
  model: string;
  firstRegYear: number;
  firstRegMonth: number | null;
  mileageKm: number;
  fuel: keyof typeof FUEL;
  gearbox: keyof typeof GEARBOX;
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

/**
 * Plain-text WhatsApp message (console + CallMeBot). WhatsApp renders *bold*.
 */
export function formatLeadMessage(lead: LeadSummary): string {
  const power = lead.powerKw ? ` · ${lead.powerKw} kW` : "";
  const car = [
    `🚗 *Neue Anfrage: ${lead.brand} ${lead.model}*`,
    `EZ ${firstReg(lead)} · ${formatNumber(lead.mileageKm)} km`,
    `${FUEL[lead.fuel]} · ${GEARBOX[lead.gearbox]}${power}`,
    `Zustand: ${CONDITION[lead.condition]} · Unfall: ${ACCIDENT[lead.accident]} · Fahrbereit: ${lead.drivable ? YES_NO.JA : YES_NO.NEIN}`,
    details(lead),
    lead.defects ? `Mängel: ${lead.defects}` : "",
    `Preisvorstellung: ${price(lead)}`,
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

/**
 * Body parameters for the approved `new_car_lead` template (WhatsApp Cloud API),
 * in the order of {{1}}…{{9}}. Meta rejects parameters containing newlines,
 * tabs or more than 4 spaces in a row, so every value is single-line.
 * Template text: docs/whatsapp-setup.md.
 */
export function formatTemplateParams(lead: LeadSummary): string[] {
  const oneLine = (s: string) => s.replace(/\s+/g, " ").trim();
  const power = lead.powerKw ? `, ${lead.powerKw} kW` : "";
  return [
    oneLine(`${lead.brand} ${lead.model}`),
    `${firstReg(lead)}, ${formatNumber(lead.mileageKm)} km`,
    `${FUEL[lead.fuel]}, ${GEARBOX[lead.gearbox]}${power}`,
    `${CONDITION[lead.condition]}, Unfall: ${ACCIDENT[lead.accident]}, fahrbereit: ${lead.drivable ? "ja" : "nein"}`,
    price(lead),
    oneLine(`${lead.plz} ${lead.city}`),
    oneLine(lead.name),
    `${formatPhone(lead.phone)} (bevorzugt: ${CONTACT_METHOD[lead.contactMethod]})`,
    waMeLink(lead.phone),
  ];
}
