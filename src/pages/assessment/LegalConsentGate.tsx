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
 * Legal-consent gate shown once (per device) before the assessment, after
 * `AgeGate` (PO request, 2026-09-14). Links to the real `/legal/terms` and
 * `/legal/privacy` documents rather than restating or inventing their
 * content — those pages carry their own "draft, not yet in effect" notice.
 */
export function LegalConsentGate({ onConfirm }: { onConfirm: () => void }) {
  const { t } = useTranslation("assessment");
  const [checked, setChecked] = useState(false);

  return (
    <PageShell maxWidth="max-w-xl" className="py-10">
      <StepFrame
        eyebrow={t("phase.leadIn")}
        title={t("legalGate.title")}
        subtitle={t("legalGate.body")}
      >
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

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
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
