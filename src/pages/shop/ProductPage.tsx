import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { cn } from "@/app/components/ui/utils";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { AssessmentRing } from "@/components/brand/AssessmentRing";
import { DeliveryConfirmation } from "@/components/marketing/DeliveryConfirmation";
import { InfoHint } from "@/components/marketing/InfoHint";
import { NextSteps } from "@/components/marketing/NextSteps";
import { PageShell } from "@/components/marketing/PageShell";
import { PromptCard } from "@/components/marketing/PromptCard";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { COA_CONFIRMED, PRICES_CONFIRMED } from "@/config";
import { getProductImage, type Product } from "@/data/products";
import {
  isSolutionId,
  SOLUTION_BY_ID,
  solutionExampleCoa,
  solutionHeroStrain,
  solutionStrains,
  type Solution,
  type SolutionId,
} from "@/data/solutions";
import { useAssessment } from "@/features/assessment/AssessmentContext";
import { hasAnyFlag } from "@/features/assessment/exclusions";
import { useCart } from "@/features/cart/CartContext";
import { getMedicalReview } from "@/features/review/review";
import { useLanguage } from "@/i18n/useLanguage";
import { AnalyticsEvent, track } from "@/lib/analytics";
import { formatDate, formatPriceEur } from "@/lib/format";

const FAQ_KEYS = ["dosage", "driving", "delivery"] as const;

/** Primary action on the gradient hero — a solid-white pill (same as the
 *  Result page's recommendation card). */
