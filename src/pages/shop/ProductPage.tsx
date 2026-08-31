import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { JourneyStepper } from "@/components/marketing/JourneyStepper";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { getProductImage, type Product } from "@/data/products";
import {
  isSolutionId,
  SOLUTION_BY_ID,
  solutionExampleCoa,
  solutionImage,
  solutionStrains,
} from "@/data/solutions";
import { useCart } from "@/features/cart/CartContext";
import { useLanguage } from "@/i18n/useLanguage";
import { formatDate, formatPriceEur } from "@/lib/format";

const FAQ_KEYS = ["dosage", "driving", "delivery"] as const;
const GRAM_OPTIONS = [5, 10, 15, 30];

function StrainCard({ strain }: { strain: Product }) {
  const { t } = useTranslation("shop");
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-white/50 bg-white/40 p-3 dark:border-white/10 dark:bg-white/[0.04]">
      <ImageWithFallback
        src={getProductImage(strain)}
        alt=""
        className="size-14 shrink-0 rounded-xl bg-sage-50/70 object-contain p-1"
      />
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">
          {strain.brand} · {strain.name}
        </p>
        <p className="font-mono text-xs text-ink-muted">
          {strain.genetics
            ? `${t(`strain.types.${strain.genetics}`)} · THC ${strain.thcPercent} %`
            : t("strain.forms.inhaler")}
          {" · "}
          {strain.originCountry}
        </p>
      </div>
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
  usePageTitle(solution?.name);

  const [grams, setGrams] = useState(10);
  const [added, setAdded] = useState(false);

  if (!solution) {
    return <Navigate to={paths.shop} replace />;
  }

  const coa = solutionExampleCoa(solution);
  const strains = solutionStrains(solution);
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
    setAdded(true);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <JourneyStepper current="product" className="mb-8" />
      <Link
        to={paths.shop}
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted underline-offset-4 hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t("solution.backToShop")}
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="glass aspect-square overflow-hidden rounded-3xl">
          <div className="image-glow flex size-full items-center justify-center p-6">
            <ImageWithFallback
              src={solutionImage(solution)}
              alt=""
              className="size-full object-contain drop-shadow-[0_24px_40px_rgba(13,68,75,0.28)]"
            />
          </div>
        </div>

        <div>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-medium text-petrol-700">
              {t(`solutions.${solution.id}.category`)}
            </span>
            <span className="rounded-full bg-petrol-50 px-3 py-1 text-xs font-medium text-petrol-700 dark:bg-petrol-900/60">
              {t("solution.prescriptionBadge")}
            </span>
          </div>

          <h1 className="mt-3 font-display">{solution.name}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {t(`solutions.${solution.id}.blurb`)}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {t("solution.forProblems", { problems })}
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            {t("solution.thcRangeLabel")}:{" "}
            <span className="font-mono text-ink">{solution.thcRange}</span>
          </p>
          <p className="mt-3 font-mono text-lg text-ink">
            {t("solution.pricePerGram", {
              price: formatPriceEur(solution.priceEur, language),
            })}
          </p>

          <fieldset className="mt-5">
            <legend className="text-sm font-medium text-ink">
              {t("solution.amountLabel")}
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {GRAM_OPTIONS.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setGrams(o)}
                  aria-pressed={grams === o}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                    grams === o
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-ink-muted hover:text-ink",
                  )}
                >
                  {t("solution.grams", { count: o })}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button type="button" variant="cta" size="lg" onClick={onAdd}>
              {added ? <Check className="size-4" aria-hidden /> : null}
              {t("solution.addToCart")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate(paths.cart)}
            >
              {t("solution.checkAvailability")}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        <section>
          <h2 className="text-lg">{t("solution.whyHeading")}</h2>
          <p className="mt-2 text-sm text-ink-muted">
            {t(`solutions.${solution.id}.why`)}
          </p>
        </section>
        <section>
          <h2 className="text-lg">{t("solution.usageHeading")}</h2>
          <p className="mt-2 text-sm text-ink-muted">
            {t(`solutions.${solution.id}.usage`)}
          </p>
        </section>
        <section>
          <h2 className="text-lg">{t("solution.suitabilityHeading")}</h2>
          <p className="mt-2 text-sm text-ink-muted">
            {t(`solutions.${solution.id}.suitability`)}
          </p>
        </section>
        <section>
          <h2 className="text-lg">{t("solution.formatHeading")}</h2>
          <p className="mt-2 text-sm text-ink-muted">
            {t("solution.formatValue")}
          </p>
        </section>
        <section>
          <h2 className="text-lg">{t("solution.ingredientsHeading")}</h2>
          <p className="mt-2 text-sm text-ink-muted">
            {t("solution.ingredientsValue", { thc: solution.thcRange })}
          </p>
        </section>
      </div>

      {/* Oil formulation — the controlled starting format (founder spec).
          Kept distinct from the dispensed flower and its batch COA below. */}
      <section className="mt-12">
        <h2 className="text-lg">{t("solution.oilFormulationHeading")}</h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          {t("solution.oilFormulationNote")}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {formulationRows.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/50 bg-white/40 p-3 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <dt className="text-xs uppercase tracking-wide text-ink-muted">
                {label}
              </dt>
              <dd className="mt-1 font-mono text-base text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Dispensed as — the real strains behind this solution */}
      <section className="mt-12">
        <h2 className="text-lg">{t("solution.dispensedHeading")}</h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          {t("solution.dispensedIntro", { name: solution.name })}
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {strains.map((strain) => (
            <StrainCard key={strain.id} strain={strain} />
          ))}
        </ul>
      </section>

      {/* Example COA — verified data, monospace */}
      <section className="glass-strong mt-10 rounded-3xl p-6">
        <div className="flex flex-wrap items-center gap-2">
          <ShieldCheck className="size-5 text-petrol-600" aria-hidden />
          <h2 className="text-lg">{t("solution.coaHeading")}</h2>
          <span className="rounded-full bg-sage-100 px-2.5 py-0.5 text-xs font-medium text-petrol-700">
            {t("solution.labTestedBadge")}
          </span>
        </div>
        <p className="mt-2 text-sm text-ink-muted">{t("solution.coaIntro")}</p>

        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {coaValues.map(({ key, value }) => (
            <div
              key={key}
              className="rounded-2xl border border-white/50 bg-white/40 p-3 dark:border-white/10 dark:bg-white/[0.04]"
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
      </section>

      <section className="mt-10">
        <h2 className="text-lg">{t("faq.faqHeading")}</h2>
        <Accordion type="single" collapsible className="mt-2">
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

      {/* Guide back to the assessment — the solution isn't where you start. */}
      <div className="glass mt-10 flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-base text-ink">
            {t("solution.notSureTitle")}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {t("solution.notSureBody")}
          </p>
        </div>
        <Button asChild variant="cta" className="shrink-0">
          <Link to={paths.assessment.start}>{t("solution.notSureCta")}</Link>
        </Button>
      </div>
    </div>
  );
}
