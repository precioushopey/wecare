import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { SOLUTIONS, solutionImage, type Solution } from "@/data/solutions";
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
    <Link
      to={paths.shopProduct(s.id)}
      className="group glass glass-hover flex flex-col rounded-3xl p-4"
    >
      <div className="image-glow aspect-[4/3] overflow-hidden rounded-2xl">
        <ImageWithFallback
          src={solutionImage(s)}
          alt=""
          className="size-full object-contain p-4 drop-shadow-[0_18px_30px_rgba(13,68,75,0.22)] transition-transform group-hover:scale-105"
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="w-fit rounded-full bg-sage-100 px-2.5 py-0.5 text-xs font-medium text-petrol-700">
          {t(`solutions.${s.id}.category`)}
        </span>
        <span className="w-fit rounded-full bg-petrol-50 px-2.5 py-0.5 text-xs font-medium text-petrol-700 dark:bg-petrol-900/60">
          {t("solution.prescriptionBadge")}
        </span>
        <span className="w-fit rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-medium text-petrol-700 dark:bg-white/10">
          {t("solution.labTestedBadge")}
        </span>
      </div>
      <p className="mt-2 font-display text-lg text-ink">{s.name}</p>
      <p className="mt-1 text-sm text-ink-muted">{t(`solutions.${s.id}.blurb`)}</p>
      <p className="mt-1 text-xs text-ink-muted">
        {t("card.forProblems", { problems })}
      </p>
      <p className="mt-1 font-mono text-xs text-ink-muted">
        THC {s.thcRange}
      </p>
      <p className="mt-2 font-mono text-sm text-ink">
        {t("card.pricePerGram", {
          price: formatPriceEur(s.priceEur, language),
        })}
      </p>
      <span className="mt-2 text-sm font-medium text-petrol-700 group-hover:underline">
        {t("card.learnMore")}
      </span>
    </Link>
  );
}

export function ShopIndexPage() {
  const { t } = useTranslation("shop");
  usePageTitle(t("index.title"));

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1>{t("index.title")}</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-muted">{t("index.intro")}</p>

      {/* The guided path is the assessment — this grid is reference only. */}
      <div className="glass-strong mt-8 flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <p className="font-display text-lg text-ink">{t("index.guideTitle")}</p>
          <p className="mt-1 text-sm text-ink-muted">{t("index.guideBody")}</p>
        </div>
        <Button asChild variant="cta" size="lg" className="shrink-0">
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
