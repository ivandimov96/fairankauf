import { describe, expect, it, vi } from "vitest";

import { notificationConfig } from "@/lib/notifications/config";
import { formatLeadMessage, formatTemplateParams, type LeadSummary } from "@/lib/notifications/format";
import {
  GRAPH_API_VERSION,
  callmebotProvider,
  cloudTemplatePayload,
  consoleProvider,
  whatsappCloudProvider,
} from "@/lib/notifications/providers";

const lead: LeadSummary = {
  id: "7d0f0f4e-2a51-4a59-9a8e-0c6a1b2c3d4e",
  brand: "Volkswagen",
  model: "Golf 1.4 TSI",
  firstRegYear: 2016,
  firstRegMonth: 5,
  mileageKm: 123000,
  fuel: "BENZIN",
  gearbox: "MANUELL",
  powerKw: 92,
  condition: "GUT",
  accident: "JA_REPARIERT",
  drivable: true,
  desiredPriceCents: 950_000,
  plz: "10115",
  city: "Berlin",
  name: "Erika Musterfrau",
  phone: "+4915112345678",
  contactMethod: "WHATSAPP",
};

const APP_URL = "https://fairankauf.de";

describe("formatLeadMessage", () => {
  it("contains every field Ivan needs, a wa.me link and the admin link", () => {
    expect(formatLeadMessage(lead, APP_URL)).toBe(
      [
        "🚗 *Neue Anfrage: Volkswagen Golf 1.4 TSI*",
        "EZ 05/2016 · 123.000 km",
        "Benzin · Manuell · 92 kW",
        "Zustand: Gut · Unfall: Ja, repariert · Fahrbereit: Ja",
        "Preisvorstellung: 9.500\u00a0€",
        "Ort: 10115 Berlin",
        "",
        "👤 Erika Musterfrau",
        "📞 +49 1511 2345678 (bevorzugt: WhatsApp)",
        "💬 https://wa.me/4915112345678",
        "",
        "🔗 https://fairankauf.de/admin/leads/7d0f0f4e-2a51-4a59-9a8e-0c6a1b2c3d4e",
      ].join("\n"),
    );
  });

  it("handles missing optional values", () => {
    const msg = formatLeadMessage(
      { ...lead, firstRegMonth: null, powerKw: null, desiredPriceCents: null, drivable: false },
      `${APP_URL}/`,
    );
    expect(msg).toContain("EZ 2016 · 123.000 km");
    expect(msg).toContain("Benzin · Manuell\n");
    expect(msg).toContain("Preisvorstellung: keine Angabe");
    expect(msg).toContain("Fahrbereit: Nein");
    expect(msg).toContain("https://fairankauf.de/admin/leads/"); // no double slash
  });
});

describe("formatTemplateParams", () => {
  it("returns 9 single-line parameters in template order", () => {
    const params = formatTemplateParams({ ...lead, name: "Erika\n  Musterfrau", city: "Berlin    Mitte" });
    expect(params).toEqual([
      "Volkswagen Golf 1.4 TSI",
      "05/2016, 123.000 km",
      "Benzin, Manuell, 92 kW",
      "Gut, Unfall: Ja, repariert, fahrbereit: ja",
      "9.500\u00a0€", // Intl uses a non-breaking space
      "10115 Berlin Mitte",
      "Erika Musterfrau",
      "+49 1511 2345678 (bevorzugt: WhatsApp)",
      "https://wa.me/4915112345678",
    ]);
    for (const p of params) expect(p).not.toMatch(/[\n\t]| {5,}/);
  });
});

describe("providers", () => {
  it("console logs the message", async () => {
    const log = vi.fn();
    await consoleProvider(APP_URL, log).sendNewLead(lead);
    expect(log).toHaveBeenCalledWith(expect.stringContaining("Neue Anfrage: Volkswagen"));
  });

  it("callmebot calls the API with phone, text and key", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("Message queued. You will receive it in a few seconds."));
    await callmebotProvider({ phone: "+4915156041400", apiKey: "123456" }, APP_URL, fetchMock).sendNewLead(lead);

    const url = fetchMock.mock.calls[0]![0] as URL;
    expect(url.origin + url.pathname).toBe("https://api.callmebot.com/whatsapp.php");
    expect(url.searchParams.get("phone")).toBe("+4915156041400");
    expect(url.searchParams.get("apikey")).toBe("123456");
    expect(url.searchParams.get("text")).toBe(formatLeadMessage(lead, APP_URL));
  });

  it("callmebot throws on an error answer, even with HTTP 200", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("<p>APIKey is invalid.</p>"));
    await expect(
      callmebotProvider({ phone: "+4915156041400", apiKey: "x" }, APP_URL, fetchMock).sendNewLead(lead),
    ).rejects.toThrow("CallMeBot 200: APIKey is invalid.");
  });

  it("whatsapp_cloud posts the template with body params and the button's lead id", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ messages: [{ id: "wamid.x" }] }));
    const cfg = { phone: "+4915156041400", token: "tok", phoneNumberId: "1234567890", template: "new_car_lead", lang: "de" };
    await whatsappCloudProvider(cfg, fetchMock).sendNewLead(lead);

    const [url, init] = fetchMock.mock.calls[0]! as [string, RequestInit];
    expect(url).toBe(`https://graph.facebook.com/${GRAPH_API_VERSION}/1234567890/messages`);
    expect(init.headers).toMatchObject({ Authorization: "Bearer tok" });
    expect(JSON.parse(init.body as string)).toEqual(cloudTemplatePayload(lead, cfg));
    expect(cloudTemplatePayload(lead, cfg)).toMatchObject({
      to: "4915156041400",
      template: {
        name: "new_car_lead",
        language: { code: "de" },
        components: [
          { type: "body", parameters: expect.arrayContaining([{ type: "text", text: "Volkswagen Golf 1.4 TSI" }]) },
          { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: lead.id }] },
        ],
      },
    });
  });

  it("whatsapp_cloud throws with Meta's error text", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ error: { message: "Template name does not exist" } }, { status: 404 }));
    const cfg = { phone: "+491", token: "t", phoneNumberId: "1", template: "new_car_lead", lang: "de" };
    await expect(whatsappCloudProvider(cfg, fetchMock).sendNewLead(lead)).rejects.toThrow(
      /WhatsApp Cloud API 404: .*Template name does not exist/,
    );
  });
});

describe("notificationConfig", () => {
  it("defaults to console", () => {
    expect(notificationConfig({})).toEqual({ NOTIFICATION_PROVIDER: "console" });
  });

  it("requires the API key for callmebot and ignores empty values", () => {
    expect(() =>
      notificationConfig({ NOTIFICATION_PROVIDER: "callmebot", NOTIFY_PHONE: "+4915156041400", CALLMEBOT_API_KEY: "" }),
    ).toThrow(/CALLMEBOT_API_KEY/);
  });

  it("rejects a phone number that is not E.164", () => {
    expect(() =>
      notificationConfig({ NOTIFICATION_PROVIDER: "callmebot", NOTIFY_PHONE: "0151 56041400", CALLMEBOT_API_KEY: "k" }),
    ).toThrow(/E\.164/);
  });
});
