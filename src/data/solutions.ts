import type { ConditionKey } from "@/features/conditions/conditions";

import {
  getProductCoa,
  PRODUCT_BY_ID,
  type Product,
  type ProductCoa,
} from "./products";

/**
 * WeCare's five named solutions (guideline 2). These are the product layer the
 * user sees — abstract, wellness-brand names, NOT strain names. Each is
 * fulfilled by one or more real medical-cannabis strains (the `strainIds`,
 * photos + COA in products.ts) after the prescription. Solution → Product.
 */

export const SOLUTION_IDS = [
  "night-now",
  "calm-night",
  "deep-ease",
  "synergy-forte",
  "synergy-ultra",
] as const;

export type SolutionId = (typeof SOLUTION_IDS)[number];

export interface Solution {
  id: SolutionId;
  name: string;
  /** which of the 4 problems this solution serves */
  conditionKeys: ConditionKey[];
  /** relative position within a problem's pair */
  tier: "lighter" | "stronger";
  /**
   * Display range, e.g. "20–24 %" — shown to the user as "Typical THC range"
   * (`shop:solution.thcRangeLabel`). Owner decision #7, Sept 2026:
   * **descriptive metadata only, not the eligibility rule.** A Solution is
   * defined by the medical/pharmacy partner approving a dispensing option as
   * fitting its profile — not by whether a strain's THC % falls inside this
   * band. Don't gate `strainIds` membership, or reject/move a strain, on this
   * field alone; see docs/STRAIN-SOLUTION-MAPPING.md §7.
   */
  thcRange: string;
  /**
   * Intended CBD-oil "starting format" profile, from the founder spec (the
   * WeCare origin thread). The product actually dispensed is medical-cannabis
   * flower — that is what the COA covers (`solutionExampleCoa`). This profile
   * describes the controlled oil format the Result page frames as the place to
   * start (the gentle-first nudge). Percentages are of the full-spectrum
   * extract; `null` = not a lead cannabinoid for this solution.
   *
   * PROVISIONAL — owner decision #10, PO decision set 4 (Sept 2026): these
   * are founder-spec targets, not verified manufacturer/pharmacy
   * documentation (product name, carrier/base, full ingredient list,
   * batch/COA, regulatory classification). `shop:solution.oilFormulationProvisional`
   * carries this caveat in the UI — don't remove it or present these values
   * as a lab-confirmed formulation until real documentation exists.
   */
  oilFormulation: {
    /** headline strength of the full-spectrum extract, e.g. 13 → "13 %" */
    strengthPercent: number;
    cbd: string;
    cbg: string | null;
    cbn: string | null;
    /** Night Now adds melatonin */
    melatonin?: boolean;
  };
  /**
   * EUR per gram — a placeholder, gated by `PRICES_CONFIRMED` (`src/config.ts`)
   * everywhere it's shown, and kept only so cart/checkout math still works in
   * this backend-less build. NOT the target architecture: owner decision #1,
   * PO decision set 4 (Sept 2026) — price belongs on the `DispensingOption`
   * (`src/data/dispensing.ts`), since different products under the same
   * Solution can carry different real pharmacy prices. Don't treat this
   * per-Solution figure as more than a working stand-in; migrate pricing to
   * the dispensing layer once real pharmacy prices exist.
   */
  priceEur: number;
  /** strain used for the example COA on `/lab-tests` and the product page.
   *  NOT used for the Solution's visual identity — see `SolutionMark`
   *  (owner decision #4, Sept 2026: the Solution's hero must not be a
   *  specific strain). */
  heroStrainId: string;
  /** all strains that may be dispensed for this solution */
  strainIds: string[];
}

