import type { SolutionId } from "./solutions";

/**
 * Target data model for the full fulfilment layer — owner decision #8, PO
 * decision set 3 (Sept 2026): "architect now; populate/integrate once real
 * pharmacy data (D10/D11) lands; keep the launch UI simple." Hierarchy:
 * `Solution → FulfillmentFormat → DispensingOption`.
 *
 * These types are **not wired into any component yet**. The app still runs
 * on the simpler `Product` / `ProductFormat` model in `products.ts` (flower
 * vs. device, grouped inline in `ProductPage`'s accordion) — deliberately,
 * so the launch UI stays simple and nothing here gets populated with
 * placeholder data dressed up as a real schema. This file exists so that
 * when real pharmacy integration starts, the change is "map real data onto
 * an already-designed shape," not "redesign the shape under deadline."
 *
 * "Oil" is listed because the founder-spec oil formulation
 * (`Solution.oilFormulation`) is conceptually a format already, even though
 * there's no dispensable oil `Product` yet — see `products.ts`.
 */
export type FulfillmentFormatKind = "flower" | "oil" | "device";

export interface FulfillmentFormat {
  solutionId: SolutionId;
  format: FulfillmentFormatKind;
  options: DispensingOption[];
}

export interface DispensingOption {
  /** Stable product identifier — today, a `Product.id` from products.ts. */
  productId: string;
  /** Commercial / brand name shown to the customer. */
  commercialName: string;
  manufacturer: string;
  /** Which pharmacy/dispensing partner supplies this option. `null` until
   *  D10 real partner data exists — never an invented pharmacy name. */
  pharmacyId: string | null;
  format: FulfillmentFormatKind;
  unitType: "g" | "unit";
  thcPercent: number;
  cbdPercent: number;
  /** e.g. "10 g jar", "1 device" — `null` until real packaging data exists. */
  packSize: string | null;
  priceEur: number;
  /** Stock/availability isn't modelled anywhere in the app today — this is
   *  the field it will live on once it is. */
  available: boolean;
  batch: string | null;
  coa: {
    cbd: string;
    cbg: string;
    cbn: string;
    thc: string;
    testedOn: string;
  } | null;
  /**
   * Owner decision #7 — the actual eligibility gate for belonging to a
   * Solution. NOT `thcPercent` falling inside the Solution's *descriptive*
   * `thcRange` ("Typical THC range") — whether the medical/pharmacy partner
   * has approved this option as fitting the Solution's profile.
   *
   * Owner decision #5, PO decision set 4 (Sept 2026): a dispensing option's
   * suitability isn't decided from its own specs (e.g. "5 % THC / 5 % CBD
   * must mean it fits") — it's a status the medical/pharmacy partner sets,
   * per Solution it's listed under. One option may be `approved` for more
   * than one Solution (or none) — dual/multi-mapping is architecturally
   * fine; what's actually confirmed is what's unconfirmed until they say so.
   */
  mappingStatus: "pending_medical_validation" | "approved" | "rejected";
  active: boolean;
}
