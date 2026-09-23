import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { InfoTile } from "@/components/marketing/InfoTile";
import { PageHeader } from "@/components/marketing/PageHeader";
import { PageShell } from "@/components/marketing/PageShell";
import { Reveal } from "@/components/marketing/Reveal";

/**
 * "What to expect / what it costs" — a qualitative walk through the money
 * side (assessment free · review fee shown before it applies · solution paid
 * only after a prescription · delivery included · invoice/reimbursement).
 * No euro figures: exact fees depend on the medical review.
 */
const STEPS = ["assessment", "review", "solution", "delivery"] as const;

export function CostsPage() {
  const { t } = useTranslation("costs");
  const { t: tCommon } = useTranslation();
  usePageTitle(t("title"), tCommon("pages.costs.description"));

  return (
    <PageShell>
      <Reveal>
        <PageHeader title={t("title")} intro={t("intro")} />
      </Reveal>

      <Reveal className="mt-10">
        <ol className="space-y-4">
          {STEPS.map((s, i) => (
            <li key={s} className="flex gap-4 glass rounded-2xl md:rounded-3xl p-5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sage-100 font-display text-sm md:text-base text-petrol-700">
                {i + 1}
              </span>
              <div>
                <h2 className="text-base md:text-lg">{t(`steps.${s}.heading`)}</h2>
                <p className="mt-1 text-sm md:text-base text-ink-muted">
                  {t(`steps.${s}.body`)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal className="mt-8 grid gap-4 sm:grid-cols-2">
        <InfoTile title={t("reimbursement.heading")}>
          <p className="mt-1 text-sm md:text-base text-ink-muted">
            {t("reimbursement.body")}
          </p>
        </InfoTile>
        <InfoTile title={t("paying.heading")}>
          <p className="mt-1 text-sm md:text-base text-ink-muted">{t("paying.body")}</p>
        </InfoTile>
      </Reveal>

      <Reveal>
        <p className="mt-8 text-sm md:text-base leading-relaxed text-ink-muted">
          {t("disclaimer")}
        </p>

        <Button
          asChild
          variant="cta"
          className="mt-6 w-full sm:w-auto"
        >
          <Link to={paths.assessment.start}>{t("cta")}</Link>
        </Button>
      </Reveal>
    </PageShell>
  );
}
