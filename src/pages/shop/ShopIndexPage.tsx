import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/ui/button";
import { InfoHint } from "@/components/marketing/InfoHint";
import { SolutionMark } from "@/components/brand/SolutionMark";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { COA_CONFIRMED } from "@/config";
import { SOLUTIONS, type Solution } from "@/data/solutions";
import { useLanguage } from "@/i18n/useLanguage";
import { formatPriceEur } from "@/lib/format";

function SolutionCard({ s }: { s: Solution }) {
  const { t } = useTranslation("shop");
  const { t: tc } = useTranslation("conditions");
  const { language } = useLanguage();
  const problems = s.conditionKeys
    .map((k) => tc(`${k}.shortTitle`))
    .join(" · ");

  return (
    <div className="relative">
      <Link
        to={paths.shopProduct(s.id)}
        className="group glass glass-hover flex h-full flex-col rounded-2xl md:rounded-3xl bg-gradient-to-b from-petrol-100 to-white p-5"
      >
        {/* Same layout as the Solution-page hero (badge inline with the name),
            on the light card surface rather than the brand gradient. */}
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-medium text-petrol-700">
            {t(`solutions.${s.id}.category`)}
          </span>
          {COA_CONFIRMED ? (
            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-petrol-700">
              {t("solution.labTestedBadge")}
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex items-center gap-4">
          <SolutionMark
            solution={s}
            variant="badge"
            className="size-14 shrink-0 transition-transform duration-300 group-hover:scale-[1.04]"
          />
          <p className="font-display text-2xl font-bold leading-tight text-ink">
            {s.name}
          </p>
        </div>
        <p className="mt-2 text-sm text-ink-muted">
          {t(`solutions.${s.id}.blurb`)}
        </p>
        <p className="mt-1 text-xs text-ink-muted">
          {t("card.forProblems", { problems })}
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          {t("solution.thcRangeLabel")}:{" "}
          <span className="font-mono text-ink">{s.thcRange}</span>
        </p>
        <p className="mt-3 font-mono text-lg text-ink">
          {t("card.pricePerGram", {
            price: formatPriceEur(s.priceEur, language),
          })}
        </p>
        <span className="mt-3 text-sm font-medium text-petrol-700 group-hover:underline">
          {t("card.learnMore")}
        </span>
      </Link>

      {/* Prescription-only note — the standard hover/focus info icon, top-right.
          Rendered outside the <Link> so its trigger stays a valid button and a
          click on it doesn't navigate. */}
      <InfoHint
        align="right"
        label={t("solution.prescriptionBadge")}
        className="absolute right-4 top-4"
      >
        {t("solution.prescriptionBadge")}
      </InfoHint>
    </div>
  );
}

export function ShopIndexPage() {
  const { t } = useTranslation("shop");
  usePageTitle(t("index.title"), undefined, { noindex: true });

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1>{t("index.title")}</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-muted">{t("index.intro")}</p>

      {/* The guided path is the assessment — this grid is reference only. */}
      <div className="glass-strong mt-8 flex flex-col gap-4 rounded-2xl md:rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <p className="font-display text-lg text-ink">{t("index.guideTitle")}</p>
          <p className="mt-1 text-sm text-ink-muted">{t("index.guideBody")}</p>
        </div>
        <Button asChild variant="cta" size="lg" className="w-full sm:w-auto sm:shrink-0">
          <Link to={paths.assessment.start}>{t("index.startAssessment")}</Link>
        </Button>
      </div>

      <h2 className="mt-12 text-lg">{t("index.fullRange")}</h2>
      <p className="mt-1 text-sm text-ink-muted">
        {t("index.resultCount", { count: SOLUTIONS.length })}
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SOLUTIONS.map((s) => (
          <SolutionCard key={s.id} s={s} />
        ))}
      </div>
    </div>
  );
}
