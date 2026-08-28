import type { ConditionKey } from "@/features/conditions/conditions";

import {
  getProductCoa,
  getProductImage,
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
  /** display range, e.g. "20–24 %" */
  thcRange: string;
  /**
   * Intended CBD-oil "starting format" profile, from the founder spec (the
   * WeCare origin thread). The product actually dispensed is medical-cannabis
   * flower — that is what the COA covers (`solutionExampleCoa`). This profile
   * describes the controlled oil format the Result page frames as the place to
   * start (the gentle-first nudge). Percentages are of the full-spectrum
   * extract; `null` = not a lead cannabinoid for this solution.
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
  /** EUR per gram (the WeCare solution price) */
  priceEur: number;
  /** strain that represents the solution (photo, example COA) */
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
    strainIds: [
      "slouu-berry-arctic-gelato",
      "zoiks-tangrini",
      "curaleaf-inhaler",
    ],
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
    strainIds: [
      "iuvo-temptation",
      "iuvo-ice-burn",
      "zoiks-tangrini",
      "siggis-waldmeister",
      "siggis-pfefferminze",
      "tannenbusch-tubitti-frubitti",
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

export function solutionImage(s: Solution): string | undefined {
  return getProductImage(solutionHeroStrain(s));
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
