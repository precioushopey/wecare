import { useTranslation } from "react-i18next";

import { cn } from "@/app/components/ui/utils";
import { SUPPORTED_LANGUAGES } from "@/i18n/config";
import { useLanguage } from "@/i18n/useLanguage";

/** Compact DE / EN switch. Used in the header and footer (spec Section 12). */
export function LanguageToggle({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t("language.label")}
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-surface-raised p-0.5",
        className,
      )}
    >
      {SUPPORTED_LANGUAGES.map((lng) => {
        const active = lng === language;
        return (
          <button
            key={lng}
            type="button"
            onClick={() => setLanguage(lng)}
            aria-pressed={active}
            aria-label={t("language.switchTo", { language: t(`language.${lng}`) })}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-ink-muted hover:text-ink",
            )}
          >
            {t(`language.short.${lng}`)}
          </button>
        );
      })}
    </div>
  );
}
