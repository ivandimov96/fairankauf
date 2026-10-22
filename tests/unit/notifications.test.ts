import { describe, expect, it } from "vitest";

import {
  formatLeadHtml,
  formatLeadMessage,
  formatTemplateParams,
  leadSubject,
  type LeadSummary,
} from "@/lib/notifications/format";

const lead: LeadSummary = {
  brand: "Volkswagen",
  model: "Golf 1.4 TSI",
  firstRegYear: 2016,
  firstRegMonth: 5,
  mileageKm: 123000,
  fuel: "BENZIN",
  gearbox: "MANUELL",
  drivetrain: "FRONT",
  doors: "5",
  color: "SCHWARZ",
  powerKw: 92,
  condition: "GUT",
  interiorCondition: "GUT",
  accident: "JA_REPARIERT",
  drivable: true,
  sellTiming: "SOFORT",
  desiredPriceCents: 950_000,
  plz: "10115",
  city: "Berlin",
  name: "Erika Musterfrau",
  phone: "+4915112345678",
  contactMethod: "WHATSAPP",
};

const detailed: LeadSummary = {
  ...lead,
  bodyType: "Kombi",
  displacement: "1.4",
  interior: "LEDER",
  lights: "BI_XENON",
  extras: ["NAVI", "SITZHEIZUNG"],
  huDueYear: 2027,
  huDueMonth: 3,
  serviceBook: "TEILWEISE",
  previousOwners: 2,
  defects: "Kratzer hinten links",
  notes: "Anhängerkupplung, neue Reifen",
  email: "erika@example.de",
};

describe("formatLeadMessage", () => {
  it("lists the contact first, then the car in sections, every field on its own line", () => {
    expect(formatLeadMessage(lead)).toBe(
      [
        "🚗 Neue Anfrage: Volkswagen Golf 1.4 TSI",
        "",
        "KONTAKT",
        "Name: Erika Musterfrau",
        "Telefon: +49 1511 2345678",
        "E-Mail: –",
        "Kontakt per: WhatsApp",
        "WhatsApp-Chat: https://wa.me/4915112345678",
        "",
        "FAHRZEUG",
        "Marke / Modell: Volkswagen Golf 1.4 TSI",
        "Erstzulassung: 05/2016",
        "Kilometerstand: 123.000 km",
        "Karosserie: –",
        "Türen: 5",
        "Farbe: Schwarz",
        "",
        "MOTOR",
        "Kraftstoff: Benzin",
        "Getriebe: Manuell",
        "Antrieb: Frontantrieb",
        "Leistung: 92 kW",
        "Hubraum: –",
        "",
        "ZUSTAND",
        "Allgemein: Gut",
        "Innenraum: Gut",
        "Unfallschaden: Ja, repariert",
        "Fahrbereit: Ja",
        "Nächste HU: –",
        "Scheckheft: –",
        "Vorbesitzer: –",
        "Mängel: –",
        "",
        "AUSSTATTUNG",
        "Polster: –",
        "Scheinwerfer: –",
        "Extras: –",
        "Sonstiges: –",
        "",
        "VERKAUF",
        "Preisvorstellung: 9.500 €",
        "Zeitpunkt: So schnell wie möglich",
        "Standort: 10115 Berlin",
      ].join("\n"),
    );
  });

  it("fills in the optional details, defects, notes and email when given", () => {
    const msg = formatLeadMessage(detailed);
    expect(msg).toContain("E-Mail: erika@example.de\n");
    expect(msg).toContain("Karosserie: Kombi\n");
    expect(msg).toContain("Hubraum: 1,4 l\n");
    expect(msg).toContain("Nächste HU: 03/2027\nScheckheft: Teilweise\nVorbesitzer: 2\nMängel: Kratzer hinten links\n");
    expect(msg).toContain(
      "Polster: Leder\nScheinwerfer: Bi-Xenon\nExtras: Navigation, Sitzheizung\nSonstiges: Anhängerkupplung, neue Reifen\n",
    );
  });

  it("handles missing optional values", () => {
    const msg = formatLeadMessage({
      ...lead,
      firstRegMonth: null,
      powerKw: null,
      desiredPriceCents: null,
      drivable: false,
    });
    expect(msg).toContain("Erstzulassung: 2016\n");
    expect(msg).toContain("Leistung: –\n");
    expect(msg).toContain("Preisvorstellung: keine Angabe");
    expect(msg).toContain("Fahrbereit: Nein");
  });
});

