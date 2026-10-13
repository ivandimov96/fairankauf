// Public site URL for metadata, sitemap and robots. Read directly (not via env())
// because these run at build time, where only APP_URL matters.
export function siteUrl(): string {
  const url = process.env.APP_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  return (url || "http://localhost:3000").replace(/\/$/, "");
}

export const SITE_NAME = "FairAnkauf";
export const SITE_DESCRIPTION =
  "Verkaufen Sie Ihr Auto schnell, fair und ohne Aufwand: Daten in 2 Minuten eingeben, persönliches Angebot erhalten, kostenlose Abholung und Abmeldung.";
