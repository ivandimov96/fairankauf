import { describe, expect, it } from "vitest";

import { getNotificationConfig } from "@/lib/notifications/config";

const email = {
  SMTP_HOST: "smtp.mail.yahoo.com",
  SMTP_USER: "ivan@example.com",
  SMTP_PASS: "app-password",
  LEAD_EMAIL_TO: "ivan@example.com",
};
const whatsapp = {
  WHATSAPP_ACCESS_TOKEN: "EAAx",
  WHATSAPP_PHONE_NUMBER_ID: "123456789",
  LEAD_WHATSAPP_TO: "+38971943038, +49 1515 6041400",
};

describe("getNotificationConfig", () => {
  it("is off for both channels when nothing is set (blank values count as unset)", () => {
    expect(getNotificationConfig({ SMTP_HOST: "  ", LEAD_WHATSAPP_TO: "" })).toEqual({
      email: { status: "off" },
      whatsapp: { status: "off" },
    });
  });

  it("turns on email with defaults and a recipient list", () => {
    const cfg = getNotificationConfig({ ...email, LEAD_EMAIL_TO: "a@example.com, b@example.de" });
    expect(cfg.email).toEqual({
      status: "on",
      config: {
        host: "smtp.mail.yahoo.com",
        port: 465,
        user: "ivan@example.com",
        pass: "app-password",
        from: "ivan@example.com",
        to: ["a@example.com", "b@example.de"],
      },
    });
    expect(getNotificationConfig({ ...email, SMTP_PORT: "587", SMTP_FROM: "noreply@example.com" }).email).toMatchObject({
      config: { port: 587, from: "noreply@example.com" },
    });
  });

  it("turns on WhatsApp and normalizes the numbers to digits", () => {
    expect(getNotificationConfig(whatsapp).whatsapp).toEqual({
      status: "on",
      config: {
        token: "EAAx",
        phoneNumberId: "123456789",
        template: "neue_anfrage",
        language: "de",
        to: ["38971943038", "4915156041400"],
      },
    });
  });

  it("reports a half-configured channel by variable name, without values", () => {
    const cfg = getNotificationConfig({ SMTP_HOST: "smtp.example.com", SMTP_PASS: "secret-value", LEAD_WHATSAPP_TO: "12" });
    expect(cfg.email.status).toBe("invalid");
    expect(cfg.whatsapp.status).toBe("invalid");
    const reasons = JSON.stringify(cfg);
    expect(reasons).toContain("SMTP_USER");
    expect(reasons).toContain("LEAD_EMAIL_TO");
    expect(reasons).toContain("WHATSAPP_ACCESS_TOKEN");
    expect(reasons).toContain("LEAD_WHATSAPP_TO");
    expect(reasons).not.toContain("secret-value");
  });

  it("rejects bad addresses, numbers and ids", () => {
    expect(getNotificationConfig({ ...email, LEAD_EMAIL_TO: "nicht-mail" }).email.status).toBe("invalid");
    expect(getNotificationConfig({ ...whatsapp, LEAD_WHATSAPP_TO: "+49 1" }).whatsapp.status).toBe("invalid");
    expect(getNotificationConfig({ ...whatsapp, WHATSAPP_PHONE_NUMBER_ID: "abc" }).whatsapp.status).toBe("invalid");
  });
});