const HERO_CTA_CLASS =
  "inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-white px-6 text-sm md:text-base font-semibold text-petrol-800 shadow-[0_12px_30px_-14px_rgba(0,0,0,0.55)] transition-colors hover:bg-white/90 sm:w-auto";
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
    <li className="flex h-full flex-col place-content-between rounded-2xl border border-white/50 bg-white/40 p-3">
      <div className="flex items-start gap-3">
        <ImageWithFallback
          src={getProductImage(strain)}
          alt=""
          className="size-14 shrink-0 rounded-xl bg-sage-50/70 object-contain p-1"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm md:text-base font-medium text-ink">
            {isDevice ? strain.name : `${strain.brand} · ${strain.name}`}
          </p>
          <p className="mt-0.5 text-sm md:text-base text-ink-muted">
            {t(`strain.forms.${strain.format}`)} · {t("strain.specs.thc")}{" "}
            {strain.thcPercent} %
            {isDevice ? ` · ${t("strain.specs.cbd")} ${cbd}` : null}
          </p>
          {isDevice ? (
            <p className="mt-0.5 text-sm md:text-base text-ink-muted">
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
          <p className="mt-0.5 text-sm md:text-base text-ink-muted">
            {t("solution.optMatchedTo", { name: solution.name })}
          </p>
          {thcRank ? (
            <p className="mt-0.5 text-sm md:text-base text-ink-muted">
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
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-sm md:text-base font-medium text-petrol-700 marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">
            {t("solution.optViewDetails")}
          </span>
          <span className="hidden group-open:inline">
            {t("solution.optHideDetails")}
          </span>
        </summary>
        <dl className="mt-2 grid gap-1 text-sm md:text-base">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="text-ink-muted">{label}</dt>
              <dd className="text-right text-ink">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-sm md:text-base text-ink-muted">
          {t("solution.optThcMeaning")}
        </p>
        <p className="mt-1 text-sm md:text-base text-ink-muted">{t("solution.optCoaNote")}</p>
      </details>
    </li>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass p-4">
      <dt className="text-xs md:text-sm uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="mt-1 text-ink">{value}</dd>
    </div>
  );
}

/** The secondary solution, as a quiet persistent link under "Your answers" —
 * restored on owner request after the cross-sell modal shipped; the two now
 * coexist (the modal offers it right after Add to cart, this link stays for
 * anyone scrolling who hasn't clicked yet, or wants to come back to it
 * later). `hint` is a small low-key strength signal ("usually a stronger
 * option, for later") — only passed when the label itself doesn't already
 * say so (i.e. not for the "Advanced option" case, where that word already
 * carries the meaning). */
function AlternativeSolutionLink({
  heading,
  label,
  hint,
  solution,
  dashboardOrigin,
}: {
  heading: string;
  label: string;
  hint?: string;
  solution: Solution;
  /** Carries the dashboard-embed context forward (see `ProductPage`'s own
   *  `dashboardOrigin`) so browsing to the alternative Solution doesn't drop
   *  the dashboard chrome the visitor is already looking at. */
  dashboardOrigin?: boolean;
}) {
  const { t } = useTranslation("shop");

  return (
    <>
      <p className="mt-8 text-xs md:text-sm font-semibold uppercase tracking-[0.16em] text-ink-muted">
        {heading}
      </p>
      <Link
        to={
          dashboardOrigin
            ? paths.shopProductFromDashboard(solution.id)
            : paths.shopProduct(solution.id)
        }
        onClick={() =>
          track(AnalyticsEvent.recommendationAlternativeSelected, {
            solution: solution.id,
          })
        }
        className="group mt-2 flex items-center gap-3 rounded-2xl glass glass-hover p-3"
      >
        <ImageWithFallback
          src={getProductImage(solutionHeroStrain(solution))}
          alt=""
          className="size-11 shrink-0 rounded-lg bg-sage-50/70 object-contain p-0.5"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm md:text-base font-medium text-ink group-hover:underline">
            {solution.name}
          </span>
          <span className="block text-sm md:text-base text-ink-muted">
            {label} · {t(`solutions.${solution.id}.category`)}
          </span>
          {hint ? (
            <span className="block text-sm md:text-base text-ink-muted/70">{hint}</span>
          ) : null}
        </span>
        <ArrowRight
          className="size-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </>
  );
}

export function ProductPage() {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  // Set by dashboard links (`paths.shopProductFromDashboard`) — swaps the
  // "back" link below for one that actually returns to the dashboard,
  // instead of the funnel's "back to recommendation / shop" (2026-09-23).
  const dashboardOrigin = searchParams.get("origin") === "dashboard";
  const { t } = useTranslation("shop");
  const { t: tAssessment } = useTranslation("assessment");
  const { t: tc } = useTranslation("conditions");
  const { language } = useLanguage();
  const { add, items, setQuantity } = useCart();
  const navigate = useNavigate();
  const { result, answers, postcode, deliveryRegion, exclusions } =
    useAssessment();

  const solution = isSolutionId(productId) ? SOLUTION_BY_ID[productId] : null;
  usePageTitle(solution?.name, undefined, { noindex: true });

  // Defaults to 10 g, but starts from whatever's actually in the cart for
  // this Solution already — so the highlighted amount pill agrees with the
  // "N g already in cart" badge instead of silently disagreeing with it.
  const [grams, setGrams] = useState(
    () =>
      (solution &&
        items.find((i) => i.productId === solution.id)?.quantity) ||
      10,
  );

  const viewedId = solution?.id;
  const isViewingMatch = Boolean(
    viewedId && result?.primarySolutionId === viewedId,
  );

  // Add-to-cart button state on the visitor's own matched Solution only
  // (idle -> adding -> added -> checkout). A revisit with the item already
  // in the cart skips straight to "checkout" — no replayed animation, no
  // double-adding. The alternative-option view never leaves "idle": it keeps
  // its original single-click "add + straight to checkout" behaviour.
  const [addState, setAddState] = useState<
    "idle" | "adding" | "added" | "checkout"
  >(() =>
    isViewingMatch && items.some((i) => i.productId === viewedId)
      ? "checkout"
      : "idle",
  );
  const [crossSellOpen, setCrossSellOpen] = useState(false);
  const timeoutsRef = useRef<number[]>([]);
  useEffect(
    () => () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  useEffect(() => {
    if (viewedId) track(AnalyticsEvent.productViewed, { solution: viewedId });
    if (isViewingMatch) {
      track(AnalyticsEvent.recommendationViewed, { problem: result?.problem });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewedId, isViewingMatch]);

  if (!solution) {
    return <Navigate to={paths.shop} replace />;
  }

  // This page now covers both "your recommended solution" (the question pass
  // routes straight here) and plain catalog browsing from `/shop` — the
  // recommendation-specific framing (ring, explanation, summary, alternative
  // link, disclaimer) only renders when the viewed solution is actually the
  // visitor's own match (funnel re-sequence, 2026-09-14: Result + Product
  // merged into one screen, so this replaces the old standalone Result page).
  const isMatch = result?.primarySolutionId === solution.id;
  const secondary = result ? SOLUTION_BY_ID[result.secondarySolutionId] : null;
  const existingReview = getMedicalReview();
  // Viewing a Solution that isn't the visitor's own primary match while a
  // result exists (typically reached via the "alternative option" link) —
  // the back link and the trailing CTA row both change context: this isn't
  // plain catalog browsing, it's a detour from an existing recommendation.
  const isAlternativeView = Boolean(result) && !isMatch;
  // Live from the cart, not the grams selector — shows what's actually
  // in there (this Solution's quantity may already be in the cart from an
  // earlier visit or the cross-sell modal).
  const cartQuantity =
    items.find((i) => i.productId === solution.id)?.quantity ?? 0;

  // Owner decision D1 — frequency and format preference personalise the
  // recommendation copy and are noted for the medical review; they never
  // change the match or push a stronger / higher-THC option.
  const q2 = answers.q2;
  const q6 = answers.q6;
  // Rendered inline (leading space, no own <p>) so it flows into the same
  // continuing paragraph as the blurb/explanation below, not a stacked block.
  const personalisation = (
    <>
      {q2 ? (
        <>
          {" "}
          {tAssessment("result.frequencyNote", {
            frequency: tAssessment(`questions.q2.options.${q2}`).toLowerCase(),
          })}
        </>
      ) : null}
      {q6 === "flower" || q6 === "vape" ? (
        <>
          {" "}
          {tAssessment("result.formatPreferenceNote", {
            format: tAssessment(`questions.q6.options.${q6}`),
          })}
        </>
      ) : null}
    </>
  );

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
  // Condensed one-line summary for the hero's collapsed THC/price/ingredients
  // disclosure (isMatch only) — the fuller breakdown lives in the "oil
  // formulation" accordion item below.
  const oilProfileLine = [
    `CBD ${f.cbd}`,
    f.cbg ? `CBG ${f.cbg}` : null,
    f.cbn ? `CBN ${f.cbn}` : null,
    f.melatonin ? "+ Melatonin" : null,
  ]
    .filter(Boolean)
    .join(" · ");
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

  const addSolution = (id: SolutionId, addGrams: number) => {
    add(id, addGrams);
    track(AnalyticsEvent.addToCart, {
      solution: id,
      grams: addGrams,
      value: SOLUTION_BY_ID[id].priceEur * addGrams,
    });
  };

  // Once this Solution is already in the cart, the amount selector edits
  // that cart line directly instead of just staging a value for a future
  // "Add to cart" click — the "N g already in cart" badge reflects the
  // change immediately.
  const onSelectGrams = (value: number) => {
    setGrams(value);
    if (cartQuantity > 0) {
      setQuantity(solution.id, value);
    }
  };

  const onAdd = () => {
    // A medical review must already exist (it's created at the end of the
    // question pass). A visitor who deep-linked into /shop/:id has none — send
    // them to start rather than into checkout.
    if (!getMedicalReview()) {
      navigate(paths.assessment.start);
      return;
    }

    if (!isMatch) {
      // Alternative-option / plain catalog view — unchanged single-click
      // "add + straight to checkout" flow (funnel re-sequence, 2026-09-14).
      // Already in the cart (e.g. from the cross-sell modal, or a previous
      // visit)? Don't add it again — just go straight to checkout, same as
      // the matched page's "checkout" state below.
      if (cartQuantity === 0) {
        addSolution(solution.id, grams);
      }
      navigate(paths.checkout);
      return;
    }

    if (addState === "checkout") {
      navigate(paths.checkout);
      return;
    }

    // The visitor's own matched Solution — a staged loading -> success
    // sequence (owner request) before the button settles on "Checkout".
    // `addSolution` itself is synchronous; the delays are pure perceived-
    // feedback, not real async work.
    setAddState("adding");
    timeoutsRef.current.push(
      window.setTimeout(() => {
        addSolution(solution.id, grams);
        setAddState("added");
        timeoutsRef.current.push(
          window.setTimeout(() => {
            setAddState("checkout");
            if (secondary) {
              setCrossSellOpen(true);
              track(AnalyticsEvent.crossSellShown, { solution: secondary.id });
            }
          }, 700),
        );
      }, 500),
    );
  };

  return (
    <PageShell>
      {/* Reached from the dashboard ("Also available", the recommendation
          hero's "View", …) — go back there, not into the funnel's own
          recommendation/shop links. Otherwise: no back link on the visitor's
          own matched Solution page — there's no sensible "back" destination
          for your own recommendation, and the review-status link + "Change
          My Answers" further down already cover navigation from here. */}
      {dashboardOrigin ? (
        <Link
          to={paths.dashboard}
          className="inline-flex items-center gap-1.5 text-sm md:text-base text-ink-muted underline-offset-4 hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("solution.backToDashboard")}
        </Link>
      ) : isMatch ? null : isAlternativeView && result ? (
        <Link
          to={paths.shopProduct(result.primarySolutionId)}
          className="inline-flex items-center gap-1.5 text-sm md:text-base text-ink-muted underline-offset-4 hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("solution.backToRecommendation")}
        </Link>
      ) : (
        <Link
          to={paths.shop}
          className="inline-flex items-center gap-1.5 text-sm md:text-base text-ink-muted underline-offset-4 hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("solution.backToShop")}
        </Link>
      )}

      {/* The "you've been matched" reveal — only for the visitor's own
          primary solution, arrived at straight from the question pass
          (Steps 2+3 merged into this one screen, 2026-09-14). A plain
          catalog visit from `/shop` skips this entirely. */}
      {isMatch ? (
        <div className="mt-6 flex flex-col items-start gap-5 sm:flex-row">
          <AssessmentRing variant="complete" tone="deep" size={72} animate />
          <div>
            <p className="font-display text-xl md:text-2xl text-ink">
              {tAssessment("result.title")}
            </p>
            <p className="mt-2 text-ink-muted">
              {tAssessment("result.intro")}
              {existingReview ? (
                <>
                  {" "}
                  {tAssessment("result.reviewingNote")}{" "}
                  <Link
                    to={
                      dashboardOrigin
                        ? paths.assessment.reviewFromDashboard
                        : paths.assessment.review
                    }
                    className="underline underline-offset-2 hover:text-ink"
                  >
                    {tAssessment("result.reviewingLink")}
                  </Link>
                </>
              ) : null}
            </p>
            {postcode ? (
              <DeliveryConfirmation
                postcode={postcode}
                region={deliveryRegion}
                className="mt-3"
              />
            ) : null}
          </div>
        </div>
      ) : null}

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
            <span className="rounded-full bg-white/15 px-3 py-1 text-sm md:text-base font-medium text-white">
              {t(`solutions.${solution.id}.category`)}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm md:text-base font-medium text-white/80">
              {t("solution.prescriptionBadge")}
            </span>
            {cartQuantity > 0 ? (
              <Link
                to={paths.cart}
                className="group inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-sm md:text-base font-medium text-white hover:bg-white/25"
              >
                <Check className="size-3.5" aria-hidden />
                {t("solution.inCartBadge", { grams: cartQuantity })}
                <ArrowRight
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            ) : null}
          </div>

          {/* The actual product photo, not the abstract Solution medallion —
              "customer knows what he actually receives" (Mischa, 2026-09-09).
              Product-catalog-style hero (owner request, 2026-09-14): a large
              photo beside the identity block — row from `sm`, stacked on
              mobile. */}
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="relative mx-auto w-40 shrink-0 sm:mx-0 sm:w-48">
              {/* No white card — transparent, with a soft white glow behind
                  the photo instead (owner request, 2026-09-14). */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full bg-white/30 blur-2xl"
              />
              <ImageWithFallback
                src={getProductImage(solutionHeroStrain(solution))}
                alt=""
                className="relative aspect-square w-full rounded-2xl object-contain drop-shadow-[0_18px_30px_-12px_rgba(0,0,0,0.5)]"
              />
            </div>

            <div className="min-w-0 flex-1">
              {isMatch ? (
                <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.16em] text-white/60">
                  {tAssessment("result.primaryHeading")}
                </p>
              ) : null}
              <h1 className={cn("font-display text-white", isMatch && "mt-1")}>
                {solution.name}
              </h1>
              {/* One continuing paragraph — blurb, explanation, personalised
                  notes and the "For: {problem}" line all flow together
                  instead of stacking as separate blocks (owner request,
                  2026-09-14). */}
              <p className="mt-2 text-sm md:text-base text-white/85">
                {t(`solutions.${solution.id}.blurb`)}
                {isMatch && result ? (
                  <>
                    {" "}
                    {tAssessment(result.explanationKey)}
                    {personalisation}
                  </>
                ) : null}{" "}
                {t("solution.forProblems", { problems })}
              </p>
            </div>
          </div>

          {isMatch ? (
            // Beginner-simplification pass (Aug 2026): a first-time match
            // doesn't see raw THC%/price until they ask — same disclosure
            // the old Result page used, restored here (2026-09-14) after the
            // merge briefly made these always-visible for a fresh match.
            <Accordion
              type="single"
              collapsible
              className="mt-3"
              onValueChange={(value) => {
                if (value) {
                  track(AnalyticsEvent.recommendationLearnMoreOpened, {
                    solution: solution.id,
                  });
                }
              }}
            >
              <AccordionItem value="hero-details" className="border-white/15">
                <AccordionTrigger className="text-sm md:text-base text-white hover:no-underline [&>svg]:text-white/70">
                  {tAssessment("result.detailsLabel")}
                </AccordionTrigger>
                <AccordionContent>
                  <dl className="grid gap-2 text-sm md:text-base">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-white/60">
                        {t("solution.thcRangeLabel")}
                      </dt>
                      <dd className="font-mono text-white">
                        {solution.thcRange}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-white/60">
                        {t("solution.priceLabel")}
                      </dt>
                      <dd className="font-mono text-white">
                        {t("solution.pricePerGram", {
                          price: formatPriceEur(solution.priceEur, language),
                        })}
                        {!PRICES_CONFIRMED ? (
                          <InfoHint className="ml-1.5 [&_button:hover]:text-white [&_button]:text-white/60">
                            {t("pricesIndicative")}
                          </InfoHint>
                        ) : null}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-white/60">
                        {t("solution.oilProfileLabel")}
                      </dt>
                      <dd className="text-right font-mono text-white">
                        {oilProfileLine}
                      </dd>
                    </div>
                  </dl>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            <>
              <p className="mt-2 text-sm md:text-base text-white/70">
                {t("solution.thcRangeLabel")}:{" "}
                <span className="font-mono text-white">
                  {solution.thcRange}
                </span>
              </p>
              <p className="mt-3 font-mono text-lg md:text-xl text-white">
                {t("solution.pricePerGram", {
                  price: formatPriceEur(solution.priceEur, language),
                })}
                {!PRICES_CONFIRMED ? (
                  <InfoHint className="ml-1.5 [&_button:hover]:text-white [&_button]:text-white/60">
                    {t("pricesIndicative")}
                  </InfoHint>
                ) : null}
              </p>
            </>
          )}

          <fieldset className="mt-5">
            <legend className="text-sm md:text-base font-medium text-white">
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
                  onClick={() => onSelectGrams(o)}
                  aria-pressed={grams === o}
                  className={cn(
                    "relative flex flex-col items-center gap-1 rounded-2xl border px-3 py-3 text-sm md:text-base font-medium transition-colors",
                    grams === o
                      ? "border-white bg-white text-petrol-800"
                      : "border-white/25 text-white/75 hover:border-white/50 hover:text-white",
                  )}
                >
                  {badge ? (
                    // Deliberate text-xs exception (owner instruction,
                    // 2026-09-14) to the site-wide "nothing smaller than
                    // text-sm" rule — this tight all-caps pill is the one
                    // case called out for it.
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-petrol-700">
                      {t(`solution.amountBadges.${badge}`)}
                    </span>
                  ) : null}
                  {t("solution.grams", { count: o })}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onAdd}
              disabled={addState === "adding" || addState === "added"}
              className={cn(
                HERO_CTA_CLASS,
                "disabled:pointer-events-none disabled:opacity-90",
              )}
            >
              {addState === "adding" ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {t("solution.addingToCart")}
                </>
              ) : addState === "added" ? (
                <>
                  <Check className="size-4" aria-hidden />
                  {t("solution.addedToCart")}
                </>
              ) : addState === "checkout" ||
                (!isMatch && cartQuantity > 0) ? (
                <>
                  {t("solution.checkoutCta")}
                  <ArrowRight className="size-4" aria-hidden />
                </>
              ) : (
                <>
                  {t("solution.addToCart")}
                  <ArrowRight className="size-4" aria-hidden />
                </>
              )}
            </button>
            {isAlternativeView && result ? (
              <Link
                to={
                  dashboardOrigin
                    ? paths.shopFromDashboard(result.problem)
                    : `${paths.shop}?problem=${result.problem}`
                }
                onClick={() =>
                  track(AnalyticsEvent.solutionViewMoreClicked, {
                    problem: result.problem,
                  })
                }
                className="inline-flex items-center gap-1 text-sm md:text-base font-medium text-white/80 underline-offset-4 hover:text-white hover:underline"
              >
                {t("solution.viewMoreSolutions")}
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* Cross-sell — offered once the primary's Add to cart has settled
          (button now reads "Checkout"), not competing with that action for
          attention. Only for the visitor's own matched Solution; the
          alternative-option page never opens this. */}
      {isMatch && secondary ? (
        <Dialog
          open={crossSellOpen}
          onOpenChange={(open) => {
            setCrossSellOpen(open);
            if (!open) {
              track(AnalyticsEvent.crossSellDismissed, {
                solution: secondary.id,
              });
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("solution.crossSellHeading")}</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-3">
              <ImageWithFallback
                src={getProductImage(solutionHeroStrain(secondary))}
                alt=""
                className="size-16 shrink-0 rounded-xl bg-sage-50/70 object-contain p-1"
              />
              <div className="min-w-0">
                <p className="font-medium text-ink">{secondary.name}</p>
                <p className="text-sm md:text-base text-ink-muted">
                  {result?.secondaryIsAdvanced
                    ? tAssessment("result.advancedHeading")
                    : tAssessment("result.altLabelDefault")}{" "}
                  · {t(`solutions.${secondary.id}.category`)}
                </p>
                {!result?.secondaryIsAdvanced ? (
                  <p className="text-sm md:text-base text-ink-muted/70">
                    {tAssessment("result.altStrongerHint")}
                  </p>
                ) : null}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="cta"
                className="w-full"
                onClick={() => {
                  addSolution(secondary.id, 10);
                  setCrossSellOpen(false);
                }}
              >
                {t("solution.addToCart")}
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link
                  to={
                    dashboardOrigin
                      ? paths.shopProductFromDashboard(secondary.id)
                      : paths.shopProduct(secondary.id)
                  }
                >
                  {t("solution.seeDetails")}
                </Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}

      {isMatch && result ? (
        <>
          <h2 className="mt-10 text-lg md:text-xl">{tAssessment("result.summaryHeading")}</h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-3">
            <SummaryItem
              label={tAssessment("result.labels.problem")}
              value={tAssessment(`questions.q1.options.${result.problem}`)}
            />
            {answers.q2 ? (
              <SummaryItem
                label={tAssessment("result.labels.frequency")}
                value={tAssessment(`questions.q2.options.${answers.q2}`)}
              />
            ) : null}
            {answers.q3 ? (
              <SummaryItem
                label={tAssessment("result.labels.strength")}
                value={tAssessment(`questions.q3.options.${answers.q3}`)}
              />
            ) : null}
          </dl>

          {secondary ? (
            <AlternativeSolutionLink
              heading={tAssessment("result.altHeading")}
              label={
                result.secondaryIsAdvanced
                  ? tAssessment("result.advancedHeading")
                  : tAssessment("result.altLabelDefault")
              }
              hint={
                result.secondaryIsAdvanced
                  ? undefined
                  : tAssessment("result.altStrongerHint")
              }
              solution={secondary}
              dashboardOrigin={dashboardOrigin}
            />
          ) : null}

          {/* The trailing notes — review-required, the gentle-start nudge when
              it applies, and the "not medical advice" line — one info panel,
              kept visible rather than behind a disclosure (compliance copy
              the spec wants on this page). Moved here from the Result page. */}
          <div className="mt-8 flex items-start gap-2.5 rounded-2xl bg-sage-50 p-4 text-sm md:text-base leading-relaxed text-ink-muted">
            <Info
              className="mt-0.5 size-4 shrink-0 text-petrol-600"
              aria-hidden
            />
            <p>
              {tAssessment("result.reviewRequiredNote")}
              {result.gentleFirst ? (
                <> {tAssessment("result.gentleNudge")}</>
              ) : null}{" "}
              {tAssessment("result.disclaimer")}
              {hasAnyFlag(exclusions ?? undefined) ? (
                <> {tAssessment("result.exclusionNote")}</>
              ) : null}
            </p>
          </div>
        </>
      ) : null}

      {/* Detail sections as a collapsed accordion, matching the FAQ below
          (owner request, Sept 2026) — keeps the post-review product page
          scannable instead of a long always-open wall of copy. */}
      <section className="mt-12">
        <h2 className="text-lg md:text-xl">{t("solution.detailsHeading")}</h2>
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
              <p className="text-sm md:text-base text-ink-muted">
                {t("solution.oilFormulationNote")}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {formulationRows.map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/50 bg-white/40 p-3"
                  >
                    <dt className="text-xs md:text-sm uppercase tracking-wide text-ink-muted">
                      {label}
                    </dt>
                    <dd className="mt-1 font-mono text-base md:text-lg text-ink">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-sm md:text-base text-ink-muted">
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
              <p className="text-sm md:text-base text-ink-muted">
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
                  <p className="mt-5 text-xs md:text-sm font-semibold uppercase tracking-wide text-ink-muted">
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
                  <p className="mt-2 text-sm md:text-base text-ink-muted">
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
          <h2 className="text-lg md:text-xl">{t("solution.coaHeading")}</h2>
          {COA_CONFIRMED ? (
            <span className="rounded-full bg-sage-100 px-2.5 py-0.5 text-sm md:text-base font-medium text-petrol-700">
              {t("solution.labTestedBadge")}
            </span>
          ) : null}
        </div>

        {COA_CONFIRMED ? (
          <>
            <p className="mt-2 text-sm md:text-base text-ink-muted">
              {t("solution.coaIntro")}
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {coaValues.map(({ key, value }) => (
                <div
                  key={key}
                  className="rounded-2xl border border-white/50 bg-white/40 p-3"
                >
                  <dt className="text-xs md:text-sm uppercase tracking-wide text-ink-muted">
                    {t(`coaLabels.${key}`)}
                  </dt>
                  <dd className="mt-1 font-mono text-base md:text-lg text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <dl className="mt-3 grid gap-2 text-sm md:text-base">
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
          <p className="mt-2 text-sm md:text-base text-ink-muted">
            {t("solution.coaPlaceholder")}
          </p>
        )}
      </section>

      {/* What's still ahead — review and delivery, for the visitor's own
          match. Moved here from the Result page. */}
      {isMatch ? (
        <div className="mt-10 rounded-2xl md:rounded-3xl glass p-6">
          <h2 className="text-base md:text-lg">{tAssessment("result.nextHeading")}</h2>
          <div className="mt-4">
            <NextSteps
              steps={(["view", "review", "delivery"] as const).map((k) => ({
                title: tAssessment(`result.next.${k}.title`),
                body: tAssessment(`result.next.${k}.body`),
              }))}
            />
          </div>
        </div>
      ) : null}

      {/* Guide back to the assessment — the solution isn't where you start. */}
      <PromptCard
        title={t("solution.notSureTitle")}
        body={t("solution.notSureBody")}
        ctaLabel={t("solution.notSureCta")}
        ctaTo={paths.assessment.start}
        onCtaClick={() => {
          if (isMatch) track(AnalyticsEvent.recommendationChangeAnswers);
        }}
        className="mt-10"
      />
    </PageShell>
  );
}
