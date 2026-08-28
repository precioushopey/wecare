import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { cn } from "@/app/components/ui/utils";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { Reveal } from "@/components/marketing/Reveal";
import { Section, SectionHeading } from "@/components/marketing/Section";
import {
  KNOWLEDGE_ARTICLES,
  KNOWLEDGE_TOPICS,
  type KnowledgeTopic,
} from "@/data/knowledge";
import { siteImage } from "@/data/siteImages";

type Filter = KnowledgeTopic | "all";

const FILTERS: Filter[] = ["all", ...KNOWLEDGE_TOPICS];

export function KnowledgeHubPage() {
  const { t } = useTranslation("knowledge");
  usePageTitle(t("title"));

  const [filter, setFilter] = useState<Filter>("all");
  const shown = KNOWLEDGE_ARTICLES.filter(
    (a) => filter === "all" || a.topic === filter,
  );

  return (
    <Section tone="surface" className="pt-14 sm:pt-20">
      <Reveal className="max-w-3xl">
        <SectionHeading title={t("title")} intro={t("intro")} />
      </Reveal>

      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm transition-colors",
              filter === f
                ? "bg-petrol-600 text-white"
                : "glass text-ink-muted hover:text-ink",
            )}
          >
            {t(`topics.${f}`)}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((a, i) => (
          <Reveal key={a.slug} delayMs={i * 50}>
            <Link
              to={paths.knowledgeArticle(a.slug)}
              className="group flex h-full flex-col overflow-hidden rounded-3xl glass glass-hover"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <ImageWithFallback
                  src={siteImage(a.imageKey)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <span className="text-xs font-medium text-petrol-600">
                  {t(`topics.${a.topic}`)} ·{" "}
                  {t("readTime", { count: a.readMin })}
                </span>
                <h2 className="mt-2 text-base">
                  {t(`articles.${a.slug}.title`)}
                </h2>
                <p className="mt-2 flex-1 text-sm text-ink-muted">
                  {t(`articles.${a.slug}.summary`)}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-petrol-700">
                  {t("article.read")}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
