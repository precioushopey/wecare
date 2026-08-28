import type { ConditionKey } from "@/features/conditions/conditions";

import { productImage } from "./productImages";

/**
 * WeCare product catalogue — built from the real product photos in
 * `src/assets/products/`. All items are prescription-only medical cannabis and
 * only ever surface AFTER the assessment (never in nav / homepage / landing
 * pages). Genetics, prices, origin and COA values are placeholders pending
 * real pharmacy data.
 */

/** Product ids are plain slugs now (real catalogue). */
export type ProductId = string;
export type ProductFormat = "flower" | "inhaler";
export type Genetics = "indica" | "sativa" | "hybrid";

export interface Product {
  id: string;
  brand: string;
  /** strain name; "" for non-flower */
  strain: string;
  /** display name */
  name: string;
  format: ProductFormat;
  genetics: Genetics | null;
  thcPercent: number;
  cbdPercent: number; // < 1 rendered as "< 1 %"
  /** EUR — per gram for flower, per unit for inhaler */
  priceEur: number;
  /** "g" | "Stk." resolved via i18n; kept structural here */
  unit: "g" | "unit";
  originCountry: string;
  irradiated: boolean;
  requiresPrescription: true;
  primaryConditionKey: ConditionKey;
  imageFile: string;
}

const RAW: Omit<Product, "requiresPrescription">[] = [
  {
    id: "curaleaf-inhaler",
    brand: "Curaleaf",
    strain: "",
    name: "Medical Grade Inhaler",
    format: "inhaler",
    genetics: null,
    thcPercent: 5,
    cbdPercent: 5,
    priceEur: 59,
    unit: "unit",
    originCountry: "Kanada",
    irradiated: false,
    primaryConditionKey: "migraine",
    imageFile: "1x Curaleaf Medical Grade Inhaler.png",
  },
  {
    id: "c420-platinum-pave",
    brand: "420 Compound",
    strain: "Platinum Pavé",
    name: "Platinum Pavé",
    format: "flower",
    genetics: "indica",
    thcPercent: 27,
    cbdPercent: 0.9,
    priceEur: 9.4,
    unit: "g",
    originCountry: "Kanada",
    irradiated: true,
    primaryConditionKey: "pain",
    imageFile: "420 Compound (27_1) PPE - Platinum Pavé.png",
  },
  {
    id: "c420-berlin-berries",
    brand: "420 Compound",
    strain: "Berlin Berries",
    name: "Berlin Berries",
    format: "flower",
    genetics: "hybrid",
    thcPercent: 30,
    cbdPercent: 0.9,
    priceEur: 9.9,
    unit: "g",
    originCountry: "Kanada",
    irradiated: true,
    primaryConditionKey: "sleep",
    imageFile: "420 Compound (30_1) BER - Berlin Berries.png",
  },
  {
    id: "avaay-amnesia-haze-cake",
    brand: "AVAAY",
    strain: "Amnesia Haze Cake",
    name: "Amnesia Haze Cake",
    format: "flower",
    genetics: "sativa",
    thcPercent: 32,
    cbdPercent: 0.9,
    priceEur: 10.4,
    unit: "g",
    originCountry: "Portugal",
    irradiated: true,
    primaryConditionKey: "stressAnxiety",
    imageFile: "AVAAY (32_1) AHC - Amnesia Haze Cake.png",
  },
  {
    id: "demecan-first-class-funk",
    brand: "Demecan",
    strain: "First Class Funk",
    name: "First Class Funk",
    format: "flower",
    genetics: "hybrid",
    thcPercent: 26,
    cbdPercent: 0.9,
    priceEur: 8.9,
    unit: "g",
    originCountry: "Deutschland",
    irradiated: true,
    primaryConditionKey: "pain",
    imageFile: "Demecan (26_1) FCF - First Class Funk.png",
  },
  {
    id: "demecan-craft-walkie-talkie",
    brand: "Demecan Craft",
    strain: "Walkie Talkie",
    name: "Walkie Talkie",
    format: "flower",
    genetics: "indica",
    thcPercent: 27,
    cbdPercent: 0.9,
    priceEur: 10.9,
    unit: "g",
    originCountry: "Deutschland",
    irradiated: false,
    primaryConditionKey: "sleep",
    imageFile: "Demecan Craft (27_1) - Walkie Talkie.png",
  },
  {
    id: "enua-g13-ultra",
    brand: "enua",
    strain: "G13 Ultra",
    name: "G13 Ultra",
    format: "flower",
    genetics: "indica",
    thcPercent: 27,
    cbdPercent: 0.9,
    priceEur: 9.4,
    unit: "g",
    originCountry: "Deutschland",
    irradiated: true,
    primaryConditionKey: "sleep",
    imageFile: "enua (27_1) E85 - G13 Ultra.png",
  },
  {
    id: "enua-best-cap",
    brand: "enua",
    strain: "Best Cap",
    name: "Best Cap",
    format: "flower",
    genetics: "hybrid",
    thcPercent: 30,
    cbdPercent: 0.9,
    priceEur: 9.9,
    unit: "g",
    originCountry: "Deutschland",
    irradiated: true,
    primaryConditionKey: "stressAnxiety",
    imageFile: "enua (30_1) BC - Best Cap.png",
  },
  {
    id: "enua-purps-crystal-breath",
    brand: "enua",
    strain: "Purps Crystal Breath",
    name: "Purps Crystal Breath",
    format: "flower",
    genetics: "indica",
    thcPercent: 33,
    cbdPercent: 0.9,
    priceEur: 10.9,
    unit: "g",
    originCountry: "Deutschland",
    irradiated: true,
    primaryConditionKey: "pain",
    imageFile: "enua (33_1) PCB - Purps Crystal Breath.png",
  },
  {
    id: "huala-goldkirsch",
    brand: "Huala",
    strain: "Goldkirsch",
    name: "Goldkirsch",
    format: "flower",
    genetics: "indica",
    thcPercent: 30,
    cbdPercent: 0.9,
    priceEur: 9.9,
    unit: "g",
    originCountry: "Deutschland",
    irradiated: true,
    primaryConditionKey: "sleep",
    imageFile: "Huala (30_1) GK - Goldkirsch.png",
  },
  {
    id: "iuvo-ice-burn",
    brand: "IUVO",
    strain: "Ice Burn",
    name: "Ice Burn",
    format: "flower",
    genetics: "hybrid",
    thcPercent: 24,
    cbdPercent: 0.9,
    priceEur: 8.4,
    unit: "g",
    originCountry: "Portugal",
    irradiated: true,
    primaryConditionKey: "migraine",
    imageFile: "IUVO 24_1 OC ICE BURN.png",
  },
  {
    id: "iuvo-temptation",
    brand: "IUVO OC",
    strain: "Temptation",
    name: "Temptation",
    format: "flower",
    genetics: "hybrid",
    thcPercent: 24,
    cbdPercent: 0.9,
    priceEur: 8.4,
    unit: "g",
    originCountry: "Portugal",
    irradiated: true,
    primaryConditionKey: "stressAnxiety",
    imageFile: "IUVO OC (24_1) - Temptation.png",
  },
  {
    id: "iuvo-neutronium",
    brand: "IUVO OC",
    strain: "Neutronium",
    name: "Neutronium",
    format: "flower",
    genetics: "indica",
    thcPercent: 28,
    cbdPercent: 0.9,
    priceEur: 9.4,
    unit: "g",
    originCountry: "Portugal",
    irradiated: true,
    primaryConditionKey: "pain",
    imageFile: "IUVO OC (28_1) - Neutronium.png",
  },
  {
    id: "peace-sonic-lemon-fuel",
    brand: "Peace Naturals",
    strain: "Sonic Lemon Fuel",
    name: "Sonic Lemon Fuel",
    format: "flower",
    genetics: "sativa",
    thcPercent: 33,
    cbdPercent: 0.9,
    priceEur: 10.9,
    unit: "g",
    originCountry: "Kanada",
    irradiated: true,
    primaryConditionKey: "stressAnxiety",
    imageFile: "Peace Naturals (33_1) SL Sonic Lemon Fuel.png",
  },
  {
    id: "siggis-waldmeister",
    brand: "Siggis",
    strain: "Waldmeister",
    name: "Waldmeister",
    format: "flower",
    genetics: "hybrid",
    thcPercent: 28,
    cbdPercent: 0.9,
    priceEur: 9.4,
    unit: "g",
    originCountry: "Deutschland",
    irradiated: false,
    primaryConditionKey: "migraine",
    imageFile: "Siggis (28_1) WLDM - Siggis Waldmeister.png",
  },
  {
    id: "siggis-pfefferminze",
    brand: "Siggis",
    strain: "Pfefferminze",
    name: "Pfefferminze",
    format: "flower",
    genetics: "hybrid",
    thcPercent: 28,
    cbdPercent: 0.9,
    priceEur: 9.4,
    unit: "g",
    originCountry: "Deutschland",
    irradiated: false,
    primaryConditionKey: "migraine",
    imageFile: "Siggis PMNZ (28_1) - Siggis Pfefferminze.png",
  },
  {
    id: "tannenbusch-tubitti-frubitti",
    brand: "TANNENBUSCH",
    strain: "Tubitti Frubitti",
    name: "Tubitti Frubitti",
    format: "flower",
    genetics: "hybrid",
    thcPercent: 31,
    cbdPercent: 0.9,
    priceEur: 9.9,
    unit: "g",
    originCountry: "Deutschland",
    irradiated: true,
    primaryConditionKey: "migraine",
    imageFile: "TANNENBUSCH (31_1) TF - Tubitti Frubitti.png",
  },
  {
    id: "zoiks-tangrini",
    brand: "ZOIKS",
    strain: "Tangrini",
    name: "Tangrini",
    format: "flower",
    genetics: "sativa",
    thcPercent: 22,
    cbdPercent: 0.9,
    priceEur: 7.4,
    unit: "g",
    originCountry: "Kanada",
    irradiated: true,
    primaryConditionKey: "stressAnxiety",
    imageFile: "ZOIKS (22_1) TG - Tangrini.png",
  },
  {
    id: "slouu-berry-arctic-gelato",
    brand: "slouu",
    strain: "Berry Arctic Gelato",
    name: "Berry Arctic Gelato",
    format: "flower",
    genetics: "indica",
    thcPercent: 22,
    cbdPercent: 0.9,
    priceEur: 6.9,
    unit: "g",
    originCountry: "Kanada",
    irradiated: true,
    primaryConditionKey: "sleep",
    imageFile: "slouu (22_1) BAG - Berry Arctic Gelato (smalls).png",
  },
];

