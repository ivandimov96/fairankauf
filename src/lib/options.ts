// Option lists for the lead form, shared by the client form, the Zod schema
// and (later) the admin UI. Values match the Postgres enums in db/schema.ts.

export const BRANDS = [
  "Alfa Romeo",
  "Audi",
  "BMW",
  "Citroën",
  "Cupra",
  "Dacia",
  "Fiat",
  "Ford",
  "Honda",
  "Hyundai",
  "Jaguar",
  "Jeep",
  "Kia",
  "Land Rover",
  "Lexus",
  "Mazda",
  "Mercedes-Benz",
  "Mini",
  "Mitsubishi",
  "Nissan",
  "Opel",
  "Peugeot",
  "Porsche",
  "Renault",
  "Seat",
  "Skoda",
  "Smart",
  "Subaru",
  "Suzuki",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
] as const;

export const OTHER_BRAND = "Andere";

export const FUEL = {
  BENZIN: "Benzin",
  DIESEL: "Diesel",
  HYBRID: "Hybrid",
  ELEKTRO: "Elektro",
  LPG_CNG: "LPG/CNG",
  ANDERE: "Andere",
} as const;

export const GEARBOX = {
  MANUELL: "Manuell",
  AUTOMATIK: "Automatik",
} as const;

export const BODY_TYPES = [
  "Kleinwagen",
  "Limousine",
  "Kombi",
  "SUV/Geländewagen",
  "Cabrio",
  "Coupé",
  "Van/Minibus",
  "Transporter",
  "Andere",
] as const;

export const CONDITION = {
  SEHR_GUT: "Sehr gut",
  GUT: "Gut",
  GEBRAUCHT: "Gebraucht",
  DEFEKT: "Defekt",
} as const;

export const ACCIDENT = {
  NEIN: "Nein",
  JA_REPARIERT: "Ja, repariert",
  JA_NICHT_REPARIERT: "Ja, nicht repariert",
} as const;

export const YES_NO = {
  JA: "Ja",
  NEIN: "Nein",
} as const;

export const SERVICE_BOOK = {
  JA: "Ja",
  TEILWEISE: "Teilweise",
  NEIN: "Nein",
} as const;

export const CONTACT_METHOD = {
  ANRUF: "Anruf",
  WHATSAPP: "WhatsApp",
  EMAIL: "E-Mail",
} as const;

export const POWER_UNIT = {
  KW: "kW",
  PS: "PS",
} as const;

export const MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
] as const;

export type EnumKey<T> = keyof T & string;

export function keysOf<T extends Record<string, string>>(obj: T) {
  return Object.keys(obj) as [EnumKey<T>, ...EnumKey<T>[]];
}
