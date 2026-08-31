import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
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
  usePageTitle(t("title"));

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Reveal>
        <h1>{t("title")}</h1>
        <p className="mt-3 text-lg text-ink-muted">{t("intro")}</p>
      </Reveal>

      <Reveal className="mt-10">
        <ol className="space-y-4">
          {STEPS.map((s, i) => (
            <li key={s} className="flex gap-4 glass rounded-3xl p-5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sage-100 font-display text-sm text-petrol-700">
                {i + 1}
              </span>
              <div>
                <h2 className="text-base">{t(`steps.${s}.heading`)}</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  {t(`steps.${s}.body`)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal className="mt-8 grid gap-4 sm:grid-cols-2">
        <section className="glass rounded-3xl p-5">
          <h2 className="text-base">{t("reimbursement.heading")}</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {t("reimbursement.body")}
          </p>
        </section>
        <section className="glass rounded-3xl p-5">
          <h2 className="text-base">{t("paying.heading")}</h2>
          <p className="mt-1 text-sm text-ink-muted">{t("paying.body")}</p>
        </section>
      </Reveal>

      <Reveal>
        <p className="mt-8 text-xs leading-relaxed text-ink-muted">
          {t("disclaimer")}
        </p>

        <Button asChild variant="cta" size="lg" className="mt-6">
          <Link to={paths.assessment.start}>{t("cta")}</Link>
        </Button>
      </Reveal>
    </div>
  );
}
