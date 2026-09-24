import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/ui/button";
import { DeliveryConfirmation } from "@/components/marketing/DeliveryConfirmation";
import { useAssessment } from "@/features/assessment/AssessmentContext";
import {
  countryForPostcode,
  regionForPostcode,
  type RegionKey,
} from "@/features/delivery/delivery";
import { AnalyticsEvent, track } from "@/lib/analytics";

import { StepFrame } from "./StepFrame";

function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** First step of the assessment: confirm we deliver to the user's area.
 *  Every valid Austrian (4-digit) or German (5-digit) postcode is serviceable — this is reassurance, not a
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

  const postcodeCountry = countryForPostcode(value);
  const valid = postcodeCountry !== undefined;

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
      region: region ?? (postcodeCountry === "DE" ? "de" : "unknown"),
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
    <form onSubmit={onSubmit}>
      <StepFrame
        eyebrow={t("phase.leadIn")}
        title={t("postcode.heading")}
        subtitle={t("postcode.sub")}
      >
        <input
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={5}
          value={value}
          onChange={(e) => {
            setValue(e.target.value.replace(/\D/g, ""));
            setError(false);
          }}
          placeholder={t("postcode.placeholder")}
          aria-label={t("postcode.heading")}
          aria-invalid={error || undefined}
          disabled={Boolean(confirmed)}
          className="mx-auto block w-full max-w-[14rem] rounded-xl border-2 border-border bg-white/85 px-4 py-3 text-center text-ink"
        />
        {error ? (
          <p
            role="alert"
            className="mt-2 text-center text-sm md:text-base text-danger-600"
          >
            {t("postcode.error")}
          </p>
        ) : null}

        {confirmed ? (
          <DeliveryConfirmation
            postcode={confirmed.postcode}
            region={confirmed.region}
            className="mt-4 rounded-xl bg-sage-50 p-3"
          />
        ) : null}

        <div className="mt-8 flex justify-center">
          <Button
            type="submit"
            variant="default"
            disabled={!valid || Boolean(confirmed)}
            className="w-full sm:w-auto"
          >
            {t("postcode.continue")}
          </Button>
        </div>
      </StepFrame>
    </form>
  );
}
