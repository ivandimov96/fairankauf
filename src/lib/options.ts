// Option lists for the lead form, shared by the client form, the Zod schema
// and the notification message.

// Brands sold in Germany, A–Z. Anything else goes through "Andere Marke" (free text).
export const BRANDS = [
  "Abarth",
  "Aiways",
  "Aixam",
  "Alfa Romeo",
  "Alpina",
  "Alpine",
  "Aston Martin",
  "Audi",
  "Bentley",
  "BMW",
  "BYD",
  "Cadillac",
  "Chevrolet",
  "Chrysler",
  "Citroën",
  "Corvette",
  "Cupra",
  "Dacia",
  "Daewoo",
  "Daihatsu",
  "Dodge",
  "DS Automobiles",
  "Ferrari",
  "Fiat",
  "Ford",
  "Genesis",
  "GWM",
  "Honda",
  "Hongqi",
  "Hummer",
  "Hyundai",
  "Ineos",
  "Infiniti",
  "Isuzu",
  "Iveco",
  "Jaguar",
  "Jeep",
  "KGM (SsangYong)",
  "Kia",
  "Lada",
  "Lamborghini",
  "Lancia",
  "Land Rover",
  "Leapmotor",
  "Lexus",
  "Ligier",
  "Lotus",
  "Lynk & Co",
  "Maserati",
  "Maxus",
  "Maybach",
  "Mazda",
  "McLaren",
  "Mercedes-Benz",
  "MG",
  "Microcar",
  "Mini",
  "Mitsubishi",
  "NIO",
  "Nissan",
  "Opel",
  "Peugeot",
  "Polestar",
  "Porsche",
  "RAM",
  "Renault",
  "Rolls-Royce",
  "Rover",
  "Saab",
  "Seat",
  "Skoda",
  "Smart",
  "Subaru",
  "Suzuki",
  "Tesla",
  "Toyota",
  "Trabant",
  "VinFast",
  "Volkswagen",
  "Volvo",
  "Wartburg",
  "XPENG",
  "Zeekr",
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

export const DRIVETRAIN = {
  FRONT: "Frontantrieb",
  HECK: "Heckantrieb",
  ALLRAD: "Allrad (4x4)",
} as const;

export const DOORS = {
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
} as const;

export const COLORS = {
  SCHWARZ: "Schwarz",
  WEISS: "Weiß",
  SILBER: "Silber",
  GRAU: "Grau",
  BLAU: "Blau",
  ROT: "Rot",
  GRUEN: "Grün",
  GELB: "Gelb",
  ORANGE: "Orange",
  BRAUN: "Braun",
  BEIGE: "Beige",
  GOLD: "Gold",
  VIOLETT: "Violett",
  ANDERE: "Andere",
} as const;

// Engine size in litres; the key is what the form stores.
export const DISPLACEMENT = {
  "1.0": "1,0 l",
  "1.2": "1,2 l",
  "1.3": "1,3 l",
  "1.4": "1,4 l",
  "1.5": "1,5 l",
  "1.6": "1,6 l",
  "1.8": "1,8 l",
  "1.9": "1,9 l",
  "2.0": "2,0 l",
  "2.2": "2,2 l",
  "2.5": "2,5 l",
  "3.0": "3,0 l",
  "3.5": "3,5 l",
  "4.0": "4,0 l oder mehr",
  ANDERE: "Andere",
} as const;

export const INTERIOR = {
  STOFF: "Stoff",
  LEDER: "Leder",
  KUNSTLEDER: "Kunstleder",
  ALCANTARA: "Alcantara",
  TEILLEDER: "Teilleder",
} as const;

export const LIGHTS = {
  HALOGEN: "Halogen",
  XENON: "Xenon",
  BI_XENON: "Bi-Xenon",
  LED: "LED",
  MATRIX: "Matrix-LED / Laser",
} as const;

export const EXTRAS = {
  NAVI: "Navigation",
  PDC: "Parksensoren",
  KAMERA: "Rückfahrkamera",
  SITZHEIZUNG: "Sitzheizung",
  SCHIEBEDACH: "Schiebedach",
  TEMPOMAT: "Tempomat",
  WEITERE: "Weitere Extras",
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
  STARK_GEBRAUCHT: "Stark gebraucht",
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

export const SELL_TIMING = {
  SOFORT: "So schnell wie möglich",
  VIER_WOCHEN: "In den nächsten 4 Wochen",
  DREI_MONATE: "In 1 bis 3 Monaten",
  UNENTSCHIEDEN: "Ich informiere mich erst",
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
