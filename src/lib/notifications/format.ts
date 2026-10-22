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
 * is no database), so it must carry all of it. The email lists every field in
 * fixed sections ("–" when empty); the WhatsApp template leaves empty ones out.
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
  interiorCondition: keyof typeof CONDITION;
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
  notes?: string | null;
  sellTiming: keyof typeof SELL_TIMING;
  desiredPriceCents: number | null;
  plz: string;
  city: string;
  name: string;
  phone: string;
  email?: string | null;
  contactMethod: keyof typeof CONTACT_METHOD;
};

const NONE = "–";

type Row = [label: string, value: string];
type Section = { title: string; rows: Row[] };

function firstReg(lead: LeadSummary) {
  return lead.firstRegMonth
    ? `${String(lead.firstRegMonth).padStart(2, "0")}/${lead.firstRegYear}`
    : String(lead.firstRegYear);
}

function huDue(lead: LeadSummary) {
  return lead.huDueYear && lead.huDueMonth ? `${String(lead.huDueMonth).padStart(2, "0")}/${lead.huDueYear}` : "";
}

function price(lead: LeadSummary) {
  return lead.desiredPriceCents === null ? "keine Angabe" : formatEuro(lead.desiredPriceCents);
}

const yesNo = (b: boolean) => (b ? YES_NO.JA : YES_NO.NEIN);
const or = (v: string | null | undefined) => v || NONE;

/** The car, grouped the way Ivan reads it. Every field is listed, empty ones as "–". */
function carSections(lead: LeadSummary): Section[] {
  return [
    {
      title: "Fahrzeug",
      rows: [
        ["Marke / Modell", `${lead.brand} ${lead.model}`],
        ["Erstzulassung", firstReg(lead)],
        ["Kilometerstand", `${formatNumber(lead.mileageKm)} km`],
        ["Karosserie", or(lead.bodyType)],
        ["Türen", DOORS[lead.doors]],
        ["Farbe", COLORS[lead.color]],
      ],
    },
    {
      title: "Motor",
      rows: [
        ["Kraftstoff", FUEL[lead.fuel]],
        ["Getriebe", GEARBOX[lead.gearbox]],
        ["Antrieb", DRIVETRAIN[lead.drivetrain]],
        ["Leistung", lead.powerKw ? `${lead.powerKw} kW` : NONE],
        ["Hubraum", lead.displacement ? DISPLACEMENT[lead.displacement] : NONE],
      ],
    },
    {
      title: "Zustand",
      rows: [
        ["Allgemein", CONDITION[lead.condition]],
        ["Innenraum", CONDITION[lead.interiorCondition]],
        ["Unfallschaden", ACCIDENT[lead.accident]],
        ["Fahrbereit", yesNo(lead.drivable)],
        ["Nächste HU", or(huDue(lead))],
        ["Scheckheft", lead.serviceBook ? SERVICE_BOOK[lead.serviceBook] : NONE],
        ["Vorbesitzer", lead.previousOwners === undefined ? NONE : String(lead.previousOwners)],
        ["Mängel", or(lead.defects)],
      ],
    },
    {
      title: "Ausstattung",
      rows: [
        ["Polster", lead.interior ? INTERIOR[lead.interior] : NONE],
        ["Scheinwerfer", lead.lights ? LIGHTS[lead.lights] : NONE],
        ["Extras", lead.extras?.length ? lead.extras.map((e) => EXTRAS[e]).join(", ") : NONE],
        ["Sonstiges", or(lead.notes)],
      ],
    },
    {
      title: "Verkauf",
      rows: [
        ["Preisvorstellung", price(lead)],
        ["Zeitpunkt", SELL_TIMING[lead.sellTiming]],
        ["Standort", `${lead.plz} ${lead.city}`],
      ],
    },
  ];
}

function contactSection(lead: LeadSummary): Section {
  return {
    title: "Kontakt",
    rows: [
      ["Name", lead.name],
      ["Telefon", formatPhone(lead.phone)],
      ["E-Mail", or(lead.email)],
      ["Kontakt per", CONTACT_METHOD[lead.contactMethod]],
      ["WhatsApp-Chat", waMeLink(lead.phone)],
    ],
  };
}

/** Email subject: "Neue Anfrage: Volkswagen Golf 1.4 TSI, EZ 2016, 123.000 km". */
export function leadSubject(lead: LeadSummary): string {
  return `Neue Anfrage: ${lead.brand} ${lead.model}, EZ ${lead.firstRegYear}, ${formatNumber(lead.mileageKm)} km`;
}

