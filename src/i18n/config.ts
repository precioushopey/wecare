import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import deCommon from "./locales/de/common.json";
import deHome from "./locales/de/home.json";
import deConditions from "./locales/de/conditions.json";
import deAssessment from "./locales/de/assessment.json";
import deDashboard from "./locales/de/dashboard.json";
import deShop from "./locales/de/shop.json";
import deFaq from "./locales/de/faq.json";
import deCosts from "./locales/de/costs.json";
import deLegal from "./locales/de/legal.json";
import enCommon from "./locales/en/common.json";
import enHome from "./locales/en/home.json";
import enConditions from "./locales/en/conditions.json";
import enAssessment from "./locales/en/assessment.json";
import enDashboard from "./locales/en/dashboard.json";
import enShop from "./locales/en/shop.json";
import enFaq from "./locales/en/faq.json";
import enCosts from "./locales/en/costs.json";
import enLegal from "./locales/en/legal.json";

export const SUPPORTED_LANGUAGES = ["de", "en"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

/** German is the default locale (Austria market first). No navigator auto-detect. */
export const DEFAULT_LANGUAGE: Language = "de";

const STORAGE_KEY = "wecare.language";

function isLanguage(value: unknown): value is Language {
  return value === "de" || value === "en";
}

function detectInitialLanguage(): Language {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLanguage(stored)) return stored;
  } catch {
    /* localStorage unavailable (private mode / blocked) — fall through */
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Namespaces are split by area so CMS/dynamic content stays translation-key
 * driven and isolated (spec Section 12). `common` holds nav / footer / shared.
 */
export const NAMESPACES = [
  "common",
  "home",
  "conditions",
  "assessment",
  "dashboard",
  "shop",
  "faq",
  "costs",
  "legal",
] as const;

export const resources = {
  de: {
    common: deCommon,
    home: deHome,
    conditions: deConditions,
    assessment: deAssessment,
    dashboard: deDashboard,
    shop: deShop,
    faq: deFaq,
    costs: deCosts,
    legal: deLegal,
  },
  en: {
    common: enCommon,
    home: enHome,
    conditions: enConditions,
    assessment: enAssessment,
    dashboard: enDashboard,
    shop: enShop,
    faq: enFaq,
    costs: enCosts,
    legal: enLegal,
  },
} as const;

void i18n.use(initReactI18next).init({
  resources,
  lng: detectInitialLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: SUPPORTED_LANGUAGES,
  defaultNS: "common",
  ns: NAMESPACES as unknown as string[],
  interpolation: {
    escapeValue: false, // React already escapes
  },
  returnNull: false,
});

/** BCP-47 tag for `<html lang>`. German is Austria-market (`de-AT`); the
 *  optional English toggle stays a plain `en` (not indexed). */
function htmlLang(lng: string): string {
  return lng === "de" ? "de-AT" : lng;
}

if (typeof document !== "undefined") {
  document.documentElement.lang = htmlLang(i18n.language);
}

/** Persist the chosen language and keep <html lang> in sync. */
export function persistLanguage(lng: Language): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* ignore */
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = htmlLang(lng);
  }
}

export default i18n;
