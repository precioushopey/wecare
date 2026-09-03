import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/ui/button";
import { DeliveryConfirmation } from "@/components/marketing/DeliveryConfirmation";
import { useAssessment } from "@/features/assessment/AssessmentContext";
import {
  AT_POSTCODE_RE,
  regionForPostcode,
  type RegionKey,
} from "@/features/delivery/delivery";
import { AnalyticsEvent, track } from "@/lib/analytics";

function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** First step of the assessment: confirm we deliver to the user's area.
 *  Every valid Austrian postcode is serviceable — this is reassurance, not a
 *  gate. Calls `onComplete()` once the confirmation has been shown briefly. */
export function PostcodeStep({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation("assessment");
  const { setPostcode } = useAssessment();
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [confirmed, setConfirmed] = useState<
    { postcode: string; region: RegionKey | null } | null
  >(null);
  const advanceTimer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (advanceTimer.current !== null) {
        window.clearTimeout(advanceTimer.current);
      }
    },
    [],
  );

  const valid = AT_POSTCODE_RE.test(value);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (confirmed) return;
    if (!valid) {
      setError(true);
      return;
    }
    const region = regionForPostcode(value) ?? null;
    setPostcode(value, region);
    track(AnalyticsEvent.assessmentPostcodeSubmitted, {
      serviceable: true,
      region: region ?? "unknown",
    });
    setConfirmed({ postcode: value, region });
    // The confirmation line is content, not decoration — keep a short dwell
    // even under reduced motion so it is actually read.
    advanceTimer.current = window.setTimeout(
      onComplete,
      reducedMotion() ? 600 : 1000,
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8">
      <div className="glass-strong rounded-2xl md:rounded-3xl p-6 sm:p-8">
        <h2 className="font-display text-xl md:text-2xl text-ink">
          {t("postcode.heading")}
        </h2>
        <p className="mt-2 text-sm text-ink-muted">{t("postcode.sub")}</p>

        <input
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={4}
          value={value}
          onChange={(e) => {
            setValue(e.target.value.replace(/\D/g, ""));
            setError(false);
          }}
          placeholder={t("postcode.placeholder")}
          aria-invalid={error || undefined}
          disabled={Boolean(confirmed)}
          className="mt-5 block w-full max-w-[12rem] rounded-xl border border-border bg-surface-raised px-3 py-2.5 text-sm text-ink"
        />
        {error ? (
          <p className="mt-2 text-sm text-danger-600">{t("postcode.error")}</p>
        ) : null}

        {confirmed ? (
          <DeliveryConfirmation
            postcode={confirmed.postcode}
            region={confirmed.region}
            className="mt-4 rounded-xl bg-sage-50 p-3"
          />
        ) : null}
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          type="submit"
          variant="default"
          disabled={!valid || Boolean(confirmed)}
        >
          {t("postcode.continue")}
        </Button>
      </div>
    </form>
  );
}
