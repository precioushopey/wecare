import { useEffect } from "react";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";

import {
  absoluteUrl,
  BRAND_NAME,
  OG_IMAGE_PATH,
  robotsContent,
  seoIndexable,
  siteOrigin,
} from "@/seo/config";

/**
 * Per-route document head: `<title>`, `<meta name="description">`, canonical,
 * robots, and the Open Graph / Twitter title-description-url triplet.
 * react-router library mode has no built-in head management, so every page
 * calls this once. The managed tags are always set to the page's value (or a
 * safe default) so nothing leaks between routes.
 *
 * `opts.noindex` forces `noindex` for this route even after the site is
 * cleared for indexing (`VITE_SEO_INDEXABLE=true`) — use it on the funnel,
 * account, cart/checkout and any page tied to a signed-in user. While the
 * site is not indexable, every page is `noindex, nofollow` regardless.
 */
export function usePageTitle(
  title?: string,
  description?: string,
  opts?: { noindex?: boolean },
): void {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const noindex = opts?.noindex ?? false;

  // Defaults captured from index.html at module load (below).
  useEffect(() => {
    const brand = t("brand.name") || BRAND_NAME;
    // " | WeCare" separator (PO decision A9, 2026-09-03).
    const fullTitle = title ? `${title} | ${brand}` : brand;
    const desc = description ?? DEFAULT_DESCRIPTION;
    const canonical = absoluteUrl(pathname);

    document.title = fullTitle;
    setMeta("name", "description", desc);
    setMeta("name", "robots", robotsContent(noindex));
    setLink("canonical", canonical);

    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", canonical);
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc);
    // The share image is only emitted once the site is cleared for indexing —
    // the real 1200x630 banner is a launch deliverable, and until it exists
    // (and the domain is real) there is nothing valid to point at.
    if (seoIndexable()) {
      setMeta("property", "og:image", `${siteOrigin()}${OG_IMAGE_PATH}`);
      setMeta("name", "twitter:image", `${siteOrigin()}${OG_IMAGE_PATH}`);
    }
  }, [title, description, noindex, pathname, t]);
}

const DEFAULT_DESCRIPTION =
  (typeof document !== "undefined" &&
    document
      .querySelector<HTMLMetaElement>('meta[name="description"]')
      ?.getAttribute("content")) ||
  "";

function setMeta(
  keyAttr: "name" | "property",
  key: string,
  value: string,
): void {
  if (typeof document === "undefined") return;
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${keyAttr}="${key}"]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(keyAttr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function setLink(rel: string, href: string): void {
  if (typeof document === "undefined") return;
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}
