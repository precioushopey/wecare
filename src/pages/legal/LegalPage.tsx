import { useTranslation } from "react-i18next";

import { usePageTitle } from "@/app/usePageTitle";
import { Reveal } from "@/components/marketing/Reveal";
import { seoIndexable } from "@/seo/config";

export type LegalDoc =
  "imprint" | "privacy" | "terms" | "cookies" | "shipping" | "refunds";

interface LegalField {
  label: string;
  value: string;
}

interface LegalSection {
  id: string;
  heading: string;
  body?: string[];
  list?: string[];
  /** Extra paragraphs rendered after the list/fields (e.g. a closing note). */
  bodyAfter?: string[];
  fields?: LegalField[];
}

/**
 * Content for every /legal/* document (doc section 15) — draft text, rewritten
 * Aug 31 2026 from owner-supplied source files (see CLAUDE.md "Legal page
 * content"), following the project's Austria language rules (never
 * "treats/cures", never a guaranteed prescription). Entity facts (`WeCare
 * GmbH`, `Musterstraße 1, 1010 Wien`, `FN 000000a`, `ATU00000000`, `Max
 * Mustermann`, effective date `31 August 2026`) are **temporary placeholder
 * values** — obviously-provisional, to be replaced with WeCare's real
 * registered details before launch. The one confirmed detail is the contact
 * email `support@wecare360.de` (owner, Sept 2026 — the only address they
 * gave), used for every contact/DPO email.
 *
 * The Impressum's "Service provider" block (company / address / represented-by
 * / Firmenbuch / UID) and its phone number were **removed entirely** (owner
 * request, Sept 2026 — do not publish fabricated registration data; a real
 * Impressum requires these, so restore them with genuine registered details
 * before any public launch). The placeholder entity facts now remain only in
 * the Privacy Policy's controller section, pending real registration.
 *
 * Effective dates are blank until legal sign-off / go-live (PO decision, Sept
 * 2026 — no plausible-but-fake date); while blank the page shows
 * "Draft — not yet in effect". `imprint` and `privacy` also carry a
 * pre-launch notice while the site is not indexable, because their real
 * registered-entity identification is still a hard launch blocker.
 *
 * Content lives in `legal.json` (`legal:docs.<doc>`); title/one-line
 * description stay in `common:pages.legal.*`.
 */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  const { t } = useTranslation(["legal", "common"]);
  usePageTitle(
    t(`common:pages.legal.${doc}.title`),
    t(`common:pages.legal.${doc}.description`),
  );

  const effectiveDate = t(`legal:docs.${doc}.effectiveDate`);
  const intro = t(`legal:docs.${doc}.intro`);
  const sections = t(`legal:docs.${doc}.sections`, {
    returnObjects: true,
  }) as LegalSection[];
  const showPreLaunchNotice =
    !seoIndexable() && (doc === "imprint" || doc === "privacy");

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-petrol-600">
          {t("common:brand.name")}
        </p>
        <h1 className="mt-3">{t(`common:pages.legal.${doc}.title`)}</h1>
        <p className="mt-2 text-sm text-ink-muted">
          {effectiveDate
            ? t("legal:effectiveDateLabel", { date: effectiveDate })
            : t("legal:draftNotEffective")}
        </p>
        {showPreLaunchNotice ? (
          <p className="mt-4 rounded-xl border border-border bg-surface-raised p-3 text-sm text-ink-muted">
            {t("legal:preLaunchNotice")}
          </p>
        ) : null}
        {intro ? <p className="mt-4 text-lg text-ink-muted">{intro}</p> : null}
      </Reveal>

      {sections.length > 4 ? (
        <Reveal className="mt-10">
          <nav
            aria-label={t("legal:tocLabel")}
            className="glass rounded-2xl p-5"
          >
            <p className="text-sm font-medium text-ink">
              {t("legal:tocLabel")}
            </p>
            <ol className="mt-2 grid gap-1.5 text-sm sm:grid-cols-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-petrol-700 underline-offset-4 hover:underline"
                  >
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </Reveal>
      ) : null}

      <div className="mt-10 space-y-9">
        {sections.map((s) => (
          <Reveal key={s.id}>
            <section id={s.id} className="scroll-mt-24">
              <h2 className="text-xl">{s.heading}</h2>
              {s.body?.map((p, i) => (
                <p
                  key={i}
                  className="mt-3 text-sm leading-relaxed text-ink-muted"
                >
                  {p}
                </p>
              ))}
              {s.list ? (
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-muted">
                  {s.list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {s.fields ? (
                <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[11rem_1fr]">
                  {s.fields.map((f, i) => (
                    <div key={i} className="contents">
                      <dt className="text-ink">{f.label}</dt>
                      <dd className="text-ink-muted">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {s.bodyAfter?.map((p, i) => (
                <p
                  key={i}
                  className="mt-3 text-sm leading-relaxed text-ink-muted"
                >
                  {p}
                </p>
              ))}
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
