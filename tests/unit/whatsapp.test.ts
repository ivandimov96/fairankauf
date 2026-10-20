import { describe, expect, it, vi } from "vitest";

import type { WhatsAppConfig } from "@/lib/notifications/config";
import type { LeadSummary } from "@/lib/notifications/format";
import { sendLeadWhatsApp } from "@/lib/notifications/whatsapp";

const lead: LeadSummary = {
  brand: "Audi",
  model: "A4",
  firstRegYear: 2015,
  firstRegMonth: null,
  mileageKm: 150000,
  fuel: "DIESEL",
  gearbox: "AUTOMATIK",
  drivetrain: "ALLRAD",
  powerKw: null,
  condition: "GUT",
  accident: "NEIN",
  drivable: true,
  sellTiming: "VIER_WOCHEN",
  desiredPriceCents: null,
  plz: "80331",
  city: "München",
  name: "Max",
  phone: "+4915123456789",
  contactMethod: "ANRUF",
};

const cfg: WhatsAppConfig = {
  token: "secret-token",
  phoneNumberId: "1234567890",
  template: "neue_anfrage",
  language: "de",
  to: ["38971943038", "4915156041400"],
};

describe("sendLeadWhatsApp", () => {
  it("sends the template with one text parameter per line to every number", async () => {
    const fetchMock = vi.fn().mockImplementation(async () => Response.json({ messages: [{ id: "wamid.x" }] }));
    const result = await sendLeadWhatsApp(lead, cfg, fetchMock);
    expect(result).toEqual({ delivered: 2, failures: [] });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://graph.facebook.com/v22.0/1234567890/messages");
    expect(init.headers.Authorization).toBe("Bearer secret-token");
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({
      messaging_product: "whatsapp",
      to: "38971943038",
      type: "template",
      template: { name: "neue_anfrage", language: { code: "de" } },
    });
    const params = body.template.components[0].parameters;
    expect(params).toHaveLength(9);
    expect(params[0]).toEqual({ type: "text", text: "Audi A4" });
    expect(params[2]).toEqual({ type: "text", text: "Diesel · Automatik · Allrad (4x4)" });
    expect(JSON.parse(fetchMock.mock.calls[1]![1].body).to).toBe("4915156041400");
  });

  it("still counts as delivered when one number fails, listing the failure", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(async () => Response.json({ messages: [] }))
      .mockImplementationOnce(async () =>
        Response.json({ error: { message: "(#131030) Recipient phone number not in allowed list" } }, { status: 400 }),
      );
    const result = await sendLeadWhatsApp(lead, cfg, fetchMock);
    expect(result.delivered).toBe(1);
    expect(result.failures).toEqual(["HTTP 400 to …1400 ((#131030) Recipient phone number not in allowed list)"]);
    expect(JSON.stringify(result)).not.toContain("secret-token");
  });

  it("throws when no number could be reached", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    await expect(sendLeadWhatsApp(lead, cfg, fetchMock)).rejects.toThrow("WhatsApp: fetch failed; fetch failed");
  });
});
