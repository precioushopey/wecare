import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { InfoHint } from "@/components/marketing/InfoHint";
import { PageHeader } from "@/components/marketing/PageHeader";
import { PageShell } from "@/components/marketing/PageShell";
import { PromptCard } from "@/components/marketing/PromptCard";
import { hasDashboardOrigin, paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { COA_CONFIRMED } from "@/config";
import { isConditionKey } from "@/features/conditions/conditions";
import { getProductImage } from "@/data/products";
import {
  solutionHeroStrain,
  solutionsForCondition,
  SOLUTIONS,
  type Solution,
} from "@/data/solutions";
import { useCart } from "@/features/cart/CartContext";
import { useLanguage } from "@/i18n/useLanguage";
import { formatPriceEur } from "@/lib/format";

function SolutionCard({
  s,
  dashboardOrigin,
}: {
  s: Solution;
  /** Carried forward from the catalog page (see `ShopIndexPage`'s own
   *  `dashboardOrigin`) so opening a card doesn't drop the dashboard chrome
   *  the visitor is already looking at. */
  dashboardOrigin: boolean;
}) {
  const { t } = useTranslation("shop");
  const { t: tc } = useTranslation("conditions");
  const { language } = useLanguage();
  const { items } = useCart();
  const problems = s.conditionKeys
    .map((k) => tc(`${k}.shortTitle`))
    .join(" · ");
  const cartQuantity =
    items.find((i) => i.productId === s.id)?.quantity ?? 0;

  return (
    <div className="relative">
      <Link
        to={
          dashboardOrigin
            ? paths.shopProductFromDashboard(s.id)
            : paths.shopProduct(s.id)
        }
        className="group glass glass-hover flex h-full flex-col overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-b from-petrol-100 to-white"
      >
        {/* Full-bleed catalog-style photo, not the abstract Solution medallion
            — "customer knows what he actually receives" (Mischa, 2026-09-09;
            same treatment as the Product page hero and dispensing-option
            tiles). Reversed from the Aug/Sept-2026 medallion-only rule on
            explicit owner instruction, 2026-09-14; sized up to a full catalog
            tile per owner follow-up the same day. */}
        <div className="aspect-square w-full overflow-hidden bg-sage-50/70">
          <ImageWithFallback
            src={getProductImage(solutionHeroStrain(s))}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-sage-100 px-3 py-1 text-sm md:text-base font-medium text-petrol-700">
              {t(`solutions.${s.id}.category`)}
            </span>
            {COA_CONFIRMED ? (
              <span className="rounded-full bg-white/70 px-3 py-1 text-sm md:text-base font-medium text-petrol-700">
                {t("solution.labTestedBadge")}
              </span>
            ) : null}
            {cartQuantity > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-petrol-700 px-3 py-1 text-sm md:text-base font-medium text-white">
                <Check className="size-3.5" aria-hidden />
                {t("solution.inCartBadge", { grams: cartQuantity })}
              </span>
            ) : null}
          </div>

          <p className="mt-3 font-display text-2xl md:text-3xl font-bold leading-tight text-ink">
            {s.name}
          </p>
          <p className="mt-2 text-sm md:text-base text-ink-muted">
            {t(`solutions.${s.id}.blurb`)}
          </p>
          <p className="mt-1 text-sm md:text-base text-ink-muted">
            {t("card.forProblems", { problems })}
          </p>
          <p className="mt-2 text-sm md:text-base text-ink-muted">
            {t("solution.thcRangeLabel")}:{" "}
            <span className="font-mono text-ink">{s.thcRange}</span>
          </p>
          <p className="mt-3 font-mono text-lg md:text-xl text-ink">
            {t("card.pricePerGram", {
              price: formatPriceEur(s.priceEur, language),
            })}
          </p>
          <span className="mt-3 text-sm md:text-base font-medium text-petrol-700 group-hover:underline">
            {t("card.learnMore")}
          </span>
        </div>
      </Link>

      {/* Prescription-only note — the standard hover/focus info icon, top-right
          over the photo now, so it gets its own frosted chip for contrast.
          Rendered outside the <Link> so its trigger stays a valid button and a
          click on it doesn't navigate. */}
      <InfoHint
        align="right"
        label={t("solution.prescriptionBadge")}
        className="absolute right-3 top-3 rounded-full bg-white/85 p-1 shadow-[var(--shadow-soft)] backdrop-blur-sm"
      >
        {t("solution.prescriptionBadge")}
      </InfoHint>
    </div>
  );
}

export function ShopIndexPage() {
  const { t } = useTranslation("shop");
  const { t: tc } = useTranslation("conditions");
  const [searchParams] = useSearchParams();

  // `?problem=<ConditionKey>` (same param the assessment start page reads) —
  // set by the "view more solutions" link on a non-matched Solution page, so
  // that link shows other options for the visitor's own issue instead of the
  // full 5-solution catalog.
  const problemParam = searchParams.get("problem");
  const problem = isConditionKey(problemParam) ? problemParam : null;
  const solutions = problem ? solutionsForCondition(problem) : SOLUTIONS;
  const dashboardOrigin = hasDashboardOrigin(searchParams);

  usePageTitle(t("index.title"), undefined, { noindex: true });

  return (
    <PageShell maxWidth="max-w-6xl">
      <PageHeader title={t("index.title")} />
      <p className="mt-3 max-w-2xl text-lg md:text-xl text-ink-muted">{t("index.intro")}</p>

      {/* The guided path is the assessment — this grid is reference only. */}
      <PromptCard
        title={t("index.guideTitle")}
        body={t("index.guideBody")}
        ctaLabel={t("index.startAssessment")}
        ctaTo={paths.assessment.start}
        tone="glass-strong"
        size="lg"
        className="mt-8"
      />

      <h2 className="mt-12 text-lg md:text-xl">
        {problem
          ? t("index.filteredHeading", { problem: tc(`${problem}.shortTitle`) })
          : t("index.fullRange")}
      </h2>
      <p className="mt-1 text-sm md:text-base text-ink-muted">
        {t("index.resultCount", { count: solutions.length })}
        {problem ? (
          <>
            {" · "}
            <Link
              to={dashboardOrigin ? paths.shopFromDashboard() : paths.shop}
              className="underline underline-offset-2 hover:text-ink"
            >
              {t("index.viewAllSolutions")}
            </Link>
          </>
        ) : null}
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {solutions.map((s) => (
          <SolutionCard key={s.id} s={s} dashboardOrigin={dashboardOrigin} />
        ))}
      </div>
    </PageShell>
  );
}
