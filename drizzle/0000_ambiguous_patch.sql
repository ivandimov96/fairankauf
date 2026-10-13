CREATE TYPE "public"."accident_damage" AS ENUM('NEIN', 'JA_REPARIERT', 'JA_NICHT_REPARIERT');--> statement-breakpoint
CREATE TYPE "public"."car_condition" AS ENUM('SEHR_GUT', 'GUT', 'GEBRAUCHT', 'DEFEKT');--> statement-breakpoint
CREATE TYPE "public"."contact_method" AS ENUM('ANRUF', 'WHATSAPP', 'EMAIL');--> statement-breakpoint
CREATE TYPE "public"."fuel_type" AS ENUM('BENZIN', 'DIESEL', 'HYBRID', 'ELEKTRO', 'LPG_CNG', 'ANDERE');--> statement-breakpoint
CREATE TYPE "public"."gearbox" AS ENUM('MANUELL', 'AUTOMATIK');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('NEU', 'KONTAKTIERT', 'BESICHTIGUNG_GEPLANT', 'ANGEBOT_GEMACHT', 'GEKAUFT', 'IN_AUFBEREITUNG', 'INSERIERT', 'VERKAUFT', 'ABGELEHNT', 'VERLOREN');--> statement-breakpoint
CREATE TYPE "public"."margin_type" AS ENUM('EUR', 'PERCENT');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('PENDING', 'SENT', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."service_book" AS ENUM('JA', 'TEILWEISE', 'NEIN');--> statement-breakpoint
CREATE TABLE "deal_costs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"description" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deals" (
	"lead_id" uuid PRIMARY KEY NOT NULL,
	"est_market_value_cents" integer,
	"recon_estimate_cents" integer,
	"fees_estimate_cents" integer,
	"target_margin_type" "margin_type" DEFAULT 'EUR' NOT NULL,
	"target_margin_value" integer,
	"purchase_price_cents" integer,
	"purchase_date" date,
	"sale_price_cents" integer,
	"sale_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"url" text NOT NULL,
	"pathname" text NOT NULL,
	"position" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"first_reg_year" smallint NOT NULL,
	"first_reg_month" smallint,
	"mileage_km" integer NOT NULL,
	"fuel" "fuel_type" NOT NULL,
	"gearbox" "gearbox" NOT NULL,
	"power_kw" smallint,
	"body_type" text,
	"condition" "car_condition" NOT NULL,
	"accident" "accident_damage" NOT NULL,
	"drivable" boolean NOT NULL,
	"hu_due_year" smallint,
	"hu_due_month" smallint,
	"service_book" "service_book" NOT NULL,
	"previous_owners" smallint NOT NULL,
	"defects" text,
	"desired_price_cents" integer,
	"plz" text NOT NULL,
	"city" text NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"contact_method" "contact_method" NOT NULL,
	"consent_at" timestamp with time zone NOT NULL,
	"status" "lead_status" DEFAULT 'NEU' NOT NULL,
	"lost_reason" text,
	"notification_status" "notification_status" DEFAULT 'PENDING' NOT NULL,
	"notification_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "rate_limits_key_window_start_pk" PRIMARY KEY("key","window_start")
);
--> statement-breakpoint
CREATE TABLE "status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"from_status" "lead_status",
	"to_status" "lead_status" NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "deal_costs" ADD CONSTRAINT "deal_costs_lead_id_deals_lead_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."deals"("lead_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_photos" ADD CONSTRAINT "lead_photos_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "deal_costs_lead_id_index" ON "deal_costs" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "lead_photos_lead_id_index" ON "lead_photos" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "leads_status_created_at_index" ON "leads" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "leads_created_at_index" ON "leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notes_lead_id_created_at_index" ON "notes" USING btree ("lead_id","created_at");--> statement-breakpoint
CREATE INDEX "status_history_lead_id_created_at_index" ON "status_history" USING btree ("lead_id","created_at");