import { useState } from "react";
import { Link } from "react-router";
import { Trans, useTranslation } from "react-i18next";

import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { PageShell } from "@/components/marketing/PageShell";

import { OptionTile } from "./OptionTile";
import { StepFrame } from "./StepFrame";

const LINK = "underline underline-offset-2 hover:text-ink";

/**
 * The four notes shown above the checkbox (PO request, 2026-09-25, modelled on
 * quick-green's "Important! Please read the following notes and confirm them"
 * page). Deliberately NOT carried over from that page: the GoÄ billing note, the
 * § 630a BGB remote-treatment intro and the invoice/doctor's-letter note — German
 * law / an unconfirmed fee and payment model, none of which we can assert.
 *
 * LEGAL REVIEW REQUIRED before launch: `dataSharing` (it acknowledges the
 * hand-off to the doctor and pharmacy; counsel decides whether health data
 * needs its own explicit Art. 9 consent rather than this shared checkbox) and
 * the "punishable by law" line quick-green has, which is left out on purpose.
 */
const NOTES = ["truthful", "noDiagnosis", "doctorDecides", "dataSharing"] as const;

/**
 * Legal-consent gate shown once (per device) before the assessment, after
 * `AgeGate` (PO request, 2026-09-14). Links to the real `/legal/terms` and
 * `/legal/privacy` documents rather than restating or inventing their
 * content — those pages carry their own "draft, not yet in effect" notice.
 */
export function LegalConsentGate({ onConfirm }: { onConfirm: () => void }) {
  const { t } = useTranslation("assessment");
  const [checked, setChecked] = useState(false);

  return (
    <PageShell className="py-10">
      <StepFrame
        eyebrow={t("phase.leadIn")}
        title={t("legalGate.title")}
        subtitle={t("legalGate.body")}
      >
        <ul className="mb-4 space-y-3 rounded-xl border-2 border-petrol-900/10 bg-white/85 px-5 py-4 text-left text-ink">
          {NOTES.map((note) => (
            <li key={note} className="flex gap-3">
              <span
                aria-hidden
                className="mt-2.5 size-1.5 shrink-0 rounded-full bg-petrol-600"
              />
              <span>
                <Trans
                  t={t}
                  i18nKey={`legalGate.notes.${note}`}
                  components={{ b: <strong className="font-semibold" /> }}
                />
              </span>
            </li>
          ))}
        </ul>

        <OptionTile
          type="checkbox"
          id="legal-gate-confirm"
          checked={checked}
          onChange={() => setChecked((c) => !c)}
          label={
            <Trans
              t={t}
              i18nKey="legalGate.checkbox"
              components={{
                terms: (
                  <Link
                    to={paths.legal.terms}
                    target="_blank"
                    rel="noreferrer"
                    className={LINK}
                  />
                ),
                privacy: (
                  <Link
                    to={paths.legal.privacy}
                    target="_blank"
                    rel="noreferrer"
                    className={LINK}
                  />
                ),
              }}
            />
          }
        />

        {/* Same visual swap as `AgeGate` (Back left, primary right on `sm+`;
            DOM stays primary-first). */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse sm:flex-wrap sm:items-center sm:justify-center">
          <Button
            type="button"
            variant="cta"
            disabled={!checked}
            onClick={onConfirm}
            className="w-full sm:w-auto"
          >
            {t("legalGate.continue")}
          </Button>
          <Button asChild variant="ghost" className="w-full sm:w-auto">
            <Link to={paths.home}>{t("legalGate.back")}</Link>
          </Button>
        </div>
      </StepFrame>
    </PageShell>
  );
}
