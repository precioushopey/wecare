import { useTranslation } from "react-i18next";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { PageHeader } from "@/components/marketing/PageHeader";
import { PageShell } from "@/components/marketing/PageShell";
import { PromptCard } from "@/components/marketing/PromptCard";
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
    <PageShell>
      <BreadcrumbJsonLd trail={[{ name: t("title"), path: paths.faq }]} />
      <FaqJsonLd items={faqItems} />
      <Reveal>
        <PageHeader title={t("title")} intro={t("intro")} />
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
                <h2 className="text-xl md:text-2xl">{t(`categories.${cat}.heading`)}</h2>
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

      <Reveal>
        <PromptCard
          title={t("contact.heading")}
          body={t("contact.body")}
          ctaLabel={t("contact.cta")}
          ctaTo={paths.contact}
          className="mt-12"
        />
      </Reveal>
    </PageShell>
  );
}
