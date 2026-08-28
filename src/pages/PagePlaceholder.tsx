import { useTranslation } from "react-i18next";

import { usePageTitle } from "@/app/usePageTitle";

interface PagePlaceholderProps {
  /** i18n key for the page title. */
  titleKey: string;
  /** i18n key for a one-line description. */
  descriptionKey?: string;
}

/**
 * Temporary landing for a route that exists in the IA but whose real content
 * is built in a later phase. Replace the whole file when the phase lands.
 */
export function PagePlaceholder({
  titleKey,
  descriptionKey,
}: PagePlaceholderProps) {
  const { t } = useTranslation();
  usePageTitle(t(titleKey));

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-petrol-600">
        {t("brand.name")}
      </p>
      <h1 className="mt-3">{t(titleKey)}</h1>
      {descriptionKey ? (
        <p className="mt-4 text-lg text-ink-muted">{t(descriptionKey)}</p>
      ) : null}
      <p className="mt-10 text-sm text-ink-muted">{t("pages.placeholderNote")}</p>
    </div>
  );
}
