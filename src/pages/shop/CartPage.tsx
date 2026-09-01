import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Minus, Plus, Trash2 } from "lucide-react";

import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { PRICES_CONFIRMED } from "@/config";
import { JourneyStepper } from "@/components/marketing/JourneyStepper";
import { SOLUTION_BY_ID, solutionImage } from "@/data/solutions";
import { useCart } from "@/features/cart/CartContext";
import { useLanguage } from "@/i18n/useLanguage";
import { formatPriceEur } from "@/lib/format";

export function CartPage() {
  const { t } = useTranslation("shop");
  const { language } = useLanguage();
  const { items, setQuantity, remove, subtotalEur, hasPrescriptionItem } =
    useCart();
  usePageTitle(t("cart.title"));

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1>{t("cart.title")}</h1>
        <p className="mt-3 text-ink-muted">{t("cart.empty")}</p>
        <Button asChild variant="cta" className="mt-6">
          <Link to={paths.shop}>{t("cart.emptyCta")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <JourneyStepper current="product" className="mb-8" />
      <h1>{t("cart.title")}</h1>

      <ul className="mt-8 divide-y divide-white/40 rounded-3xl glass-strong dark:divide-white/20">
        {items.map((item) => {
          const s = SOLUTION_BY_ID[item.productId];
          const step = 5;
          return (
            <li
              key={item.productId}
              className="flex flex-wrap items-center gap-4 p-4"
            >
              <div className="image-glow size-14 shrink-0 rounded-lg">
                <ImageWithFallback
                  src={solutionImage(s)}
                  alt=""
                  className="size-full object-contain p-1"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg text-ink">{s.name}</p>
                <p className="text-sm text-ink-muted">
                  {t("cart.grams", { count: item.quantity })}
                </p>
              </div>

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
                <span className="w-12 text-center font-mono text-sm">
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

              <p className="w-24 text-right font-mono text-sm text-ink">
                {formatPriceEur(s.priceEur * item.quantity, language)}
              </p>

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

      <dl className="mt-6 space-y-2 text-sm">
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
        <div className="flex justify-between border-t border-border pt-2 text-base">
          <dt className="font-medium text-ink">{t("cart.total")}</dt>
          <dd className="font-mono font-medium text-ink">
            {formatPriceEur(subtotalEur, language)}
          </dd>
        </div>
      </dl>

      {!PRICES_CONFIRMED ? (
        <p className="mt-4 text-xs text-ink-muted">{t("pricesIndicative")}</p>
      ) : null}

      {hasPrescriptionItem ? (
        <p className="mt-4 rounded-xl bg-sage-50 p-4 text-sm text-petrol-700">
          {t("cart.prescriptionNotice")}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button asChild variant="cta" size="lg">
          <Link to={paths.checkout}>{t("cart.checkout")}</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to={paths.shop}>{t("cart.continueShopping")}</Link>
        </Button>
      </div>
    </div>
  );
}
