import { existsSync } from "node:fs";

import { expect, test, type Locator, type Page } from "@playwright/test";
import postgres from "postgres";

// Grows phase by phase into the full happy path:
// fill the form → lead appears in admin → notification sent via the console provider.

if (!process.env.DATABASE_URL && existsSync(".env.local")) process.loadEnvFile(".env.local");

/**
 * Taps a choice button. Error messages disappearing after a tap shift the layout,
 * so retry until the radio is really checked.
 */
async function choose(scope: Page | Locator, name: string) {
  await expect(async () => {
    await scope.getByText(name, { exact: true }).click();
    await expect(scope.getByRole("radio", { name, exact: true })).toBeChecked({ timeout: 500 });
  }).toPass();
}

test("seller submits a car and the lead is saved", async ({ page }) => {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  const phoneLocal = `0151 ${String(Date.now()).slice(-8)}`;
  const phoneE164 = `+49151${String(Date.now()).slice(-8)}`;

  try {
    await page.goto("/");
    await page.getByRole("link", { name: "Jetzt Auto bewerten lassen" }).click();
    await expect(page.getByRole("heading", { name: "Ihr Auto", exact: true })).toBeVisible();

    // Step 1: errors show when required fields are missing.
    await page.getByRole("button", { name: "Weiter" }).click();
    await expect(page.getByText("Bitte wählen Sie die Marke.")).toBeVisible();

    await page.getByRole("combobox", { name: "Marke" }).fill("volks");
    await page.getByRole("option", { name: "Volkswagen" }).click();
    await page.getByLabel("Modell").fill("Golf 1.4 TSI");
    await page.getByLabel("Erstzulassung").selectOption("2016");
    await page.getByLabel("Kilometerstand (km)").fill("123.000");
    await choose(page, "Benzin");
    await choose(page, "Manuell");
    await page.getByRole("textbox", { name: /^Leistung/ }).fill("125");
    await page.getByRole("button", { name: "Weiter" }).click();

    // Step 2
    await expect(page.getByRole("heading", { name: "Zustand", exact: true })).toBeVisible();
    await choose(page.getByRole("group", { name: "Allgemeiner Zustand" }), "Gut");
    await choose(page.getByRole("group", { name: "Unfallschaden" }), "Nein");
    await choose(page.getByRole("group", { name: "Ist das Auto fahrbereit?" }), "Ja");
    await choose(page.getByRole("group", { name: "Scheckheftgepflegt?" }), "Ja");
    await page.getByLabel("Anzahl Vorbesitzer").fill("2");

    // Draft survives a reload.
    await page.reload();
    await expect(page.getByRole("heading", { name: "Zustand", exact: true })).toBeVisible();
    await expect(page.getByLabel("Anzahl Vorbesitzer")).toHaveValue("2");
    await page.getByRole("button", { name: "Weiter" }).click();

    // Step 3: price and location
    await page.getByLabel("Ihre Preisvorstellung (€)").fill("9500");
    await page.getByLabel("PLZ", { exact: true }).fill("10115");
    await page.getByLabel("Ort", { exact: true }).fill("Berlin");
    await page.getByRole("button", { name: "Weiter" }).click();

    // Step 4: contact
    await page.getByLabel("Name", { exact: true }).fill("Erika Musterfrau");
    await page.getByLabel("Telefonnummer").fill(phoneLocal);
    await choose(page, "WhatsApp");
    await page.getByRole("button", { name: "Angebot anfordern" }).click();
    await expect(page.getByText("Bitte stimmen Sie der Datenverarbeitung zu.")).toBeVisible();
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Angebot anfordern" }).click();

    await expect(page.getByRole("heading", { name: "Vielen Dank!", exact: true })).toBeVisible();
    await expect(page.getByText("Wir melden uns in Kürze.")).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("fairankauf:lead-draft:v1"))).toBeNull();

    const [lead] = await sql`
      select l.brand, l.mileage_km, l.power_kw, l.desired_price_cents, l.phone, l.status,
             l.notification_status, count(h.id)::int as history
      from leads l left join status_history h on h.lead_id = l.id
      where l.phone = ${phoneE164}
      group by l.id`;
    expect(lead).toMatchObject({
      brand: "Volkswagen",
      mileage_km: 123000,
      power_kw: 92,
      desired_price_cents: 950000,
      status: "NEU",
      notification_status: "PENDING",
      history: 1,
    });
  } finally {
    await sql`delete from leads where phone = ${phoneE164}`;
    await sql.end();
  }
});
