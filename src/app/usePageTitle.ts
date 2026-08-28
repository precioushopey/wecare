import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * Sets `document.title` to `"<title> · WeCare"` (or just "WeCare" when no title
 * is given). react-router library mode has no built-in title management.
 */
export function usePageTitle(title?: string): void {
  const { t } = useTranslation();

  useEffect(() => {
    const brand = t("brand.name");
    document.title = title ? `${title} · ${brand}` : brand;
  }, [title, t]);
}
