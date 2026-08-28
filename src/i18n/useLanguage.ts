import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import {
  DEFAULT_LANGUAGE,
  persistLanguage,
  SUPPORTED_LANGUAGES,
  type Language,
} from "./config";

interface UseLanguageResult {
  language: Language;
  languages: readonly Language[];
  setLanguage: (lng: Language) => void;
  toggle: () => void;
}

/**
 * Read + change the active locale. Persists to localStorage and syncs
 * <html lang>. DE <-> EN toggle per spec Section 12.
 */
export function useLanguage(): UseLanguageResult {
  const { i18n } = useTranslation();

  const current = i18n.language as Language;
  const language: Language = SUPPORTED_LANGUAGES.includes(current)
    ? current
    : DEFAULT_LANGUAGE;

  const setLanguage = useCallback(
    (lng: Language) => {
      if (lng === i18n.language) return;
      void i18n.changeLanguage(lng);
      persistLanguage(lng);
    },
    [i18n],
  );

  const toggle = useCallback(() => {
    setLanguage(language === "de" ? "en" : "de");
  }, [language, setLanguage]);

  return { language, languages: SUPPORTED_LANGUAGES, setLanguage, toggle };
}
