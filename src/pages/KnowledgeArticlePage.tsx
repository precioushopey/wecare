import { Link, Navigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { Button } from "@/app/components/ui/button";
import { paths } from "@/app/paths";
import { usePageTitle } from "@/app/usePageTitle";
import { MedicalNotice } from "@/components/marketing/MedicalNotice";
import { KNOWLEDGE_BY_SLUG } from "@/data/knowledge";
import { siteImage } from "@/data/siteImages";

/**
 * Knowledge article template. The article body is not written yet — the page
 * shows the title, summary and an "in preparation" state routing to the
 * assessment, plus the standing medical notice.
 */
export function KnowledgeArticlePage() {
  const { slug } = useParams();
  const { t } = useTranslation("knowledge");

  const article = slug ? KNOWLEDGE_BY_SLUG[slug] : undefined;
  usePageTitle(article ? t(`articles.${article.slug}.title`) : t("title"));

  if (!article) {
    return <Navigate to={paths.knowledgeHub} replace />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Link
        to={paths.knowledgeHub}
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted underline-offset-4 hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t("article.back")}
      </Link>

      <p className="mt-6 text-xs font-medium text-petrol-600">
        {t(`topics.${article.topic}`)} ·{" "}
        {t("readTime", { count: article.readMin })}
      </p>
      <h1 className="mt-2">{t(`articles.${article.slug}.title`)}</h1>

      <div className="image-glow mt-6 overflow-hidden rounded-3xl">
        <ImageWithFallback
          src={siteImage(article.imageKey)}
          alt=""
          className="aspect-[16/9] w-full object-cover"
        />
      </div>

      <p className="mt-6 text-lg text-ink-muted">
        {t(`articles.${article.slug}.summary`)}
      </p>

      <div className="glass-strong mt-8 rounded-3xl p-6">
        <p className="text-sm text-ink-muted">{t("article.inPreparation")}</p>
        <Button asChild variant="cta" className="mt-4">
          <Link to={paths.assessment.start}>{t("article.cta")}</Link>
        </Button>
      </div>

      <MedicalNotice className="mt-8" />
    </div>
  );
}