export const SOLUTIONS: readonly Solution[] = [
  {
    id: "night-now",
    name: "Night Now",
    conditionKeys: ["sleep"],
    tier: "lighter",
    thcRange: "20–24 %",
    oilFormulation: {
      strengthPercent: 13,
      cbd: "5 %",
      cbg: null,
      cbn: "5 %",
      melatonin: true,
    },
    priceEur: 7.9,
    heroStrainId: "slouu-berry-arctic-gelato",
    // `zoiks-tangrini` removed — owner decision #8, PO decision set 4 (Sept
    // 2026): not on a simplistic sativa=daytime rule, but because there
    // isn't currently enough validated evidence to present it as a Night Now
    // option. `curaleaf-inhaler` kept but rendered as an "alternative
    // dispensing format" (device, per-unit) — its dual mapping across Night
    // Now and Synergy Forte is architecturally fine (one DispensingOption can
    // map to multiple Solutions), but its actual suitability under either is
    // UNCONFIRMED pending the medical/pharmacy partner (owner decision #5).
    // See docs/STRAIN-SOLUTION-MAPPING.md.
    strainIds: ["slouu-berry-arctic-gelato", "curaleaf-inhaler"],
  },
  {
    id: "calm-night",
    name: "Calm Night",
    conditionKeys: ["sleep"],
    tier: "stronger",
    thcRange: "27–33 %",
    oilFormulation: {
      strengthPercent: 16,
      cbd: "4 %",
      cbg: null,
      cbn: "10 %",
    },
    priceEur: 9.9,
    heroStrainId: "huala-goldkirsch",
    strainIds: [
      "huala-goldkirsch",
      "c420-berlin-berries",
      "demecan-craft-walkie-talkie",
      "enua-g13-ultra",
    ],
  },
  {
    id: "deep-ease",
    name: "Deep Ease",
    conditionKeys: ["pain"],
    tier: "lighter",
    thcRange: "24–28 %",
    oilFormulation: {
      strengthPercent: 30,
      cbd: "4 %",
      cbg: "25 %",
      cbn: null,
    },
    priceEur: 9.9,
    heroStrainId: "demecan-first-class-funk",
    strainIds: [
      "demecan-first-class-funk",
      "iuvo-neutronium",
      "c420-platinum-pave",
      "iuvo-ice-burn",
    ],
  },
  {
    id: "synergy-forte",
    name: "Synergy Forte",
    conditionKeys: ["stressAnxiety", "migraine"],
    tier: "lighter",
    thcRange: "22–28 %",
    oilFormulation: {
      strengthPercent: 22,
      cbd: "10 %",
      cbg: "10 %",
      cbn: null,
    },
    priceEur: 8.9,
    heroStrainId: "iuvo-temptation",
    // `tannenbusch-tubitti-frubitti` (31 % THC) removed — marked UNMAPPED,
    // pending the medical/pharmacy partner approving it as fitting this
    // Solution's profile. Its 31 % sitting above the *displayed* 22–28 % band
    // is why it was first flagged, but per owner decision #7 (Sept 2026) THC %
    // is descriptive only and is not itself the reason to exclude or move it —
    // this stays UNMAPPED until there's an actual profile-fit decision from the
    // medical partner, not because "31 % doesn't fit the box". `curaleaf-inhaler`
    // kept as an alternative dispensing format (device). `zoiks-tangrini`
    // stays listed here but is PROVISIONAL ONLY, pending the same
    // medical-partner approval (owner decision #8, PO decision set 4, Sept
    // 2026) — it's excluded from Night Now (see that Solution's comment)
    // and not yet a confirmed Synergy Forte fit either. See
    // docs/STRAIN-SOLUTION-MAPPING.md.
    strainIds: [
      "iuvo-temptation",
      "iuvo-ice-burn",
      "zoiks-tangrini",
      "siggis-waldmeister",
      "siggis-pfefferminze",
      "curaleaf-inhaler",
    ],
  },
  {
    id: "synergy-ultra",
    name: "Synergy Ultra",
    conditionKeys: ["stressAnxiety", "pain"],
    tier: "stronger",
    thcRange: "30–33 %",
    oilFormulation: {
      strengthPercent: 32,
      cbd: "15 %",
      cbg: "15 %",
      cbn: null,
    },
    priceEur: 11.9,
    heroStrainId: "peace-sonic-lemon-fuel",
    strainIds: [
      "peace-sonic-lemon-fuel",
      "avaay-amnesia-haze-cake",
      "enua-purps-crystal-breath",
      "enua-best-cap",
    ],
  },
] as const;

export const SOLUTION_BY_ID: Record<SolutionId, Solution> = Object.fromEntries(
  SOLUTIONS.map((s) => [s.id, s]),
) as Record<SolutionId, Solution>;

export function isSolutionId(value: unknown): value is SolutionId {
  return (
    typeof value === "string" &&
    (SOLUTION_IDS as readonly string[]).includes(value)
  );
}

export function solutionHeroStrain(s: Solution): Product {
  return PRODUCT_BY_ID[s.heroStrainId];
}

/** Example COA — the hero strain's. Each delivery carries its own batch cert. */
export function solutionExampleCoa(s: Solution): ProductCoa {
  return getProductCoa(solutionHeroStrain(s));
}

export function solutionStrains(s: Solution): Product[] {
  return s.strainIds.map((id) => PRODUCT_BY_ID[id]).filter(Boolean);
}

/** Solutions offered for a given problem (used by the shop grid). */
export function solutionsForCondition(key: ConditionKey): Solution[] {
  return SOLUTIONS.filter((s) => s.conditionKeys.includes(key));
}
