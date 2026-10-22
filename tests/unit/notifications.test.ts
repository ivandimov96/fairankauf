import { describe, expect, it } from "vitest";

import { formatLeadMessage, formatTemplateParams, leadSubject, type LeadSummary } from "@/lib/notifications/format";

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

describe("formatLeadMessage", () => {
  it("contains every field Ivan needs and a wa.me link to the seller", () => {
    expect(formatLeadMessage(lead)).toBe(
      [
        "🚗 Neue Anfrage: Volkswagen Golf 1.4 TSI",
        "EZ 05/2016 · 123.000 km",
        "Benzin · Manuell · Frontantrieb · 5 Türen · Schwarz · 92 kW",
        "Zustand: Gut · Unfall: Ja, repariert · Fahrbereit: Ja",
        "Preisvorstellung: 9.500\u00a0€",
        "Verkauf: So schnell wie möglich",
        "Ort: 10115 Berlin",
        "",
        "👤 Erika Musterfrau",
        "📞 +49 1511 2345678 (bevorzugt: WhatsApp)",
        "💬 https://wa.me/4915112345678",
      ].join("\n"),
    );
  });

  it("adds the optional details, defects and email when given", () => {
    const msg = formatLeadMessage({
      ...lead,
      bodyType: "Kombi",
      displacement: "1.4",
      interior: "LEDER",
      lights: "LED",
      extras: ["NAVI", "SITZHEIZUNG"],
      huDueYear: 2027,
      huDueMonth: 3,
      serviceBook: "TEILWEISE",
      previousOwners: 2,
      defects: "Kratzer hinten links",
      email: "erika@example.de",
    });
    expect(msg).toContain(
      "Fahrbereit: Ja\nKarosserie: Kombi · Hubraum: 1,4 l · Innen: Leder · Licht: LED · Extras: Navigation, Sitzheizung · HU: 03/2027 · Scheckheft: Teilweise · Vorbesitzer: 2\n",
    );
    expect(msg).toContain("Mängel: Kratzer hinten links\nPreisvorstellung");
    expect(msg).toContain("(bevorzugt: WhatsApp)\n✉️ erika@example.de\n💬");
  });

  it("handles missing optional values", () => {
    const msg = formatLeadMessage(
      { ...lead, firstRegMonth: null, powerKw: null, desiredPriceCents: null, drivable: false },
    );
    expect(msg).toContain("EZ 2016 · 123.000 km");
    expect(msg).toContain("Benzin · Manuell · Frontantrieb · 5 Türen · Schwarz\n");
    expect(msg).toContain("Preisvorstellung: keine Angabe");
    expect(msg).toContain("Fahrbereit: Nein");
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
      "Volkswagen Golf 1.4 TSI",
      "EZ 05/2016 · 123.000 km",
      "Benzin · Manuell · Frontantrieb · 5 Türen · Schwarz · 92 kW",
      "Gut · Unfall: Ja, repariert · Fahrbereit: Ja",
      "–",
      "9.500 €",
      "So schnell wie möglich",
      "10115 Berlin",
      "Erika Musterfrau · +49 1511 2345678 (WhatsApp)",
    ]);
  });

  it("flattens line breaks and long defects, and adds details and email", () => {
    const params = formatTemplateParams({
      ...lead,
      bodyType: "Kombi",
      previousOwners: 2,
      defects: "Kratzer\nhinten    links\t" + "x".repeat(400),
      email: "erika@example.de",
    });
    expect(params[4]!.startsWith("Karosserie: Kombi · Vorbesitzer: 2 · Mängel: Kratzer hinten links xxx")).toBe(true);
    expect(params[4]!.length).toBe(300);
    expect(params[4]!.endsWith("…")).toBe(true);
    expect(params.some((p) => /[\n\t]| {4}/.test(p))).toBe(false);
    expect(params[8]).toBe("Erika Musterfrau · +49 1511 2345678 (WhatsApp) · erika@example.de");
  });
});
