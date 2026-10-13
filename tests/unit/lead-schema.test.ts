import { describe, expect, it } from "vitest";

import { leadSchema, toLeadRow, type LeadFormValues } from "@/lib/validation/lead";

const valid: LeadFormValues = {
  brand: "Volkswagen",
  model: "Golf VII 1.4 TSI",
  firstRegYear: "2016",
  firstRegMonth: "5",
  mileageKm: "123.456",
  fuel: "BENZIN",
  gearbox: "MANUELL",
  power: "150",
  powerUnit: "PS",
  bodyType: "Kombi",
  condition: "GUT",
  accident: "NEIN",
  drivable: "JA",
  huDue: "2027-03",
  serviceBook: "TEILWEISE",
  previousOwners: "2",
  defects: "  Klimaanlage kühlt schwach ",
  desiredPrice: "9500",
  plz: "10115",
  city: "Berlin",
  name: "Max Mustermann",
  phone: "0151 23456789",
  email: "",
  contactMethod: "WHATSAPP",
  consent: true,
};

function errorsFor(values: Partial<LeadFormValues>) {
  const result = leadSchema.safeParse({ ...valid, ...values });
  return result.success ? {} : Object.fromEntries(result.error.issues.map((i) => [i.path[0], i.message]));
}

describe("leadSchema", () => {
  it("parses a complete form into typed values", () => {
    const out = leadSchema.parse(valid);
    expect(out).toMatchObject({
      firstRegYear: 2016,
      firstRegMonth: 5,
      mileageKm: 123456,
      power: 150,
      previousOwners: 2,
      desiredPrice: 9500,
      phone: "+4915123456789",
      email: null,
      defects: "Klimaanlage kühlt schwach",
      consent: true,
    });
  });

  it("treats empty optional fields as null", () => {
    const out = leadSchema.parse({
      ...valid,
      firstRegMonth: "",
      power: "",
      bodyType: "",
      huDue: "",
      defects: "",
      desiredPrice: "",
    });
    expect(out).toMatchObject({
      firstRegMonth: null,
      power: null,
      bodyType: null,
      huDue: null,
      defects: null,
      desiredPrice: null,
    });
  });

  it("accepts international phone numbers and normalizes to E.164", () => {
    expect(leadSchema.parse({ ...valid, phone: "+43 664 1234567" }).phone).toBe("+436641234567");
    expect(leadSchema.parse({ ...valid, phone: "0049 30 1234567" }).phone).toBe("+49301234567");
  });

  it.each([
    [{ phone: "123" }, "phone"],
    [{ phone: "Telefon" }, "phone"],
    [{ plz: "1011" }, "plz"],
    [{ plz: "ABCDE" }, "plz"],
    [{ firstRegYear: "1890" }, "firstRegYear"],
    [{ firstRegYear: String(new Date().getFullYear() + 1) }, "firstRegYear"],
    [{ firstRegMonth: "13" }, "firstRegMonth"],
    [{ mileageKm: "-5" }, "mileageKm"],
    [{ mileageKm: "viel" }, "mileageKm"],
    [{ huDue: "2027-13" }, "huDue"],
    [{ brand: "  " }, "brand"],
    [{ fuel: "KOHLE" as never }, "fuel"],
    [{ consent: false as never }, "consent"],
    [{ email: "keine-mail" }, "email"],
  ])("rejects %o", (values, field) => {
    expect(errorsFor(values)).toHaveProperty(field);
  });

  it("requires an email address when contact by email is chosen", () => {
    expect(errorsFor({ contactMethod: "EMAIL", email: "" })).toHaveProperty("email");
    expect(errorsFor({ contactMethod: "EMAIL", email: "max@example.de" })).toEqual({});
  });

  it("shows German error messages", () => {
    expect(errorsFor({ plz: "1" }).plz).toBe("Bitte geben Sie eine 5-stellige Postleitzahl ein.");
  });
});

describe("toLeadRow", () => {
  const now = new Date("2026-10-13T12:00:00Z");

  it("converts PS to kW, euros to cents and splits the HU date", () => {
    const row = toLeadRow(leadSchema.parse(valid), now);
    expect(row).toMatchObject({
      powerKw: 110,
      desiredPriceCents: 950_000,
      huDueYear: 2027,
      huDueMonth: 3,
      drivable: true,
      consentAt: now,
    });
  });

  it("keeps kW as entered and leaves optional values null", () => {
    const row = toLeadRow(
      leadSchema.parse({ ...valid, power: "85", powerUnit: "KW", huDue: "", desiredPrice: "", drivable: "NEIN" }),
      now,
    );
    expect(row).toMatchObject({
      powerKw: 85,
      huDueYear: null,
      huDueMonth: null,
      desiredPriceCents: null,
      drivable: false,
    });
  });
});