describe("formatLeadHtml", () => {
  it("renders the sections with tap-to-call and WhatsApp links, escaping seller input", () => {
    const html = formatLeadHtml({ ...detailed, model: "Golf <R>", defects: "Tom & Jerry" });
    expect(html).toContain('href="tel:+4915112345678"');
    expect(html).toContain('href="https://wa.me/4915112345678"');
    expect(html).toContain('href="mailto:erika@example.de"');
    expect(html).toContain("Volkswagen Golf &lt;R&gt;");
    expect(html).toContain("Tom &amp; Jerry");
    expect(html).not.toContain("<R>");
    for (const title of ["Kontakt", "Fahrzeug", "Motor", "Zustand", "Ausstattung", "Verkauf"]) {
      expect(html).toContain(`>${title}</h2>`);
    }
    expect(html).toContain("Innenraum</td>");
    expect(html).toContain("Bi-Xenon</td>");
  });

  it("leaves the email button out when the seller gave no email", () => {
    const html = formatLeadHtml(lead);
    expect(html).not.toContain("mailto:");
    expect(html).toContain("E-Mail</td>");
  });
});

describe("leadSubject", () => {
  it("names car, year and mileage", () => {
    expect(leadSubject(lead)).toBe("Neue Anfrage: Volkswagen Golf 1.4 TSI, EZ 2016, 123.000 km");
  });
});

describe("formatTemplateParams", () => {
  it("gives one single-line parameter per template line, none empty", () => {
    expect(formatTemplateParams(lead)).toEqual([
      "Volkswagen Golf 1.4 TSI · 5 Türen · Schwarz",
      "EZ 05/2016 · 123.000 km",
      "Benzin · Manuell · Frontantrieb · 92 kW",
      "Allgemein: Gut · Innenraum: Gut · Unfall: Ja, repariert · Fahrbereit: Ja",
      "–",
      "9.500 €",
      "So schnell wie möglich",
      "10115 Berlin",
      "Erika Musterfrau · +49 1511 2345678 (WhatsApp)",
    ]);
  });

  it("groups the details by template line", () => {
    const params = formatTemplateParams(detailed);
    expect(params[0]).toBe("Volkswagen Golf 1.4 TSI · Kombi · 5 Türen · Schwarz");
    expect(params[2]).toBe("Benzin · Manuell · Frontantrieb · 92 kW · 1,4 l");
    expect(params[3]).toBe(
      "Allgemein: Gut · Innenraum: Gut · Unfall: Ja, repariert · Fahrbereit: Ja · HU: 03/2027 · Scheckheft: Teilweise · Vorbesitzer: 2 · Mängel: Kratzer hinten links",
    );
    expect(params[4]).toBe(
      "Polster: Leder · Scheinwerfer: Bi-Xenon · Extras: Navigation, Sitzheizung · Sonstiges: Anhängerkupplung, neue Reifen",
    );
    expect(params[8]).toBe("Erika Musterfrau · +49 1511 2345678 (WhatsApp) · erika@example.de");
  });

  it("flattens line breaks and truncates long defects", () => {
    const params = formatTemplateParams({
      ...lead,
      previousOwners: 2,
      defects: "Kratzer\nhinten    links\t" + "x".repeat(400),
    });
    expect(
      params[3]!.startsWith(
        "Allgemein: Gut · Innenraum: Gut · Unfall: Ja, repariert · Fahrbereit: Ja · Vorbesitzer: 2 · Mängel: Kratzer hinten links xxx",
      ),
    ).toBe(true);
    expect(params[3]!.length).toBe(300);
    expect(params[3]!.endsWith("…")).toBe(true);
    expect(params.some((p) => /[\n\t]| {4}/.test(p))).toBe(false);
  });
});
