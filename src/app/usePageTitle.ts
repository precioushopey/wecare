import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * Sets `document.title` to `"<title> · WeCare"` (or just "WeCare" when no title
 * is given), and — when a `description` is passed — keeps
 * `<meta name="description">` in sync. react-router library mode has no
 * built-in document-head management.
 */
export function usePageTitle(title?: string, description?: string): void {
  const { t } = useTranslation();

  useEffect(() => {
    const brand = t("brand.name");
    document.title = title ? `${title} · ${brand}` : brand;
  }, [title, t]);

  useEffect(() => {
    if (!description || typeof document === "undefined") return;
    const el = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (!el) return;
    const previous = el.content;
    el.content = description;
    return () => {
      el.content = previous;
    };
  }, [description]);
}
