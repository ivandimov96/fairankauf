import { describe, expect, it } from "vitest";

import { MODELS, modelsFor } from "@/lib/models";
import { BRANDS } from "@/lib/options";

describe("car models", () => {
  it("lists at least one model for every brand, without duplicates or stray spaces", () => {
    for (const brand of BRANDS) {
      const models = MODELS[brand];
      expect(models.length, brand).toBeGreaterThan(0);
      expect(new Set(models).size, brand).toBe(models.length);
      for (const m of models) expect(m, brand).toBe(m.trim());
    }
  });

  it("sorts models with German collation and numbers in order", () => {
    expect(modelsFor("BMW").slice(0, 4)).toEqual(["1er", "2er Active Tourer", "2er Cabrio", "2er Coupé"]);
    expect(modelsFor("Peugeot").indexOf("208")).toBeLessThan(modelsFor("Peugeot").indexOf("2008"));
  });

  it("is empty for a brand that is not in the list, so the model is typed in", () => {
    expect(modelsFor("Trabbi Spezial")).toEqual([]);
    expect(modelsFor("")).toEqual([]);
  });
});
