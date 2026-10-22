import { expect, test, type Locator, type Page } from "@playwright/test";

// Full happy path: fill the form → lead sent via the console provider → thank-you page.
// Leads currently go to the server log only (no channel configured yet).

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

/** Ticks a checkbox button (the box itself is visually hidden, the label is tapped). */
async function tick(scope: Page | Locator, name: string) {
  await expect(async () => {
    await scope.getByText(name, { exact: true }).click();
    await expect(scope.getByRole("checkbox", { name, exact: true })).toBeChecked({ timeout: 500 });
  }).toPass();
}

test("seller submits a car and sees the thank-you page", async ({ page }) => {
  const phoneLocal = `0151 ${String(Date.now()).slice(-8)}`;
  await page.goto("/");
  // Quick start on the landing page carries the year into the form.
  await page.getByLabel("Erstzulassung").selectOption("2016");
  await page.getByRole("button", { name: "Jetzt Auto bewerten lassen" }).click();
  await expect(page.getByRole("heading", { name: "Ihr Auto", exact: true })).toBeVisible();

  // Step 1: errors show when required fields are missing.
  await page.getByRole("button", { name: "Weiter" }).click();
  await expect(page.getByText("Bitte wählen Sie die Marke.")).toBeVisible();

  await page.getByRole("combobox", { name: "Marke" }).fill("volks");
  await page.getByRole("option", { name: "Volkswagen" }).click();
  // The model list follows the brand; "Golf" is there, anything else can be typed in.
  await page.getByRole("combobox", { name: "Modell" }).fill("gol");
  await expect(page.getByRole("option", { name: "Golf Variant" })).toBeVisible();
  await page.getByRole("option", { name: "Golf", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Modell" })).toHaveValue("Golf");
  // The landing page stays mounted but hidden after client navigation, so target the form field by id.
  await expect(page.locator("#firstRegYear")).toHaveValue("2016");
  await page.getByLabel("Kilometerstand (km)").fill("123.000");
  await choose(page, "Benzin");
  await choose(page, "Manuell");
  await choose(page, "Allrad (4x4)");
  await choose(page.getByRole("group", { name: "Türen" }), "5");
  await page.getByLabel("Farbe").selectOption("Schwarz");
  await page.getByRole("textbox", { name: /^Leistung/ }).fill("125");
  await page.getByLabel("Hubraum").selectOption("1,4 l");
  await page.getByRole("button", { name: "Weiter" }).click();

  // Step 2
  await expect(page.getByRole("heading", { name: "Zustand", exact: true })).toBeVisible();
  await choose(page.getByRole("group", { name: "Allgemeiner Zustand" }), "Gut");
  await choose(page.getByRole("group", { name: "Unfallschaden" }), "Nein");
  await choose(page.getByRole("group", { name: "Ist das Auto fahrbereit?" }), "Ja");
  await choose(page.getByRole("group", { name: "Scheckheftgepflegt?" }), "Ja");
  await choose(page.getByRole("group", { name: "Innenausstattung" }), "Leder");
  await page.getByLabel("Scheinwerfer").selectOption("LED");
  await tick(page.getByRole("group", { name: "Ausstattung" }), "Navigation");
  await tick(page.getByRole("group", { name: "Ausstattung" }), "Sitzheizung");
  await page.getByLabel("Anzahl Vorbesitzer").fill("2");

  // Draft survives a reload.
  await page.reload();
  await expect(page.getByRole("heading", { name: "Zustand", exact: true })).toBeVisible();
  await expect(page.getByLabel("Anzahl Vorbesitzer")).toHaveValue("2");
  await expect(page.getByRole("checkbox", { name: "Sitzheizung" })).toBeChecked();
  await page.getByRole("button", { name: "Weiter" }).click();

  // Step 3: timing, price and location
  await page.getByRole("button", { name: "Weiter" }).click();
  await expect(page.getByText("Bitte wählen Sie, wann Sie verkaufen möchten.")).toBeVisible();
  await choose(page, "In den nächsten 4 Wochen");
  await page.getByLabel("Ihre Preisvorstellung (€)").fill("9500");
  await page.getByLabel("PLZ", { exact: true }).fill("10115");
  await page.getByLabel("Ort", { exact: true }).fill("Berlin");
  await page.getByRole("button", { name: "Weiter" }).click();

  // Step 4: contact
  await page.getByLabel("Vorname").fill("Erika");
  await page.getByLabel("Nachname").fill("Musterfrau");
  await page.getByLabel("Telefonnummer").fill(phoneLocal);
  await choose(page, "WhatsApp");
  await page.getByRole("button", { name: "Angebot anfordern" }).click();
  await expect(page.getByText("Bitte stimmen Sie der Datenverarbeitung zu.")).toBeVisible();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Angebot anfordern" }).click();

  await expect(page.getByRole("heading", { name: "Vielen Dank!", exact: true })).toBeVisible();
  await expect(page.getByText("Wir melden uns in Kürze.")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("fairankauf:lead-draft:v1"))).toBeNull();
});

test("a bot filling the hidden honeypot field is silently dropped", async ({ page }) => {
  // Jump straight to the last step with a complete draft, as a bot would. Set it
  // before any page script runs, so the form can't overwrite it while hydrating.
  await page.addInitScript(() =>
    localStorage.setItem(
      "fairankauf:lead-draft:v1",
      JSON.stringify({
        step: 3,
        values: {
          brand: "Audi", model: "A4", firstRegYear: "2015", firstRegMonth: "", mileageKm: "150000",
          fuel: "DIESEL", gearbox: "MANUELL", drivetrain: "FRONT", doors: "5", color: "GRAU", power: "",
          powerUnit: "PS", displacement: "", bodyType: "", condition: "GUT", accident: "NEIN", drivable: "JA",
          huDue: "", serviceBook: "JA", interior: "STOFF", lights: "", extras: [], previousOwners: "1",
          defects: "", sellTiming: "SOFORT", desiredPrice: "", plz: "10115", city: "Berlin",
          firstName: "Bot", lastName: "Bot", phone: "015112345678", email: "", contactMethod: "ANRUF", consent: true,
        },
      }),
    ),
  );
  await page.goto("/verkaufen");
  await page.locator("#fa-hp").fill("https://spam.example", { force: true });
  await page.getByRole("button", { name: "Angebot anfordern" }).click();
  // Looks like success to the bot; the unit tests check nothing is sent.
  await expect(page.getByRole("heading", { name: "Vielen Dank!", exact: true })).toBeVisible();
});

test("brands: the list includes newer brands, and any other brand can be typed in", async ({ page }) => {
  await page.goto("/");
  await page.locator("#qs-brand").selectOption("Andere");
  await page.getByLabel("Welche Marke?").fill("Trabbi Spezial");
  await page.getByRole("button", { name: "Jetzt Auto bewerten lassen" }).click();
  await expect(page.locator("#brand")).toHaveValue("Trabbi Spezial");

  // Back to the list, search a brand that was added recently.
  await page.getByRole("button", { name: "Zurück zur Markenliste" }).click();
  await page.getByRole("combobox", { name: "Marke" }).fill("zee");
  await page.getByRole("option", { name: "Zeekr" }).click();
  await expect(page.getByRole("combobox", { name: "Marke" })).toHaveValue("Zeekr");

  // "Andere Marke" in the form switches to free text, and so does the model.
  await page.getByRole("combobox", { name: "Marke" }).fill("xyz");
  await page.getByRole("option", { name: "Andere Marke (selbst eingeben)" }).click();
  await expect(page.locator("#brand")).toHaveValue("xyz");
  await expect(page.getByRole("combobox", { name: "Modell" })).toHaveCount(0);
  await page.getByLabel("Modell").fill("Spezial 2000");
  await expect(page.locator("#model")).toHaveValue("Spezial 2000");
});

test("models: a listed brand offers its models, and changing the brand clears the model", async ({ page }) => {
  await page.goto("/verkaufen");
  await page.getByRole("combobox", { name: "Marke" }).fill("skoda");
  await page.getByRole("option", { name: "Skoda" }).click();
  await page.getByRole("combobox", { name: "Modell" }).fill("oct");
  await page.getByRole("option", { name: "Octavia" }).click();
  await expect(page.locator("#model")).toHaveValue("Octavia");

  // A model that is not listed is typed in.
  await page.getByRole("combobox", { name: "Modell" }).fill("Octavia Scout");
  await page.getByRole("option", { name: "Anderes Modell (selbst eingeben)" }).click();
  await expect(page.locator("#model")).toHaveValue("Octavia Scout");
  await page.getByRole("button", { name: "Zurück zur Modellliste" }).click();
  await expect(page.locator("#model")).toHaveValue("");

  // Another brand: its own list, nothing left over.
  await page.getByRole("combobox", { name: "Modell" }).fill("fab");
  await page.getByRole("option", { name: "Fabia" }).click();
  await page.getByRole("combobox", { name: "Marke" }).fill("seat");
  await page.getByRole("option", { name: "Seat", exact: true }).click();
  await expect(page.locator("#model")).toHaveValue("");
  await page.getByRole("combobox", { name: "Modell" }).click();
  await expect(page.getByRole("option", { name: "Ibiza" })).toBeVisible();
  await expect(page.getByRole("option", { name: "Fabia" })).toHaveCount(0);
});
