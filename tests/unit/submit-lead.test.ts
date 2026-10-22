import { beforeEach, describe, expect, it, vi } from "vitest";

import type { LeadFormValues } from "@/lib/validation/lead";

const send = vi.fn();
let ip = "1.2.3.4";

vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-forwarded-for": ip }) }));
vi.mock("@/lib/notifications", () => ({ sendLeadNotification: (...args: unknown[]) => send(...args) }));

const { submitLead } = await import("@/server/actions/submit-lead");

const valid: LeadFormValues = {
  brand: "Volkswagen",
  model: "Golf",
  firstRegYear: "2016",
  firstRegMonth: "",
  mileageKm: "123000",
  fuel: "BENZIN",
  gearbox: "MANUELL",
  drivetrain: "FRONT",
  doors: "5",
  color: "GRAU",
  power: "",
  powerUnit: "PS",
  displacement: "",
  bodyType: "",
  condition: "GUT",
  accident: "NEIN",
  drivable: "JA",
  huDue: "",
  serviceBook: "JA",
  interior: "STOFF",
  lights: "",
  previousOwners: "1",
  defects: "",
  sellTiming: "SOFORT",
  desiredPrice: "",
  plz: "10115",
  city: "Berlin",
  firstName: "Erika",
  lastName: "Musterfrau",
  phone: "0151 23456789",
  email: "",
  contactMethod: "WHATSAPP",
  consent: true,
};

describe("submitLead", () => {
  beforeEach(() => {
    send.mockReset();
    ip = `10.0.0.${Math.floor(Math.random() * 250)}-${Date.now()}`;
  });

  it("sends the lead to WhatsApp and reports success", async () => {
    send.mockResolvedValue(undefined);
    expect(await submitLead(valid)).toEqual({ ok: true });
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ brand: "Volkswagen", phone: "+4915123456789" }));
  });

  it("tells the seller to try again when sending fails, because nothing is stored", async () => {
    send.mockRejectedValue(new Error("channel down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await submitLead(valid)).toEqual({
      ok: false,
      message: "Das hat leider nicht geklappt. Bitte versuchen Sie es in einer Minute erneut.",
    });
  });

  it("drops honeypot submissions without sending", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await submitLead(valid, { honeypot: "https://spam.example" })).toEqual({ ok: true });
    expect(send).not.toHaveBeenCalled();
  });

  it("still sends when browser autofill copied the seller's own data into the honeypot", async () => {
    send.mockResolvedValue(undefined);
    const withEmail = { ...valid, email: "erika@example.de" };
    expect(await submitLead(withEmail, { honeypot: "Erika@example.de " })).toEqual({ ok: true });
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("returns field errors and sends nothing for invalid input", async () => {
    const result = await submitLead({ ...valid, plz: "1" });
    expect(result).toMatchObject({ ok: false, fieldErrors: { plz: expect.any(String) } });
    expect(send).not.toHaveBeenCalled();
  });

  it("blocks the 6th submission from one visitor within an hour", async () => {
    send.mockResolvedValue(undefined);
    for (let i = 0; i < 5; i++) expect(await submitLead(valid)).toEqual({ ok: true });
    expect(await submitLead(valid)).toMatchObject({ ok: false, message: expect.stringContaining("mehrere Anfragen") });
    expect(send).toHaveBeenCalledTimes(5);
  });
});
