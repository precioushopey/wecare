import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { paths } from "@/app/paths";
import { Logo } from "@/components/brand/Logo";

import { AppBadges, SocialLinks, TrustBadges } from "./FooterIcons";
import { LanguageToggle } from "./LanguageToggle";

const footerLink = "text-sm text-white/70 transition-colors hover:text-white";
const heading =
  "font-sans text-xs font-semibold uppercase tracking-wider text-white";

const CONCERNS = [
  { key: "sleep", to: paths.conditions.sleep },
  { key: "pain", to: paths.conditions.pain },
  { key: "stressAnxiety", to: paths.conditions.stressAnxiety },
  { key: "migraine", to: paths.conditions.migraine },
] as const;

export function SiteFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="[background-image:var(--footer-gradient)] text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Logo inverse />
            <p className="max-w-xs text-sm text-white/70">
              {t("brand.tagline")}
            </p>
          </div>

          <nav aria-label={t("footer.headings.concerns")} className="space-y-3">
            <h2 className={heading}>{t("footer.headings.concerns")}</h2>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-1">
              {CONCERNS.map((i) => (
                <li key={i.key}>
                  <Link to={i.to} className={footerLink}>
                    {t(`nav.${i.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t("footer.headings.wecare")} className="space-y-3">
            <h2 className={heading}>{t("footer.headings.wecare")}</h2>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-1">
              <li>
                <Link to={paths.howItWorks} className={footerLink}>
                  {t("nav.howItWorks")}
                </Link>
              </li>
              <li>
                <Link to={paths.faq} className={footerLink}>
                  {t("nav.faq")}
                </Link>
              </li>
              <li>
                <Link to={paths.about} className={footerLink}>
                  {t("footer.links.about")}
                </Link>
              </li>
              <li>
                <Link to={paths.providers} className={footerLink}>
                  {t("footer.links.providers")}
                </Link>
              </li>
              <li>
                <Link to={paths.knowledgeHub} className={footerLink}>
                  {t("footer.links.knowledgeHub")}
                </Link>
              </li>
              <li>
                <Link to={paths.careers} className={footerLink}>
                  {t("footer.links.careers")}
                </Link>
              </li>
              <li>
                <Link to={paths.contact} className={footerLink}>
                  {t("footer.links.contact")}
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label={t("footer.headings.legal")} className="space-y-3">
            <h2 className={heading}>{t("footer.headings.legal")}</h2>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-1">
              <li>
                <Link to={paths.legal.terms} className={footerLink}>
                  {t("footer.links.terms")}
                </Link>
              </li>
              <li>
                <Link to={paths.legal.privacy} className={footerLink}>
                  {t("footer.links.privacy")}
                </Link>
              </li>
              <li>
                <Link to={paths.legal.cookies} className={footerLink}>
                  {t("footer.links.cookies")}
                </Link>
              </li>
              <li>
                <Link to={paths.legal.imprint} className={footerLink}>
                  {t("footer.links.imprint")}
                </Link>
              </li>
              <li>
                <Link to={paths.legal.productDisclaimer} className={footerLink}>
                  {t("footer.links.productDisclaimer")}
                </Link>
              </li>
              <li>
                <Link to={paths.legal.shipping} className={footerLink}>
                  {t("footer.links.shipping")}
                </Link>
              </li>
              <li>
                <Link to={paths.legal.refunds} className={footerLink}>
                  {t("footer.links.refunds")}
                </Link>
              </li>
              <li>
                <Link to={paths.labTests} className={footerLink}>
                  {t("footer.links.labTests")}
                </Link>
              </li>
              <li>
                <Link to={paths.dashboard} className={footerLink}>
                  {t("footer.links.dashboard")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <p className="mt-12 max-w-2xl text-xs leading-relaxed text-white/60">
          {t("footer.disclaimer")}
        </p>

        {/* Social · shipping · payment · app stores */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-10 gap-y-6 rounded-2xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur-md">
          <SocialLinks label={t("footer.social")} />
          <TrustBadges
            shippingLabel={t("footer.shipping")}
            paymentLabel={t("footer.payment")}
          />
          <AppBadges label={t("footer.appStores")} />
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-4">
            <span>{t("footer.copyright", { year })}</span>
            <Link to={paths.login} className="transition-colors hover:text-white">
              {t("nav.login")}
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span>{t("footer.emergencyDisclaimer")}</span>
            <LanguageToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
