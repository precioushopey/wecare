import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { InfoHint } from "@/components/marketing/InfoHint";
import { JourneyStepper } from "@/components/marketing/JourneyStepper";
import { SolutionMark } from "@/components/brand/SolutionMark";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { COA_CONFIRMED, COMMERCE_ENABLED, PRICES_CONFIRMED } from "@/config";
import { getProductImage, type Product } from "@/data/products";
import {
  isSolutionId,
  SOLUTION_BY_ID,
  solutionExampleCoa,
  solutionStrains,
  type Solution,
} from "@/data/solutions";
import { useCart } from "@/features/cart/CartContext";
import { getMedicalReview } from "@/features/review/review";
import { useLanguage } from "@/i18n/useLanguage";
import { AnalyticsEvent, track } from "@/lib/analytics";
import { formatDate, formatPriceEur } from "@/lib/format";

const FAQ_KEYS = ["dosage", "driving", "delivery"] as const;

/** Primary action on the gradient hero — a solid-white pill (same as the
 *  Result page's recommendation card). */
const HERO_CTA_CLASS =
  "inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-white px-6 text-sm font-semibold text-petrol-800 shadow-[0_12px_30px_-14px_rgba(0,0,0,0.55)] transition-colors hover:bg-white/90 sm:w-auto";
/** Each option's badge, if any — guides a beginner instead of leaving four
 * bare numbers to weigh unaided (owner feedback, Aug 2026). Framed as order
 * size / common selection, never as a consumption or dosage recommendation —
 * that stays the prescribing doctor's call. */
const GRAM_OPTIONS: { value: number; badge?: "starter" | "recommended" | "popular" }[] = [
  { value: 5, badge: "starter" },
  { value: 10, badge: "recommended" },
  { value: 15 },
  { value: 30, badge: "popular" },
];

/**
 * One fulfilment option under a Solution. Simple by default — name, format,
 * the real THC value, and which Solution it's matched to; the rest sits behind
 * "View details". No plain-language "strength" descriptor (that needs the
 * medical partner to define and clear it), no terpene / CBG-CBN / cultivation
 * copy, no invented availability or "lab tested" claims (owner decision, Sept
 * 2026 — see docs/STRAIN-SOLUTION-MAPPING.md).
 */
function DispensingOption({
  strain,
  solution,
  thcRank,
}: {
  strain: Product;
  solution: Solution;
  /** Set only when it's factually the min / max THC among the flower options
   *  of this Solution — a neutral comparison, never a "stronger effect" claim. */
  thcRank?: "low" | "high";
}) {
  const { t } = useTranslation("shop");
  const { language } = useLanguage();
  const isDevice = strain.format !== "flower";
  const cbd = strain.cbdPercent < 1 ? "< 1 %" : `${strain.cbdPercent} %`;

  const rows: { label: string; value: string }[] = [
    ...(strain.genetics
      ? [
          {
            label: t("strain.specs.genetics"),
            value: t(`strain.types.${strain.genetics}`),
          },
        ]
      : []),
    { label: t("strain.specs.cbd"), value: cbd },
    { label: t("strain.specs.producer"), value: strain.brand },
    { label: t("strain.specs.origin"), value: strain.originCountry },
  ];

  return (
    <li className="rounded-2xl border border-white/50 bg-white/40 p-3">
      <div className="flex items-start gap-3">
        <ImageWithFallback
          src={getProductImage(strain)}
          alt=""
          className="size-14 shrink-0 rounded-xl bg-sage-50/70 object-contain p-1"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">
            {isDevice ? strain.name : `${strain.brand} · ${strain.name}`}
          </p>
          <p className="mt-0.5 text-xs text-ink-muted">
            {t(`strain.forms.${strain.format}`)} · {t("strain.specs.thc")}{" "}
            {strain.thcPercent} %
            {isDevice ? ` · ${t("strain.specs.cbd")} ${cbd}` : null}
          </p>
          {isDevice ? (
            <p className="mt-0.5 text-xs text-ink-muted">
              {t("solution.perDevice", {
                price: formatPriceEur(strain.priceEur, language),
              })}
              {!PRICES_CONFIRMED ? (
                <InfoHint className="ml-1" align="right">
                  {t("pricesIndicative")}
                </InfoHint>
              ) : null}
            </p>
          ) : null}
          <p className="mt-0.5 text-xs text-ink-muted">
            {t("solution.optMatchedTo", { name: solution.name })}
          </p>
          {thcRank ? (
            <p className="mt-0.5 text-xs text-ink-muted">
              {t(
                thcRank === "low"
                  ? "solution.optThcLower"
                  : "solution.optThcHigher",
              )}
            </p>
          ) : null}
        </div>
      </div>

      <details className="group mt-2">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-petrol-700 marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">
            {t("solution.optViewDetails")}
          </span>
          <span className="hidden group-open:inline">
            {t("solution.optHideDetails")}
          </span>
        </summary>
        <dl className="mt-2 grid gap-1 text-xs">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="text-ink-muted">{label}</dt>
              <dd className="text-right text-ink">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-ink-muted">
          {t("solution.optThcMeaning")}
        </p>
        <p className="mt-1 text-xs text-ink-muted">{t("solution.optCoaNote")}</p>
      </details>
    </li>
  );
}

