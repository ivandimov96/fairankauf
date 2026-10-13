import { formatEuro, formatNumber } from "@/lib/money";
import { ACCIDENT, CONDITION, CONTACT_METHOD, FUEL, GEARBOX, YES_NO } from "@/lib/options";
import { formatPhone, waMeLink } from "@/lib/phone";

/** The lead fields the notification needs (a subset of the `leads` row). */
export type LeadSummary = {
  id: string;
  brand: string;
  model: string;
  firstRegYear: number;
  firstRegMonth: number | null;
  mileageKm: number;
  fuel: keyof typeof FUEL;
  gearbox: keyof typeof GEARBOX;
  powerKw: number | null;
  condition: keyof typeof CONDITION;
  accident: keyof typeof ACCIDENT;
  drivable: boolean;
  desiredPriceCents: number | null;
  plz: string;
  city: string;
  name: string;
  phone: string;
  contactMethod: keyof typeof CONTACT_METHOD;
};

export function adminLeadUrl(appUrl: string, leadId: string) {
  return `${appUrl.replace(/\/$/, "")}/admin/leads/${leadId}`;
}

function firstReg(lead: LeadSummary) {
  return lead.firstRegMonth
    ? `${String(lead.firstRegMonth).padStart(2, "0")}/${lead.firstRegYear}`
    : String(lead.firstRegYear);
}

function price(lead: LeadSummary) {
  return lead.desiredPriceCents === null ? "keine Angabe" : formatEuro(lead.desiredPriceCents);
}

/**
 * Plain-text WhatsApp message (console + CallMeBot). WhatsApp renders *bold*.
 */
export function formatLeadMessage(lead: LeadSummary, appUrl: string): string {
  const power = lead.powerKw ? ` · ${lead.powerKw} kW` : "";
  return [
    `🚗 *Neue Anfrage: ${lead.brand} ${lead.model}*`,
    `EZ ${firstReg(lead)} · ${formatNumber(lead.mileageKm)} km`,
    `${FUEL[lead.fuel]} · ${GEARBOX[lead.gearbox]}${power}`,
    `Zustand: ${CONDITION[lead.condition]} · Unfall: ${ACCIDENT[lead.accident]} · Fahrbereit: ${lead.drivable ? YES_NO.JA : YES_NO.NEIN}`,
    `Preisvorstellung: ${price(lead)}`,
    `Ort: ${lead.plz} ${lead.city}`,
    "",
    `👤 ${lead.name}`,
    `📞 ${formatPhone(lead.phone)} (bevorzugt: ${CONTACT_METHOD[lead.contactMethod]})`,
    `💬 ${waMeLink(lead.phone)}`,
    "",
    `🔗 ${adminLeadUrl(appUrl, lead.id)}`,
  ].join("\n");
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
