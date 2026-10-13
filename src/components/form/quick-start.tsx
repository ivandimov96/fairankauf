"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";

import { loadDraft, saveDraft } from "@/components/form/draft";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { BRANDS } from "@/lib/options";

const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: thisYear - 1950 + 1 }, (_, i) => String(thisYear - i));

/**
 * The first three questions of the form, right on the landing page. Answers go
 * into the form draft, so the seller continues where they left off.
 */
export function QuickStart() {
  const router = useRouter();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const pick = (name: string) => String(data.get(name) ?? "").trim();
    const draft = loadDraft();
    const values = { ...draft?.values };
    for (const key of ["brand", "firstRegYear", "mileageKm"] as const) {
      const v = pick(key);
      if (v) values[key] = v;
    }
    saveDraft({ step: 0, values });
    router.push("/verkaufen");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" aria-label="Schnellstart: Auto bewerten lassen">
      <div className="grid gap-2">
        <Label htmlFor="qs-brand">Marke</Label>
        <NativeSelect id="qs-brand" name="brand" defaultValue="">
          <option value="">Marke wählen</option>
          {BRANDS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="qs-year">Erstzulassung</Label>
          <NativeSelect id="qs-year" name="firstRegYear" defaultValue="">
            <option value="">Jahr</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="qs-km">Kilometerstand</Label>
          <Input id="qs-km" name="mileageKm" inputMode="numeric" placeholder="z. B. 120.000" />
        </div>
      </div>
      <Button type="submit" variant="signal" size="xl" className="mt-1 w-full">
        Jetzt Auto bewerten lassen
        <ArrowRightIcon aria-hidden />
      </Button>
    </form>
  );
}
