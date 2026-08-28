import { useTranslation } from "react-i18next";

import { usePageTitle } from "@/app/usePageTitle";
import { AssessmentRing } from "@/components/brand/AssessmentRing";
import { Logo, LogoMark } from "@/components/brand/Logo";

/**
 * Internal brand / design-token reference (route: /dev/tokens).
 * Not linked from nav or footer.
 */

const SCALE_STEPS = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
] as const;

const SCALES = [
  { name: "petrol", label: "Azure — brand" },
  { name: "sage", label: "Light Green — secondary" },
  { name: "danger", label: "error only (not brand)" },
] as const;

const BRAND_SWATCHES = [
  { label: "Light Azure", value: "--color-light-azure" },
  { label: "Azure", value: "--color-azure" },
  { label: "Dark Azure", value: "--color-dark-azure" },
  { label: "Light Green", value: "--color-light-green" },
] as const;

function ScaleRow({ name, label }: { name: string; label: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {name} <span className="font-normal normal-case">· {label}</span>
      </p>
      <div className="flex overflow-hidden rounded-lg border border-border">
        {SCALE_STEPS.map((step) => (
          <div
            key={step}
            className="flex h-14 flex-1 items-end justify-center pb-1"
            style={{ backgroundColor: `var(--color-${name}-${step})` }}
          >
            <span
              className="font-mono text-[10px]"
              style={{
                color: Number(step) >= 400 ? "#fff" : "var(--color-ink)",
              }}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FoundationPreviewPage() {
  const { t } = useTranslation();
  usePageTitle(t("foundation.title"));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-14 px-4 py-16 sm:px-6">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-petrol-600">
          {t("brand.name")}
        </p>
        <h1 className="max-w-xl">{t("foundation.title")}</h1>
        <p className="max-w-xl text-ink-muted">{t("foundation.intro")}</p>
      </header>

      <section className="space-y-5">
        <h2>Logo</h2>
        <div className="flex flex-wrap items-center gap-8 rounded-xl border border-border bg-surface-raised p-8">
          <Logo className="h-8" />
          <LogoMark className="size-12" title="WeCare" />
          <div className="rounded-xl bg-petrol-900 p-5">
            <Logo className="h-8" inverse />
          </div>
          <div className="rounded-xl bg-petrol-900 p-4">
            <LogoMark className="size-12" inverse title="WeCare" />
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <h2>{t("foundation.paletteHeading")}</h2>
        <div className="flex flex-wrap gap-4">
          {BRAND_SWATCHES.map((s) => (
            <div key={s.label} className="w-40">
              <div
                className="h-16 rounded-lg border border-border"
                style={{ backgroundColor: `var(${s.value})` }}
              />
              <p className="mt-1.5 text-sm text-ink">{s.label}</p>
              <p className="font-mono text-xs text-ink-muted">{s.value}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {SCALES.map((s) => (
            <ScaleRow key={s.name} name={s.name} label={s.label} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <h2>{t("foundation.typographyHeading")}</h2>
        <div className="space-y-4 rounded-xl border border-border bg-surface-raised p-6">
          <p className="font-display text-3xl">
            {t("foundation.typographyDisplay")}
          </p>
          <p className="text-base">{t("foundation.typographyBody")}</p>
          <p className="font-accent text-lg">
            {t("foundation.typographyAccent")}
          </p>
          <p className="font-mono text-sm text-ink-muted">
            {t("foundation.typographyData")}
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <h2>{t("foundation.ringHeading")}</h2>
        <p className="max-w-xl text-ink-muted">{t("foundation.ringCaption")}</p>
        <div className="flex flex-wrap items-center gap-10 rounded-xl border border-border bg-surface-raised p-8">
          <AssessmentRing value={2} total={6} />
          <AssessmentRing value={5} total={6} />
          <AssessmentRing variant="complete" tone="deep" />
          <AssessmentRing variant="decoration" tone="brand" size={96} />
        </div>
      </section>
    </div>
  );
}
