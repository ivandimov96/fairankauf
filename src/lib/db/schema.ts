import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Money is always integer cents (`*Cents`). Timestamps are timestamptz (UTC).
// Column names are camelCase in TS and snake_case in Postgres (casing: "snake_case").

export const fuelType = pgEnum("fuel_type", [
  "BENZIN",
  "DIESEL",
  "HYBRID",
  "ELEKTRO",
  "LPG_CNG",
  "ANDERE",
]);

export const gearbox = pgEnum("gearbox", ["MANUELL", "AUTOMATIK"]);

export const carCondition = pgEnum("car_condition", ["SEHR_GUT", "GUT", "GEBRAUCHT", "DEFEKT"]);

export const accidentDamage = pgEnum("accident_damage", ["NEIN", "JA_REPARIERT", "JA_NICHT_REPARIERT"]);

export const serviceBook = pgEnum("service_book", ["JA", "TEILWEISE", "NEIN"]);

export const contactMethod = pgEnum("contact_method", ["ANRUF", "WHATSAPP", "EMAIL"]);

export const notificationStatus = pgEnum("notification_status", ["PENDING", "SENT", "FAILED"]);

const timestamps = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
};

export const leads = pgTable(
  "leads",
  {
    id: uuid().primaryKey().defaultRandom(),

    // Step 1: car basics
    brand: text().notNull(),
    model: text().notNull(),
    firstRegYear: smallint().notNull(),
    firstRegMonth: smallint(),
    mileageKm: integer().notNull(),
    fuel: fuelType().notNull(),
    gearbox: gearbox().notNull(),
    powerKw: smallint(),
    bodyType: text(),

    // Step 2: condition
    condition: carCondition().notNull(),
    accident: accidentDamage().notNull(),
    drivable: boolean().notNull(),
    huDueYear: smallint(),
    huDueMonth: smallint(),
    serviceBook: serviceBook().notNull(),
    previousOwners: smallint().notNull(),
    defects: text(),

    // Step 4: price and location
    desiredPriceCents: integer(),
    plz: text().notNull(),
    city: text().notNull(),

    // Step 5: contact
    name: text().notNull(),
    phone: text().notNull(), // E.164, e.g. +4915112345678
    email: text(),
    contactMethod: contactMethod().notNull(),
    consentAt: timestamp({ withTimezone: true }).notNull(),

    // Notification (see lib/notifications)
    notificationStatus: notificationStatus().notNull().default("PENDING"),
    notificationError: text(),

    ...timestamps,
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index().on(t.notificationStatus, t.createdAt), index().on(t.createdAt)],
);

// Fixed-window rate limiting that works across serverless instances.
export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text().notNull(), // e.g. "lead:<sha256(ip)>"
    windowStart: timestamp({ withTimezone: true }).notNull(),
    count: integer().notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.key, t.windowStart] })],
);
