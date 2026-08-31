import { useTranslation } from "react-i18next";

import { usePageTitle } from "@/app/usePageTitle";
import { Reveal } from "@/components/marketing/Reveal";

export type LegalDoc =
  | "imprint"
  | "privacy"
  | "terms"
  | "cookies"
  | "shipping"
  | "refunds";

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
 * Real content for every /legal/* document (doc section 15) — draft text,
 * original to WeCare (not copied from any reference site), following the
 * project's Austria language rules (never "treats/cures", never a guaranteed
 * prescription). Bracketed placeholders stand in for facts that depend on a
 * real registered entity (address, Firmenbuch/company-register number, VAT
 * ID, DPO contact) — WeCare isn't one yet. `legal:draftNotice` says so on
 * every page; replace both before launch. Content lives in `legal.json`
 * (`legal:docs.<doc>`), title/one-line description stay in `common:pages.legal.*`.
 */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  const { t } = useTranslation(["legal", "common"]);
  usePageTitle(t(`common:pages.legal.${doc}.title`));

  const effectiveDate = t(`legal:docs.${doc}.effectiveDate`);
  const intro = t(`legal:docs.${doc}.intro`);
  const sections = t(`legal:docs.${doc}.sections`, {
    returnObjects: true,
  }) as LegalSection[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-petrol-600">
          {t("common:brand.name")}
        </p>
        <h1 className="mt-3">{t(`common:pages.legal.${doc}.title`)}</h1>
        <p className="mt-2 text-sm text-ink-muted">
          {t("legal:effectiveDateLabel", { date: effectiveDate })}
        </p>
        {intro ? <p className="mt-4 text-lg text-ink-muted">{intro}</p> : null}
      </Reveal>

      <Reveal className="mt-6">
        <div
          role="note"
          className="glass rounded-2xl p-4 text-sm text-ink-muted"
        >
          {t("legal:draftNotice")}
        </div>
      </Reveal>

      {sections.length > 4 ? (
        <Reveal className="mt-8">
          <nav aria-label={t("legal:tocLabel")} className="glass rounded-2xl p-5">
            <p className="text-sm font-medium text-ink">{t("legal:tocLabel")}</p>
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
