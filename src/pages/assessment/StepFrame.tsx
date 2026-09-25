import type { ReactNode } from "react";

import { cn } from "@/app/components/ui/utils";

/**
 * The shared frame for every assessment step (owner request, 2026-09-24,
 * modelled on quick-green's onboarding): a small eyebrow, a big centred title
 * and a one-line subtitle in a narrow, readable column, then the step's content.
 * The header stays narrow (`max-w-xl`) but the content fills whatever width the
 * page gives the frame — so the option tiles match the width of the action bar
 * under them on the question steps (owner request, 2026-09-24). Every step,
 * including the once-per-device gates (existing customer, age, legal notes),
 * now sits in the default `PageShell` — the same width as the funnel header and
 * progress bar, so the tiles line up with them (2026-09-25; the gates used to
 * pass `max-w-xl` and read as a narrower column inside the shell).
 * No card behind it — the option tiles carry their own surfaces.
 */
export function StepFrame({
  eyebrow,
  title,
  titleId,
  subtitle,
  children,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  /** Lets a radio group point `aria-labelledby` at the title. */
  titleId?: string;
  subtitle?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full", className)}>
      <div className="mx-auto max-w-xl text-center">
        {eyebrow ? (
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.16em] text-petrol-600">
            {eyebrow}
          </p>
        ) : null}
        <h1
          id={titleId}
          className="mt-2 font-display text-2xl md:text-3xl text-ink"
        >
          {title}
        </h1>
        {subtitle ? <p className="mt-3 text-ink-muted">{subtitle}</p> : null}
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
