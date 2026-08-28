import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/app/components/ui/utils";

/**
 * Standing medical-safety notice for pages that discuss medical cannabis
 * (condition landing pages, knowledge articles). Names common side effects,
 * states it doesn't replace a necessary standard therapy, and that site
 * content isn't individual medical advice.
 */
export function MedicalNotice({ className }: { className?: string }) {
  const { t } = useTranslation("common");

  return (
    <aside
      role="note"
      className={cn("glass rounded-3xl p-6 text-sm text-ink-muted", className)}
    >
      <div className="flex items-center gap-2 text-ink">
        <Info className="size-5 shrink-0 text-petrol-600" aria-hidden />
        <h2 className="text-base">{t("medicalNotice.heading")}</h2>
      </div>
      <p className="mt-3">{t("medicalNotice.body")}</p>
      <p className="mt-2">{t("medicalNotice.body2")}</p>
      <p className="mt-3 text-xs">{t("medicalNotice.disclaimer")}</p>
    </aside>
  );
}
