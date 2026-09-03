import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { Reveal } from "@/components/marketing/Reveal";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/seo/StructuredData";

/**
 * FAQ page — categorised service questions (how it works, medical review,
 * solutions & delivery, privacy). Not in the primary nav (owner decision); the
 * footer links here. Content only describes how the process works — no medical
 * claims, per the Austria language rules.
 */
const CATEGORIES = ["start", "review", "orders", "privacy"] as const;

export function FaqPage() {
  const { t } = useTranslation("faq");
  const { t: tCommon } = useTranslation();
  usePageTitle(t("title"), tCommon("pages.faq.description"));

  // Flatten every category's Q&A for the FAQPage schema. `text` fields are
  // indexed claims — LEGAL REVIEW alongside the visible copy (§H).
  const faqItems = CATEGORIES.flatMap((cat) => {
    const keys = Object.keys(
      t(`categories.${cat}.items`, { returnObjects: true }) as Record<
        string,
        unknown
      >,
    );
    return keys.map((key) => ({
      question: t(`categories.${cat}.items.${key}.q`),
      answer: t(`categories.${cat}.items.${key}.a`),
    }));
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <BreadcrumbJsonLd trail={[{ name: t("title"), path: paths.faq }]} />
      <FaqJsonLd items={faqItems} />
      <Reveal>
        <h1>{t("title")}</h1>
        <p className="mt-3 text-lg text-ink-muted">{t("intro")}</p>
      </Reveal>

      <div className="mt-10 space-y-10">
        {CATEGORIES.map((cat) => {
          const items = Object.keys(
            t(`categories.${cat}.items`, { returnObjects: true }) as Record<
              string,
              unknown
            >,
          );
          return (
            <Reveal key={cat}>
              <section>
                <h2 className="text-xl">{t(`categories.${cat}.heading`)}</h2>
                <Accordion type="single" collapsible className="mt-3">
                  {items.map((key) => (
                    <AccordionItem key={key} value={`${cat}-${key}`}>
                      <AccordionTrigger>
                        {t(`categories.${cat}.items.${key}.q`)}
                      </AccordionTrigger>
                      <AccordionContent className="text-ink-muted">
                        {t(`categories.${cat}.items.${key}.a`)}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            </Reveal>
          );
        })}
      </div>

      <Reveal className="glass mt-12 flex flex-col gap-3 rounded-2xl md:rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-base text-ink">
            {t("contact.heading")}
          </p>
          <p className="mt-1 text-sm text-ink-muted">{t("contact.body")}</p>
        </div>
        <Button asChild variant="cta" className="w-full sm:w-auto sm:shrink-0">
          <Link to={paths.contact}>{t("contact.cta")}</Link>
        </Button>
      </Reveal>
    </div>
  );
}
