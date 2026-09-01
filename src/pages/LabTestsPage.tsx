import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";

import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { COA_CONFIRMED } from "@/config";
import { SOLUTIONS, solutionExampleCoa } from "@/data/solutions";
import { useLanguage } from "@/i18n/useLanguage";
import { formatDate } from "@/lib/format";

/**
 * Lab Tests / COA page (doc section 15). One row per solution with the
 * certificate-of-analysis values: CBD, CBG, CBN, THC, batch number, test date
 * and safety testing — once real lab data exists (`COA_CONFIRMED`, owner
 * decision D11). Until then this shows a plain per-solution list and no
 * fabricated cannabinoid/batch/date values or "Lab tested" badge.
 */
export function LabTestsPage() {
  const { t } = useTranslation("common");
  const { t: ts } = useTranslation("shop");
  const { language } = useLanguage();
  usePageTitle(t("pages.labTests.title"), t("pages.labTests.description"));

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-6 text-petrol-600" aria-hidden />
        <h1>{t("pages.labTests.title")}</h1>
        {COA_CONFIRMED ? (
          <span className="rounded-full bg-sage-100 px-2.5 py-0.5 text-xs font-medium text-petrol-700">
            {ts("solution.labTestedBadge")}
          </span>
        ) : null}
      </div>
      <p className="mt-3 max-w-2xl text-lg text-ink-muted">
        {t("pages.labTests.description")}
      </p>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">
        {ts(COA_CONFIRMED ? "solution.coaIntro" : "solution.coaPlaceholder")}
      </p>

      {COA_CONFIRMED ? (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[46rem] border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-3 py-2 font-medium">{ts("coaLabels.product")}</th>
                <th className="px-3 py-2 font-medium">{ts("coaLabels.cbd")}</th>
                <th className="px-3 py-2 font-medium">{ts("coaLabels.cbg")}</th>
                <th className="px-3 py-2 font-medium">{ts("coaLabels.cbn")}</th>
                <th className="px-3 py-2 font-medium">{ts("coaLabels.thc")}</th>
                <th className="px-3 py-2 font-medium">{ts("coaLabels.batch")}</th>
                <th className="px-3 py-2 font-medium">{ts("coaLabels.testedOn")}</th>
                <th className="px-3 py-2 font-medium">{ts("coaLabels.safety")}</th>
              </tr>
            </thead>
            <tbody>
              {SOLUTIONS.map((s) => {
                const coa = solutionExampleCoa(s);
                return (
                  <tr key={s.id} className="glass">
                    <td className="rounded-l-2xl px-3 py-3">
                      <Link
                        to={paths.shopProduct(s.id)}
                        className="font-display text-base text-ink underline-offset-4 hover:underline"
                      >
                        {s.name}
                      </Link>
                      <span className="block text-xs text-ink-muted">
                        {ts(`solutions.${s.id}.category`)}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-ink">{coa.cbd}</td>
                    <td className="px-3 py-3 font-mono text-ink">{coa.cbg}</td>
                    <td className="px-3 py-3 font-mono text-ink">{coa.cbn}</td>
                    <td className="px-3 py-3 font-mono text-ink">{coa.thc}</td>
                    <td className="px-3 py-3 font-mono text-ink">{coa.batch}</td>
                    <td className="px-3 py-3 font-mono text-ink">
                      {formatDate(coa.testedOn, language)}
                    </td>
                    <td className="rounded-r-2xl px-3 py-3 text-ink">
                      {ts("coaSafetyValue")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <ul className="mt-8 grid gap-2 sm:grid-cols-2">
          {SOLUTIONS.map((s) => (
            <li key={s.id} className="glass rounded-2xl p-4">
              <Link
                to={paths.shopProduct(s.id)}
                className="font-display text-base text-ink underline-offset-4 hover:underline"
              >
                {s.name}
              </Link>
              <span className="block text-xs text-ink-muted">
                {ts(`solutions.${s.id}.category`)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs leading-relaxed text-ink-muted">
        {t("footer.disclaimer")}
      </p>
    </div>
  );
}