/** The full lead as plain text: the contact first, then the car in sections, one field per line. */
export function formatLeadMessage(lead: LeadSummary): string {
  const sections = [contactSection(lead), ...carSections(lead)];
  const blocks = sections.map(
    (s) => `${s.title.toUpperCase()}\n${s.rows.map(([label, value]) => `${label}: ${value}`).join("\n")}`,
  );
  return [`🚗 Neue Anfrage: ${lead.brand} ${lead.model}`, ...blocks].join("\n\n");
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const FONT = "font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const BUTTON =
  "display:inline-block;margin:0 8px 8px 0;padding:10px 16px;border-radius:8px;background:#d7161b;color:#ffffff;font-weight:600;text-decoration:none";

/**
 * The same lead as an HTML email: a dark header with the car, tap-to-call and
 * WhatsApp buttons, then one small table per section. Inline styles only, since
 * mail apps drop stylesheets. Everything the seller typed is escaped.
 */
export function formatLeadHtml(lead: LeadSummary): string {
  const table = (s: Section) =>
    `<h2 style="margin:24px 0 8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b6f76">${esc(s.title)}</h2>` +
    `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:15px">` +
    s.rows
      .map(
        ([label, value]) =>
          `<tr><td style="width:140px;padding:6px 12px 6px 0;color:#6b6f76;white-space:nowrap;vertical-align:top;border-top:1px solid #ececee">${esc(label)}</td>` +
          `<td style="padding:6px 0;vertical-align:top;border-top:1px solid #ececee">${esc(value)}</td></tr>`,
      )
      .join("") +
    `</table>`;
  const contact = contactSection(lead);
  contact.rows = contact.rows.filter(([label]) => label !== "WhatsApp-Chat");
  const buttons = [
    `<a href="tel:${esc(lead.phone)}" style="${BUTTON}">Anrufen</a>`,
    `<a href="${esc(waMeLink(lead.phone))}" style="${BUTTON}">WhatsApp</a>`,
    lead.email ? `<a href="mailto:${esc(lead.email)}" style="${BUTTON};background:#1b1c1f">E-Mail</a>` : "",
  ].join("");
  return (
    `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(leadSubject(lead))}</title></head><body style="margin:0;padding:24px 12px;background:#f4f4f5;color:#1b1c1f;${FONT}">` +
    `<div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;overflow:hidden">` +
    `<div style="padding:20px 24px;background:#1b1c1f;color:#ffffff">` +
    `<div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#b8babf">Neue Anfrage</div>` +
    `<div style="margin-top:4px;font-size:22px;font-weight:700">${esc(`${lead.brand} ${lead.model}`)}</div>` +
    `<div style="margin-top:4px;font-size:14px;color:#b8babf">${esc(`EZ ${firstReg(lead)} · ${formatNumber(lead.mileageKm)} km · ${price(lead)}`)}</div>` +
    `</div>` +
    `<div style="padding:4px 24px 24px">` +
    table(contact) +
    `<div style="margin-top:16px">${buttons}</div>` +
    carSections(lead).map(table).join("") +
    `</div></div></body></html>`
  );
}

/**
 * The lead as WhatsApp template parameters, one per line of the template body
 * (docs/DEPLOY.md has the body). Meta rejects parameters with line breaks, tabs,
 * four or more spaces in a row, or no text at all, so each one is a single
 * trimmed line and "–" when there is nothing to say. Empty optional fields are
 * left out here to keep the lines short.
 */
export function formatTemplateParams(lead: LeadSummary): string[] {
  const join = (parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" · ");
  const contact = [
    lead.name,
    `${formatPhone(lead.phone)} (${CONTACT_METHOD[lead.contactMethod]})`,
    lead.email ?? "",
  ];
  return [
    join([`${lead.brand} ${lead.model}`, lead.bodyType, `${DOORS[lead.doors]} Türen`, COLORS[lead.color]]),
    `EZ ${firstReg(lead)} · ${formatNumber(lead.mileageKm)} km`,
    join([
      FUEL[lead.fuel],
      GEARBOX[lead.gearbox],
      DRIVETRAIN[lead.drivetrain],
      lead.powerKw ? `${lead.powerKw} kW` : "",
      lead.displacement ? DISPLACEMENT[lead.displacement] : "",
    ]),
    join([
      `Allgemein: ${CONDITION[lead.condition]}`,
      `Innenraum: ${CONDITION[lead.interiorCondition]}`,
      `Unfall: ${ACCIDENT[lead.accident]}`,
      `Fahrbereit: ${yesNo(lead.drivable)}`,
      huDue(lead) && `HU: ${huDue(lead)}`,
      lead.serviceBook && `Scheckheft: ${SERVICE_BOOK[lead.serviceBook]}`,
      lead.previousOwners !== undefined && `Vorbesitzer: ${lead.previousOwners}`,
      lead.defects && `Mängel: ${lead.defects}`,
    ]),
    join([
      lead.interior && `Polster: ${INTERIOR[lead.interior]}`,
      lead.lights && `Scheinwerfer: ${LIGHTS[lead.lights]}`,
      lead.extras?.length ? `Extras: ${lead.extras.map((e) => EXTRAS[e]).join(", ")}` : "",
      lead.notes && `Sonstiges: ${lead.notes}`,
    ]),
    price(lead),
    SELL_TIMING[lead.sellTiming],
    `${lead.plz} ${lead.city}`,
    join(contact),
  ].map(templateParam);
}

const PARAM_MAX = 300;

function templateParam(value: string): string {
  const oneLine = value.replace(/\s+/g, " ").trim();
  if (!oneLine) return NONE;
  return oneLine.length > PARAM_MAX ? `${oneLine.slice(0, PARAM_MAX - 1)}…` : oneLine;
}
