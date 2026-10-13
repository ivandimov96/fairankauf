import { parsePhoneNumberFromString } from "libphonenumber-js/min";

/** "+4915112345678" → "+49 151 12345678" (falls back to the input). */
export function formatPhone(e164: string): string {
  return parsePhoneNumberFromString(e164)?.formatInternational() ?? e164;
}

/** One-tap WhatsApp chat link. wa.me wants digits only, no "+". */
export function waMeLink(e164: string): string {
  return `https://wa.me/${e164.replace(/\D/g, "")}`;
}
