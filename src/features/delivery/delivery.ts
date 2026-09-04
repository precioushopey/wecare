/**
 * Delivery-area check for the assessment's postcode step.
 *
 * BACKEND DEVS: `isServiceableAt` currently returns `true` for **every** valid
 * Austrian postcode — there is no real coverage data. This is a placeholder for
 * the reassurance moment ("yes, we deliver to your area"), not a real gate.
 * Replace with the fulfilment partner's actual serviceable postcodes / regions
 * (PO data request, Sept 2026; `docs/DESIGN-SPECIFICATION.md` BE-08). Kept as a
 * function so a real coverage table slots in without touching call sites. No
 * network calls, no dependencies.
 */

/** Exactly four digits, first digit 1-9 (Austrian postcodes are 1000-9992). */
export const AT_POSTCODE_RE = /^[1-9]\d{3}$/;

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
  return AT_POSTCODE_RE.test(postcode);
}