export function ProductPage() {
  const { productId } = useParams();
  const { t } = useTranslation("shop");
  const { t: tc } = useTranslation("conditions");
  const { language } = useLanguage();
  const { add } = useCart();
  const navigate = useNavigate();

  const solution = isSolutionId(productId) ? SOLUTION_BY_ID[productId] : null;
  usePageTitle(solution?.name, undefined, { noindex: true });

  // Ordering is gated on an approved medical review (PO decision B1).
  const reviewApproved = getMedicalReview()?.status === "approved";

  const [grams, setGrams] = useState(10);

  const viewedId = solution?.id;
  useEffect(() => {
    if (viewedId) track(AnalyticsEvent.productViewed, { solution: viewedId });
  }, [viewedId]);

  if (!solution) {
    return <Navigate to={paths.shop} replace />;
  }

  const coa = solutionExampleCoa(solution);
  const strains = solutionStrains(solution);
  const flowerOptions = strains.filter((s) => s.format === "flower");
  const deviceOptions = strains.filter((s) => s.format !== "flower");
  const flowerThc = flowerOptions.map((s) => s.thcPercent);
  const flowerThcMin = flowerThc.length ? Math.min(...flowerThc) : 0;
  const flowerThcMax = flowerThc.length ? Math.max(...flowerThc) : 0;
  const problems = solution.conditionKeys
    .map((k) => tc(`${k}.shortTitle`))
    .join(" · ");

  const coaValues = [
    { key: "cbd", value: coa.cbd },
    { key: "cbg", value: coa.cbg },
    { key: "cbn", value: coa.cbn },
    { key: "thc", value: coa.thc },
  ];

  const f = solution.oilFormulation;
  const formulationRows: { label: string; value: string }[] = [
    {
      label: t("solution.oilStrengthLabel"),
      value: t("solution.oilStrengthValue", { pct: f.strengthPercent }),
    },
    { label: t("coaLabels.cbd"), value: f.cbd },
    ...(f.cbg ? [{ label: t("coaLabels.cbg"), value: f.cbg }] : []),
    ...(f.cbn ? [{ label: t("coaLabels.cbn"), value: f.cbn }] : []),
    ...(f.melatonin
      ? [{ label: t("solution.oilMelatoninLabel"), value: t("solution.oilMelatoninValue") }]
      : []),
  ];

  const onAdd = () => {
    add(solution.id, grams);
    track(AnalyticsEvent.addToCart, {
      solution: solution.id,
      grams,
      value: solution.priceEur * grams,
    });
    // Single CTA now — adding takes you straight to the cart summary
    // (owner request, Sept 2026 — the separate "check availability" button
    // was removed as redundant).
    navigate(paths.cart);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <JourneyStepper current="product" className="mb-8" />
      <Link
        to={paths.shop}
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted underline-offset-4 hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t("solution.backToShop")}
      </Link>

      {/* Hero on the branded gradient — matches the Result page's
          recommendation card (owner request, Sept 2026). White text. */}
      <div className="relative mt-6 overflow-hidden rounded-2xl md:rounded-3xl [background-image:var(--brand-band-gradient)] p-6 text-white shadow-[var(--shadow-float)] sm:p-8">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-white/10 blur-3xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-1/4 size-56 rounded-full bg-sky-400/15 blur-3xl"
        />

        <div className="relative">
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
              {t(`solutions.${solution.id}.category`)}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
              {t("solution.prescriptionBadge")}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <SolutionMark
              solution={solution}
              variant="badge"
              className="size-14"
            />
            <h1 className="font-display text-white">{solution.name}</h1>
          </div>
          <p className="mt-2 text-sm text-white/85">
            {t(`solutions.${solution.id}.blurb`)}
          </p>
          <p className="mt-1 text-xs text-white/70">
            {t("solution.forProblems", { problems })}
          </p>
          <p className="mt-2 text-sm text-white/70">
            {t("solution.thcRangeLabel")}:{" "}
            <span className="font-mono text-white">{solution.thcRange}</span>
          </p>
          <p className="mt-3 font-mono text-lg text-white">
            {t("solution.pricePerGram", {
              price: formatPriceEur(solution.priceEur, language),
            })}
            {!PRICES_CONFIRMED ? (
              <InfoHint className="ml-1.5 [&_button:hover]:text-white [&_button]:text-white/60">
                {t("pricesIndicative")}
              </InfoHint>
            ) : null}
          </p>

          {reviewApproved && !COMMERCE_ENABLED ? (
            <div className="mt-5 flex flex-col gap-3">
              <p className="text-sm text-white/85">
                {t("solution.orderingDisabledNote")}
              </p>
              <Link to={paths.dashboardRecommendation} className={HERO_CTA_CLASS}>
                {t("solution.backToRecommendation")}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          ) : reviewApproved ? (
            <>
              <fieldset className="mt-5">
                <legend className="text-sm font-medium text-white">
                  {t("solution.amountLabel")}{" "}
                  <InfoHint className="ml-0.5 [&_button:hover]:text-white [&_button]:text-white/60">
                    {t("solution.amountHint")}
                  </InfoHint>
                </legend>
                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {GRAM_OPTIONS.map(({ value: o, badge }) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setGrams(o)}
                      aria-pressed={grams === o}
                      className={cn(
                        "relative flex flex-col items-center gap-1 rounded-2xl border px-3 py-3 text-sm font-medium transition-colors",
                        grams === o
                          ? "border-white bg-white text-petrol-800"
                          : "border-white/25 text-white/75 hover:border-white/50 hover:text-white",
                      )}
                    >
                      {badge ? (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-petrol-700">
                          {t(`solution.amountBadges.${badge}`)}
                        </span>
                      ) : null}
                      {t("solution.grams", { count: o })}
                    </button>
                  ))}
                </div>
              </fieldset>

              <button
                type="button"
                onClick={onAdd}
                className={cn(HERO_CTA_CLASS, "mt-5")}
              >
                {t("solution.addToCart")}
                <ArrowRight className="size-4" aria-hidden />
              </button>
            </>
          ) : (
            <div className="mt-5 flex flex-col gap-3">
              {/* Medical review comes before any order (PO decision B1).
                  `sm:self-start` lets HERO_CTA_CLASS's `sm:w-auto` win over the
                  flex-col's default stretch — full-width on mobile only. */}
              <Link
                to={paths.assessment.medicalReview}
                className={cn(HERO_CTA_CLASS, "sm:self-start")}
              >
                {t("solution.continueToReview")}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <p className="text-sm text-white/70">
                {t("solution.afterApprovalNote")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detail sections as a collapsed accordion, matching the FAQ below
          (owner request, Sept 2026) — keeps the post-review product page
          scannable instead of a long always-open wall of copy. */}
      <section className="mt-12">
        <h2 className="text-lg">{t("solution.detailsHeading")}</h2>
        <Accordion type="single" collapsible className="mt-2">
          <AccordionItem value="why">
            <AccordionTrigger>{t("solution.whyHeading")}</AccordionTrigger>
            <AccordionContent className="text-ink-muted">
              {t(`solutions.${solution.id}.why`)}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="usage">
            <AccordionTrigger>{t("solution.usageHeading")}</AccordionTrigger>
            <AccordionContent className="text-ink-muted">
              {t(`solutions.${solution.id}.usage`)}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="suitability">
            <AccordionTrigger>
              {t("solution.suitabilityHeading")}
            </AccordionTrigger>
            <AccordionContent className="text-ink-muted">
              {t(`solutions.${solution.id}.suitability`)}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="format">
            <AccordionTrigger>{t("solution.formatHeading")}</AccordionTrigger>
            <AccordionContent className="text-ink-muted">
              {t("solution.formatValue")}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="ingredients">
            <AccordionTrigger>
              {t("solution.ingredientsHeading")}
            </AccordionTrigger>
            <AccordionContent className="text-ink-muted">
              {t("solution.ingredientsValue", { thc: solution.thcRange })}
            </AccordionContent>
          </AccordionItem>
          {/* Oil formulation — the controlled starting format (founder spec).
              Kept distinct from the dispensed flower and its batch COA. */}
          <AccordionItem value="oil">
            <AccordionTrigger>
              {t("solution.oilFormulationHeading")}
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-ink-muted">
                {t("solution.oilFormulationNote")}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {formulationRows.map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/50 bg-white/40 p-3"
                  >
                    <dt className="text-xs uppercase tracking-wide text-ink-muted">
                      {label}
                    </dt>
                    <dd className="mt-1 font-mono text-base text-ink">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs text-ink-muted">
                {t("solution.oilFormulationProvisional")}
              </p>
            </AccordionContent>
          </AccordionItem>
          {/* Available dispensing options — the fulfilment layer beneath this
              Solution, grouped by format (flower · device). Low-emphasis by
              design; the customer never picks (owner decision, Sept 2026). */}
          <AccordionItem value="dispensed">
            <AccordionTrigger>{t("solution.dispensedHeading")}</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-ink-muted">
                {t("solution.dispensedIntro", { name: solution.name })}
              </p>

              {flowerOptions.length > 0 ? (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {flowerOptions.map((strain) => (
                    <DispensingOption
                      key={strain.id}
                      strain={strain}
                      solution={solution}
                      thcRank={
                        flowerThcMin === flowerThcMax
                          ? undefined
                          : strain.thcPercent === flowerThcMin
                            ? "low"
                            : strain.thcPercent === flowerThcMax
                              ? "high"
                              : undefined
                      }
                    />
                  ))}
                </ul>
              ) : null}

              {deviceOptions.length > 0 ? (
                <>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    {t("solution.altFormatHeading")}
                  </p>
                  <ul className="mt-2 grid gap-3 sm:grid-cols-2">
                    {deviceOptions.map((strain) => (
                      <DispensingOption
                        key={strain.id}
                        strain={strain}
                        solution={solution}
                      />
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-ink-muted">
                    {t("solution.altFormatNote")}
                  </p>
                </>
              ) : null}
            </AccordionContent>
          </AccordionItem>
          {/* Common questions folded into the same accordion (owner request,
              Sept 2026) — no separate FAQ block. */}
          {FAQ_KEYS.map((k) => (
            <AccordionItem key={k} value={k}>
              <AccordionTrigger>{t(`faq.${k}.q`)}</AccordionTrigger>
              <AccordionContent className="text-ink-muted">
                {t(`faq.${k}.a`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* COA. Until real lab data exists (owner decision D11 / COA_CONFIRMED)
          this is a plain "you'll get a real certificate" note — no fabricated
          batch numbers, cannabinoid values or "Lab tested" badge. */}
      <section className="glass-strong mt-10 rounded-2xl md:rounded-3xl p-6">
        <div className="flex flex-wrap items-center gap-2">
          <ShieldCheck className="size-5 text-petrol-600" aria-hidden />
          <h2 className="text-lg">{t("solution.coaHeading")}</h2>
          {COA_CONFIRMED ? (
            <span className="rounded-full bg-sage-100 px-2.5 py-0.5 text-xs font-medium text-petrol-700">
              {t("solution.labTestedBadge")}
            </span>
          ) : null}
        </div>

        {COA_CONFIRMED ? (
          <>
            <p className="mt-2 text-sm text-ink-muted">
              {t("solution.coaIntro")}
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {coaValues.map(({ key, value }) => (
                <div
                  key={key}
                  className="rounded-2xl border border-white/50 bg-white/40 p-3"
                >
                  <dt className="text-xs uppercase tracking-wide text-ink-muted">
                    {t(`coaLabels.${key}`)}
                  </dt>
                  <dd className="mt-1 font-mono text-base text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <dl className="mt-3 grid gap-2 text-sm">
              <div className="flex justify-between gap-4 border-t border-border pt-2">
                <dt className="text-ink-muted">{t("coaLabels.batch")}</dt>
                <dd className="font-mono text-ink">{coa.batch}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">{t("coaLabels.testedOn")}</dt>
                <dd className="font-mono text-ink">
                  {formatDate(coa.testedOn, language)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">{t("coaLabels.safety")}</dt>
                <dd className="text-right text-ink">{t("coaSafetyValue")}</dd>
              </div>
            </dl>
          </>
        ) : (
          <p className="mt-2 text-sm text-ink-muted">
            {t("solution.coaPlaceholder")}
          </p>
        )}
      </section>

      {/* Guide back to the assessment — the solution isn't where you start. */}
      <div className="glass mt-10 flex flex-col gap-4 rounded-2xl md:rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-base text-ink">
            {t("solution.notSureTitle")}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {t("solution.notSureBody")}
          </p>
        </div>
        <Button asChild variant="cta" className="w-full sm:w-auto sm:shrink-0">
          <Link to={paths.assessment.start}>{t("solution.notSureCta")}</Link>
        </Button>
      </div>
    </div>
  );
}
