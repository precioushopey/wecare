import { useTranslation } from "react-i18next";
import { Truck } from "lucide-react";

import { cn } from "@/app/components/ui/utils";
import { countryForPostcode, type RegionKey } from "@/features/delivery/delivery";

/** One muted line confirming the delivery area. Shown on the postcode step,
 *  the result page and the checkout page. */
export function DeliveryConfirmation({
  postcode,
  region,
  city,
  className,
}: {
  postcode: string;
  region: RegionKey | null;
  /** A city the visitor typed (checkout). Wins over the region / country form,
   *  so a German postcode reads "10107 Berlin" instead of "(Deutschland)". */
  city?: string;
  className?: string;
}) {
  const { t } = useTranslation("assessment");
  const { t: tCommon } = useTranslation();

  // German postcodes have no region/city table, so they get the country form
  // ("10107 (Deutschland)") instead of a made-up city.
  const typedCity = city?.trim() ?? "";
  const isGermany = !typedCity && !region && countryForPostcode(postcode) === "DE";
  const regionLabel = typedCity
    ? typedCity
    : region
    ? t(`regions.${region}`)
    : tCommon("delivery.regionUnknown");

  return (
    <p
      className={cn(
        "flex items-start gap-2 text-sm md:text-base text-ink-muted",
        className,
      )}
    >
      <Truck className="mt-0.5 size-4 shrink-0 text-petrol-600" aria-hidden />
      <span>
        {isGermany
          ? tCommon("delivery.confirmLineCountry", { postcode })
          : tCommon("delivery.confirmLine", { postcode, region: regionLabel })}
      </span>
    </p>
  );
}
