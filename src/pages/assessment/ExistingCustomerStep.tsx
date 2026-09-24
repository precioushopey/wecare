import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { PageShell } from "@/components/marketing/PageShell";
import { AnalyticsEvent, track } from "@/lib/analytics";

import { OptionTile } from "./OptionTile";
import { StepFrame } from "./StepFrame";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * First step of the assessment: "Already with WeCare? Have you already received
 * a prescription through WeCare?" — Yes / No side by side. Picking an answer
 * advances after a short beat (like the question steps). "Yes" → the caller
 * sends the visitor to log in; "No" → the caller remembers it and continues.
 * The answer itself is never stored or sent anywhere except as an anonymous
 * yes/no analytics event.
 */
export function ExistingCustomerStep({
  onExisting,
  onNew,
}: {
  onExisting: () => void;
  onNew: () => void;
}) {
  const { t } = useTranslation("assessment");
  const [choice, setChoice] = useState<"yes" | "no" | null>(null);
  const timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  function pick(answer: "yes" | "no") {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setChoice(answer);
    track(AnalyticsEvent.assessmentExistingCustomerAnswered, { answer });
    timer.current = window.setTimeout(
      () => (answer === "yes" ? onExisting() : onNew()),
      prefersReducedMotion() ? 120 : 350,
    );
  }

  return (
    <PageShell maxWidth="max-w-xl" className="py-10">
      <StepFrame
        eyebrow={t("phase.leadIn")}
        title={t("existing.title")}
        titleId="existing-title"
        subtitle={t("existing.subtitle")}
      >
        <div
          role="radiogroup"
          aria-labelledby="existing-title"
          className="grid grid-cols-2 gap-3"
        >
          {(["yes", "no"] as const).map((opt) => (
            <OptionTile
              key={opt}
              id={`existing-${opt}`}
              name="existing-customer"
              value={opt}
              checked={choice === opt}
              onChange={() => pick(opt)}
              label={t(`existing.${opt}`)}
            />
          ))}
        </div>
      </StepFrame>
    </PageShell>
  );
}
