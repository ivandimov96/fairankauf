import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ChannelSetting, EmailConfig, NotificationConfig, WhatsAppConfig } from "@/lib/notifications/config";
import type { LeadSummary } from "@/lib/notifications/format";

const getNotificationConfig = vi.fn<() => NotificationConfig>();
const sendLeadEmail = vi.fn();
const sendLeadWhatsApp = vi.fn();
vi.mock("@/lib/notifications/config", () => ({ getNotificationConfig: () => getNotificationConfig() }));
vi.mock("@/lib/notifications/email", () => ({ sendLeadEmail: (...a: unknown[]) => sendLeadEmail(...a) }));
vi.mock("@/lib/notifications/whatsapp", () => ({ sendLeadWhatsApp: (...a: unknown[]) => sendLeadWhatsApp(...a) }));

const { sendLeadNotification } = await import("@/lib/notifications");

const lead: LeadSummary = {
  brand: "Skoda",
  model: "Octavia",
  firstRegYear: 2018,
  firstRegMonth: null,
  mileageKm: 90000,
  fuel: "DIESEL",
  gearbox: "MANUELL",
  drivetrain: "FRONT",
  doors: "5",
  color: "SCHWARZ",
  powerKw: null,
  condition: "GUT",
  interiorCondition: "GUT",
  accident: "NEIN",
  drivable: true,
  sellTiming: "DREI_MONATE",
  desiredPriceCents: null,
  plz: "20095",
  city: "Hamburg",
  name: "Max",
  phone: "+4915123456789",
  contactMethod: "WHATSAPP",
};

const emailOn: ChannelSetting<EmailConfig> & { status: "on" } = {
  status: "on",
  config: { host: "h", port: 465, user: "u", pass: "p", from: "u", to: ["u"] },
};
const whatsappOn: ChannelSetting<WhatsAppConfig> & { status: "on" } = {
  status: "on",
  config: { token: "t", phoneNumberId: "1", template: "neue_anfrage", language: "de", to: ["38971943038"] },
};

describe("sendLeadNotification", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    sendLeadEmail.mockReset();
    sendLeadWhatsApp.mockReset();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("only logs the lead when no channel is configured", async () => {
    getNotificationConfig.mockReturnValue({ email: { status: "off" }, whatsapp: { status: "off" } });
    await sendLeadNotification(lead);
    expect(sendLeadEmail).not.toHaveBeenCalled();
    expect(sendLeadWhatsApp).not.toHaveBeenCalled();
    expect(vi.mocked(console.log).mock.calls[0]![0]).toContain("🚗 Neue Anfrage: Skoda Octavia");
  });

  it("sends through every configured channel", async () => {
    getNotificationConfig.mockReturnValue({ email: emailOn, whatsapp: whatsappOn });
    sendLeadEmail.mockResolvedValue(undefined);
    sendLeadWhatsApp.mockResolvedValue({ delivered: 1, failures: [] });
    await sendLeadNotification(lead);
    expect(sendLeadEmail).toHaveBeenCalledWith(lead, emailOn.config);
    expect(sendLeadWhatsApp).toHaveBeenCalledWith(lead, whatsappOn.config);
    expect(console.error).not.toHaveBeenCalled();
  });

  it("counts as delivered when one channel works, and logs the other's problem", async () => {
    getNotificationConfig.mockReturnValue({ email: emailOn, whatsapp: whatsappOn });
    sendLeadEmail.mockRejectedValue(new Error("535 Authentication failed"));
    sendLeadWhatsApp.mockResolvedValue({ delivered: 1, failures: [] });
    await expect(sendLeadNotification(lead)).resolves.toBeUndefined();
    expect(String(vi.mocked(console.error).mock.calls[0]![0])).toContain("email: 535 Authentication failed");
  });

  it("logs the full lead and throws when nothing was delivered", async () => {
    getNotificationConfig.mockReturnValue({ email: emailOn, whatsapp: { status: "invalid", reason: "LEAD_WHATSAPP_TO fehlt" } });
    sendLeadEmail.mockRejectedValue(new Error("ECONNREFUSED"));
    await expect(sendLeadNotification(lead)).rejects.toThrow("lead not delivered: whatsapp: LEAD_WHATSAPP_TO fehlt | email: ECONNREFUSED");
    const logged = String(vi.mocked(console.error).mock.calls[0]![0]);
    expect(logged).toContain("NOT delivered");
    expect(logged).toContain("🚗 Neue Anfrage: Skoda Octavia");
  });

  it("throws when the only configured channel is misconfigured", async () => {
    getNotificationConfig.mockReturnValue({ email: { status: "invalid", reason: "SMTP_PASS fehlt" }, whatsapp: { status: "off" } });
    await expect(sendLeadNotification(lead)).rejects.toThrow("SMTP_PASS fehlt");
  });
});
