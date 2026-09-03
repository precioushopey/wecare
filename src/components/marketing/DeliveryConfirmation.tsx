import { useTranslation } from "react-i18next";
import { Truck } from "lucide-react";

import { cn } from "@/app/components/ui/utils";
import type { RegionKey } from "@/features/delivery/delivery";

/** One muted line confirming the delivery area. Shown on the postcode step,
 *  the result page and the checkout page. */
export function DeliveryConfirmation({
  postcode,
  region,
  className,
}: {
  postcode: string;
  region: RegionKey | null;
  className?: string;
}) {
  const { t } = useTranslation("assessment");
  const { t: tCommon } = useTranslation();

  const regionLabel = region
    ? t(`regions.${region}`)
    : tCommon("delivery.regionUnknown");

  return (
    <p
      className={cn(
        "flex items-start gap-2 text-sm text-ink-muted",
        className,
      )}
    >
      <Truck className="mt-0.5 size-4 shrink-0 text-petrol-600" aria-hidden />
      <span>
        {tCommon("delivery.confirmLine", { postcode, region: regionLabel })}
      </span>
    </p>
  );
}
