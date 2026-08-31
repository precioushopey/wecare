import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/app/components/ui/utils";
import { THEMES, type Theme } from "@/theme/theme";
import { useTheme } from "@/theme/useTheme";

const ICON: Record<Theme, typeof Sun> = { light: Sun, dark: Moon };

/** Compact Light / Dark switch. Sits next to `LanguageToggle` in the header
 *  and footer. Light is the default; a choice persists to `wecare.theme`. */
export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label={t("theme.label")}
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-surface-raised p-0.5",
        className,
      )}
    >
      {THEMES.map((value) => {
        const Icon = ICON[value];
        const active = value === theme;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={active}
            aria-label={t("theme.switchTo", { theme: t(`theme.${value}`) })}
            className={cn(
              "flex size-7 items-center justify-center rounded-full transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-ink-muted hover:text-ink",
            )}
          >
            <Icon className="size-3.5" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