export const PRODUCTS: readonly Product[] = RAW.map((p) => ({
  ...p,
  requiresPrescription: true as const,
}));

export const PRODUCT_IDS = PRODUCTS.map((p) => p.id);

export const PRODUCT_BY_ID: Record<string, Product> = Object.fromEntries(
  PRODUCTS.map((p) => [p.id, p]),
);

export function isProductId(value: unknown): value is string {
  return typeof value === "string" && value in PRODUCT_BY_ID;
}

export function getProductImage(p: Product): string | undefined {
  return productImage(p.imageFile);
}

/** Full display name, e.g. "enua · G13 Ultra 27/1". */
export function productFullName(p: Product): string {
  if (p.format === "inhaler") return `${p.brand} ${p.name}`;
  return `${p.brand} · ${p.name} ${p.thcPercent}/${Math.max(1, Math.round(p.cbdPercent))}`;
}

export interface ProductCoa {
  thc: string;
  cbd: string;
  cbg: string;
  cbn: string;
  batch: string;
  testedOn: string;
}

/** Deterministic placeholder COA derived from the product. */
export function getProductCoa(p: Product): ProductCoa {
  let seed = p.thcPercent;
  for (const ch of p.id) seed += ch.charCodeAt(0);
  const month = (seed % 8) + 1;
  const day = ((seed * 7) % 27) + 1;
  return {
    thc: `${p.thcPercent} %`,
    cbd: p.cbdPercent < 1 ? "< 1 %" : `${p.cbdPercent} %`,
    cbg: `${(0.4 + (seed % 7) * 0.1).toFixed(1)} %`,
    cbn: `${(0.1 + (seed % 4) * 0.1).toFixed(1)} %`,
    batch: `${p.id.slice(0, 3).toUpperCase()}-26${String((seed % 9) + 1)}${String((seed % 5) + 1)}`,
    testedOn: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  };
}
