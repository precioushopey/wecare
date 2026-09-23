import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { PageShell } from "@/components/marketing/PageShell";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { COMMERCE_ENABLED, PRICES_CONFIRMED } from "@/config";
import { getProductImage } from "@/data/products";
import { solutionHeroStrain, SOLUTION_BY_ID } from "@/data/solutions";
import { useCart } from "@/features/cart/CartContext";
import { useLanguage } from "@/i18n/useLanguage";
import { formatPriceEur } from "@/lib/format";

export function CartPage() {
  const { t } = useTranslation("shop");
  const { language } = useLanguage();
  const { items, setQuantity, remove, subtotalEur, hasPrescriptionItem } =
    useCart();

  usePageTitle(t("cart.title"), undefined, { noindex: true });

  if (items.length === 0) {
    return (
      <PageShell maxWidth="max-w-2xl" className="py-10 text-center">
        <p className="text-ink-muted">{t("cart.empty")}</p>
        <Button asChild variant="cta" className="mt-6 w-full sm:w-auto">
          <Link to={paths.assessment.result}>{t("cart.emptyCta")}</Link>
        </Button>
      </PageShell>
    );
  }

  return (
    <PageShell className="py-10">
      <ul className="divide-y divide-white/40 rounded-2xl md:rounded-3xl glass-strong">
        {items.map((item) => {
          const s = SOLUTION_BY_ID[item.productId];
          const step = 5;
          return (
            <li
              key={item.productId}
              className="flex flex-wrap items-center gap-4 p-4"
            >
              {/* Real product photo, matching the shop grid / product page
                  (owner instruction, 2026-09-14). Both photo and name link
                  back to the Solution's own page — the cart was otherwise a
                  dead end for going back to review its details. */}
              <Link
                to={paths.shopProduct(item.productId)}
                className="flex min-w-0 flex-1 items-center gap-4"
              >
                <ImageWithFallback
                  src={getProductImage(solutionHeroStrain(s))}
                  alt=""
                  className="size-16 shrink-0 rounded-xl bg-sage-50/70 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg md:text-xl text-ink hover:underline">
                    {s.name}
                  </p>
                  <p className="text-sm md:text-base text-ink-muted">
                    {t("cart.grams", { count: item.quantity })}
                  </p>
                </div>
              </Link>

              <div className="inline-flex items-center rounded-full border border-border">
                <button
                  type="button"
                  aria-label={t("cart.decrease")}
                  onClick={() =>
                    setQuantity(
                      item.productId,
                      Math.max(step, item.quantity - step),
                    )
                  }
                  className="p-2 text-ink-muted hover:text-ink"
                >
                  <Minus className="size-4" aria-hidden />
                </button>
                <span className="w-12 text-center font-mono text-sm md:text-base">
                  {item.quantity} g
                </span>
                <button
                  type="button"
                  aria-label={t("cart.increase")}
                  onClick={() =>
                    setQuantity(item.productId, item.quantity + step)
                  }
                  className="p-2 text-ink-muted hover:text-ink"
                >
                  <Plus className="size-4" aria-hidden />
                </button>
              </div>

              {COMMERCE_ENABLED ? (
                <p className="w-24 text-right font-mono text-sm md:text-base text-ink">
                  {formatPriceEur(s.priceEur * item.quantity, language)}
                </p>
              ) : null}

              <button
                type="button"
                aria-label={t("cart.remove")}
                onClick={() => remove(item.productId)}
                className="p-2 text-ink-muted hover:text-danger-600"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>

      {COMMERCE_ENABLED ? (
        <dl className="mt-6 space-y-2 text-sm md:text-base">
          <div className="flex justify-between">
            <dt className="text-ink-muted">{t("cart.subtotal")}</dt>
            <dd className="font-mono text-ink">
              {formatPriceEur(subtotalEur, language)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">{t("cart.shipping")}</dt>
            <dd className="text-ink">{t("cart.shippingFree")}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base md:text-lg">
            <dt className="font-medium text-ink">{t("cart.total")}</dt>
            <dd className="font-mono font-medium text-ink">
              {formatPriceEur(subtotalEur, language)}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="mt-6 rounded-xl bg-sage-50 p-4 text-sm md:text-base text-petrol-700">
          {t("cart.finalPriceNote")}
        </p>
      )}

      {COMMERCE_ENABLED && hasPrescriptionItem ? (
        <p className="mt-4 rounded-xl bg-sage-50 p-4 text-sm md:text-base text-petrol-700">
          {t(
            PRICES_CONFIRMED
              ? "cart.prescriptionNotice"
              : "cart.priceAndPrescriptionNotice",
          )}
        </p>
      ) : COMMERCE_ENABLED && !PRICES_CONFIRMED ? (
        <p className="mt-4 text-sm md:text-base text-ink-muted">{t("pricesIndicative")}</p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button asChild variant="cta" className="w-full sm:w-auto">
          <Link to={paths.checkout}>{t("cart.continue")}</Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link to={paths.assessment.result}>{t("cart.continueShopping")}</Link>
        </Button>
      </div>
    </PageShell>
  );
}
