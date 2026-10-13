CREATE TYPE "public"."accident_damage" AS ENUM('NEIN', 'JA_REPARIERT', 'JA_NICHT_REPARIERT');--> statement-breakpoint
CREATE TYPE "public"."car_condition" AS ENUM('SEHR_GUT', 'GUT', 'GEBRAUCHT', 'DEFEKT');--> statement-breakpoint
CREATE TYPE "public"."contact_method" AS ENUM('ANRUF', 'WHATSAPP', 'EMAIL');--> statement-breakpoint
CREATE TYPE "public"."fuel_type" AS ENUM('BENZIN', 'DIESEL', 'HYBRID', 'ELEKTRO', 'LPG_CNG', 'ANDERE');--> statement-breakpoint
CREATE TYPE "public"."gearbox" AS ENUM('MANUELL', 'AUTOMATIK');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('PENDING', 'SENT', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."service_book" AS ENUM('JA', 'TEILWEISE', 'NEIN');--> statement-breakpoint
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
	"notification_status" "notification_status" DEFAULT 'PENDING' NOT NULL,
	"notification_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "rate_limits_key_window_start_pk" PRIMARY KEY("key","window_start")
);
--> statement-breakpoint
CREATE INDEX "leads_notification_status_created_at_index" ON "leads" USING btree ("notification_status","created_at");--> statement-breakpoint
CREATE INDEX "leads_created_at_index" ON "leads" USING btree ("created_at");