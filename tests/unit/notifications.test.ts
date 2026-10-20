import { describe, expect, it } from "vitest";

import { formatLeadMessage, type LeadSummary } from "@/lib/notifications/format";

const lead: LeadSummary = {
  brand: "Volkswagen",
  model: "Golf 1.4 TSI",
  firstRegYear: 2016,
  firstRegMonth: 5,
  mileageKm: 123000,
  fuel: "BENZIN",
  gearbox: "MANUELL",
  drivetrain: "FRONT",
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
        "Benzin · Manuell · Frontantrieb · 92 kW",
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
      huDueYear: 2027,
      huDueMonth: 3,
      serviceBook: "TEILWEISE",
      previousOwners: 2,
      defects: "Kratzer hinten links",
      email: "erika@example.de",
    });
    expect(msg).toContain("Fahrbereit: Ja\nKarosserie: Kombi · HU: 03/2027 · Scheckheft: Teilweise · Vorbesitzer: 2\n");
    expect(msg).toContain("Mängel: Kratzer hinten links\nPreisvorstellung");
    expect(msg).toContain("(bevorzugt: WhatsApp)\n✉️ erika@example.de\n💬");
  });

  it("handles missing optional values", () => {
    const msg = formatLeadMessage(
      { ...lead, firstRegMonth: null, powerKw: null, desiredPriceCents: null, drivable: false },
    );
    expect(msg).toContain("EZ 2016 · 123.000 km");
    expect(msg).toContain("Benzin · Manuell · Frontantrieb\n");
    expect(msg).toContain("Preisvorstellung: keine Angabe");
    expect(msg).toContain("Fahrbereit: Nein");
  });
});
