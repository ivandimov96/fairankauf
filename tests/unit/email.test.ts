import { describe, expect, it, vi } from "vitest";

import type { EmailConfig } from "@/lib/notifications/config";
import { sendLeadEmail } from "@/lib/notifications/email";
import type { LeadSummary } from "@/lib/notifications/format";

const lead: LeadSummary = {
  brand: "Volkswagen",
  model: "Golf",
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
  accident: "NEIN",
  drivable: true,
  sellTiming: "SOFORT",
  desiredPriceCents: 950_000,
  plz: "10115",
  city: "Berlin",
  name: "Erika Musterfrau",
  phone: "+4915112345678",
  email: "erika@example.de",
  contactMethod: "EMAIL",
};

const cfg: EmailConfig = {
  host: "smtp.mail.yahoo.com",
  port: 465,
  user: "ivan@example.com",
  pass: "app-password",
  from: "ivan@example.com",
  to: ["ivan@example.com"],
};

describe("sendLeadEmail", () => {
  it("mails the full lead text with the seller as reply-to", async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: "x" });
    await sendLeadEmail(lead, cfg, { sendMail });
    expect(sendMail).toHaveBeenCalledTimes(1);
    const mail = sendMail.mock.calls[0]![0];
    expect(mail).toMatchObject({
      from: { name: "Wir kaufen Ihr Auto", address: "ivan@example.com" },
      to: ["ivan@example.com"],
      subject: "Neue Anfrage: Volkswagen Golf, EZ 2016, 123.000 km",
      replyTo: "erika@example.de",
    });
    expect(mail.text).toContain("🚗 Neue Anfrage: Volkswagen Golf");
    expect(mail.text).toContain("Frontantrieb");
    expect(mail.text).toContain("Verkauf: So schnell wie möglich");
    expect(mail.text).toContain("📞 +49 1511 2345678 (bevorzugt: E-Mail)");
  });

  it("leaves reply-to out when the seller gave no email", async () => {
    const sendMail = vi.fn().mockResolvedValue({});
    await sendLeadEmail({ ...lead, email: null }, cfg, { sendMail });
    expect(sendMail.mock.calls[0]![0]).not.toHaveProperty("replyTo");
  });

  it("passes SMTP errors on", async () => {
    const sendMail = vi.fn().mockRejectedValue(new Error("Invalid login: 535 Authentication failed"));
    await expect(sendLeadEmail(lead, cfg, { sendMail })).rejects.toThrow("535");
  });
});
