import type { DeliveryCountry } from "./country";

/**
 * Delivery-area check for the assessment's postcode step.
 *
 * `isServiceableAt` returns `true` for every valid Austrian (4-digit) or German
 * (5-digit) postcode — Germany was added on Mischa's instruction, 2026-09-24
 * ("Germany is wanted to market too"). This is the reassurance moment ("yes, we
 * deliver to your area"), not a real gate, and there is no coverage data yet. It
 * is a function so the fulfilment partner's real serviceable postcodes / regions
 * slot in without touching call sites. No network calls.
 */

/** Exactly four digits, first digit 1-9 (Austrian postcodes are 1000-9992). */
export const AT_POSTCODE_RE = /^[1-9]\d{3}$/;

/** Exactly five digits (German PLZ run 01001-99998; a leading 0 is valid). */
export const DE_POSTCODE_RE = /^\d{5}$/;

/** Four digits = Austria, five digits = Germany; anything else isn't a postcode. */
export function countryForPostcode(postcode: string): DeliveryCountry | undefined {
  if (AT_POSTCODE_RE.test(postcode)) return "AT";
  if (DE_POSTCODE_RE.test(postcode)) return "DE";
  return undefined;
}

/** Is `postcode` valid for `country`? */
export function isValidPostcode(postcode: string, country: DeliveryCountry): boolean {
  return (country === "DE" ? DE_POSTCODE_RE : AT_POSTCODE_RE).test(postcode);
}

export type RegionKey =
  | "wien"
  | "niederoesterreich"
  | "oberoesterreich"
  | "salzburg"
  | "tirolVorarlberg"
  | "burgenland"
  | "steiermark"
  | "kaernten";

/** Leading digit → federal state. 6xxx spans Tyrol *and* Vorarlberg, so it
 *  maps to the combined key. Region names resolve via
 *  `assessment:regions.<key>`. */
const REGION_BY_LEADING_DIGIT: Record<string, RegionKey> = {
  "1": "wien",
  "2": "niederoesterreich",
  "3": "niederoesterreich",
  "4": "oberoesterreich",
  "5": "salzburg",
  "6": "tirolVorarlberg",
  "7": "burgenland",
  "8": "steiermark",
  "9": "kaernten",
};

export function regionForPostcode(postcode: string): RegionKey | undefined {
  if (!AT_POSTCODE_RE.test(postcode)) return undefined;
  return REGION_BY_LEADING_DIGIT[postcode[0]];
}

export function isServiceableAt(postcode: string): boolean {
  return countryForPostcode(postcode) !== undefined;
}
