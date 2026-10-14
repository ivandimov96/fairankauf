import { describe, expect, it, vi } from "vitest";

import { notificationChannels } from "@/lib/notifications/config";
import { formatLeadMessage, formatTemplateParams, type LeadSummary } from "@/lib/notifications/format";
import {
  GRAPH_API_VERSION,
  cloudTemplatePayload,
  consoleProvider,
  emailPayload,
  emailProvider,
  telegramPayload,
  telegramProvider,
  whatsappCloudProvider,
} from "@/lib/notifications/providers";

const lead: LeadSummary = {
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

describe("formatLeadMessage", () => {
  it("contains every field Ivan needs and a wa.me link to the seller", () => {
    expect(formatLeadMessage(lead)).toBe(
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
    expect(msg).toContain("Benzin · Manuell\n");
    expect(msg).toContain("Preisvorstellung: keine Angabe");
    expect(msg).toContain("Fahrbereit: Nein");
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
    await consoleProvider(log).sendNewLead(lead);
    expect(log).toHaveBeenCalledWith(expect.stringContaining("Neue Anfrage: Volkswagen"));
  });

  it("email posts the full lead as plain text to Resend, with replies going to the seller", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ id: "e1" }));
    const cfg = { apiKey: "re_123", to: "vlado.dimov2@gmail.com", from: "FairAnkauf <onboarding@resend.dev>" };
    await emailProvider(cfg, fetchMock).sendNewLead({ ...lead, email: "erika@example.de", defects: "Kratzer" });

    const [url, init] = fetchMock.mock.calls[0]! as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers).toMatchObject({ Authorization: "Bearer re_123" });
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({
      from: "FairAnkauf <onboarding@resend.dev>",
      to: ["vlado.dimov2@gmail.com"],
      subject: "Neue Anfrage: Volkswagen Golf 1.4 TSI",
      reply_to: "erika@example.de",
    });
    expect(body.text).toContain("Mängel: Kratzer");
    expect(body.text).not.toContain("*");
    expect(emailPayload(lead, cfg)).not.toHaveProperty("reply_to");
  });

  it("email throws with Resend's error text", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ message: "You can only send testing emails to your own email address" }, { status: 403 }));
    const cfg = { apiKey: "re_x", to: "a@b.de", from: "x <onboarding@resend.dev>" };
    await expect(emailProvider(cfg, fetchMock).sendNewLead(lead)).rejects.toThrow(/Email \(Resend\) 403: .*own email/);
  });

  it("telegram posts the plain-text message to the chat", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ ok: true }));
    await telegramProvider({ botToken: "123:abc", chatId: "42" }, fetchMock).sendNewLead(lead);

    const [url, init] = fetchMock.mock.calls[0]! as [string, RequestInit];
    expect(url).toBe("https://api.telegram.org/bot123:abc/sendMessage");
    const body = JSON.parse(init.body as string);
    expect(body).toEqual(telegramPayload(lead, "42"));
    expect(body.chat_id).toBe("42");
    expect(body.text).toContain("Neue Anfrage: Volkswagen Golf 1.4 TSI");
    expect(body.text).not.toContain("*");
  });

  it("telegram throws with Telegram's error text", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ ok: false, description: "Bad Request: chat not found" }, { status: 400 }));
    await expect(telegramProvider({ botToken: "1:a", chatId: "1" }, fetchMock).sendNewLead(lead)).rejects.toThrow(
      /Telegram 400: .*chat not found/,
    );
  });

  it("whatsapp_cloud posts the template with the body parameters", async () => {
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

describe("notificationChannels", () => {
  it("prints to the log when nothing is configured, except on the live site", () => {
    expect(notificationChannels({})).toEqual([{ ok: true, config: { kind: "console" } }]);
    expect(notificationChannels({ VERCEL_ENV: "production" })).toMatchObject([{ ok: false, kind: "none" }]);
  });

  it("enables every channel whose key is set, and ignores empty values", () => {
    const setups = notificationChannels({
      RESEND_API_KEY: "re_abc",
      NOTIFY_EMAIL: "vlado.dimov2@gmail.com",
      WHATSAPP_CLOUD_TOKEN: "tok",
      WHATSAPP_CLOUD_PHONE_NUMBER_ID: "123",
      NOTIFY_PHONE: "+38971943038",
      TELEGRAM_BOT_TOKEN: "",
    });
    expect(setups).toEqual([
      {
        ok: true,
        config: {
          kind: "email",
          RESEND_API_KEY: "re_abc",
          NOTIFY_EMAIL: "vlado.dimov2@gmail.com",
          EMAIL_FROM: "FairAnkauf <onboarding@resend.dev>",
        },
      },
      {
        ok: true,
        config: {
          kind: "whatsapp_cloud",
          WHATSAPP_CLOUD_TOKEN: "tok",
          WHATSAPP_CLOUD_PHONE_NUMBER_ID: "123",
          NOTIFY_PHONE: "+38971943038",
          WHATSAPP_CLOUD_TEMPLATE: "new_car_lead",
          WHATSAPP_CLOUD_TEMPLATE_LANG: "de",
        },
      },
    ]);
  });

  it("reports a broken channel without affecting the others", () => {
    const setups = notificationChannels({
      RESEND_API_KEY: "re_abc",
      NOTIFY_EMAIL: "vlado.dimov2@gmail.com",
      WHATSAPP_CLOUD_TOKEN: "tok",
      NOTIFY_PHONE: "0151 56041400",
    });
    expect(setups[0]).toMatchObject({ ok: true });
    expect(setups[1]).toMatchObject({ ok: false, kind: "whatsapp_cloud", error: expect.stringMatching(/E\.164/) });
  });

  it("parses the telegram settings", () => {
    expect(notificationChannels({ TELEGRAM_BOT_TOKEN: "123456:AA-b_c", TELEGRAM_CHAT_ID: "@me" })).toMatchObject([
      { ok: false, error: expect.stringMatching(/TELEGRAM_CHAT_ID/) },
    ]);
  });
});

describe("sendLeadNotification", () => {
  const env = {
    RESEND_API_KEY: "re_abc",
    NOTIFY_EMAIL: "vlado.dimov2@gmail.com",
    WHATSAPP_CLOUD_TOKEN: "tok",
    WHATSAPP_CLOUD_PHONE_NUMBER_ID: "123",
    NOTIFY_PHONE: "+38971943038",
  };
  const ok = (url: string) => url.includes("resend") ? Response.json({ id: "e" }) : Response.json({ messages: [{}] });
  const fail = () => Response.json({ error: { message: "down" } }, { status: 500 });

  async function run(fetchImpl: (url: string) => Response) {
    vi.resetModules();
    const fetchMock = vi.fn().mockImplementation(async (url: string) => fetchImpl(String(url)));
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const { sendLeadNotification } = await import("@/lib/notifications");
      return { result: sendLeadNotification(lead, [0, 0], env), fetchMock };
    } finally {
      vi.unstubAllGlobals();
    }
  }

  it("sends to email and WhatsApp", async () => {
    const { result, fetchMock } = await run(ok);
    await expect(result).resolves.toBeUndefined();
    expect(fetchMock.mock.calls.map(([u]) => String(u).split("/")[2])).toEqual(["api.resend.com", "graph.facebook.com"]);
  });

  it("succeeds when one channel still delivers, after retrying the other 3 times", async () => {
    const { result, fetchMock } = await run((url) => (url.includes("facebook") ? fail() : ok(url)));
    await expect(result).resolves.toBeUndefined();
    expect(fetchMock.mock.calls.filter(([u]) => String(u).includes("facebook"))).toHaveLength(3);
  });

  it("throws with every channel's error when nothing got through", async () => {
    const { result } = await run(fail);
    await expect(result).rejects.toThrow(/email: Email \(Resend\) 500.*\| whatsapp_cloud: WhatsApp Cloud API 500/);
  });
});
