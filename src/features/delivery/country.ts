/**
 * Which country's delivery map to show on the homepage (changes-matrix,
 * 2026-09-24: "Austrian visitor → Austria, German visitor → the German version").
 *
 * **This is NOT an IP lookup.** A true IP → country lookup needs either a host
 * edge header (the production host is still undecided) or a third-party geo-IP
 * call from the browser. The latter sends every visitor's IP address to a third
 * party before any consent is given (ePrivacy / GDPR, and it would need a
 * privacy-policy entry — D16 data minimisation), so it is deliberately not done
 * here. Instead the browser's own signals are used, with no network call:
 *   1. the IANA time zone (Europe/Vienna → AT, Europe/Berlin → DE) — the
 *      closest local proxy for physical location;
 *   2. otherwise an explicit region in the browser language (de-DE, en-AT…);
 *   3. otherwise Austria (the primary market).
 * A real IP source plugs in through `<meta name="wecare-country" content="AT|DE">`:
 * if the host (edge function / CDN / server) resolves the request's IP and writes
 * that tag into the HTML, it wins over everything below — no third-party call from
 * the browser, no frontend change. (Mischa asked for IP identification; that needs
 * the host's help, and the host is still undecided.) Until then the signals below
 * are the fallback. The homepage also shows a manual AT/DE switch, so a wrong guess
 * (VPN, travelling, an expat's browser settings) is one tap to fix.
 *
 * Automated browsers (the go-live prerender, `navigator.webdriver`) always get
 * Austria, so the static HTML never bakes in the build machine's country.
 */

export type DeliveryCountry = "AT" | "DE";

export const DELIVERY_COUNTRIES: readonly DeliveryCountry[] = ["AT", "DE"];

const DE_ZONES = new Set(["Europe/Berlin", "Europe/Busingen"]);
const AT_ZONES = new Set(["Europe/Vienna"]);

/** A country the host wrote into the page (from the request's IP), if any. */
function hostCountry(): DeliveryCountry | null {
  if (typeof document === "undefined") return null;
  const v = document
    .querySelector('meta[name="wecare-country"]')
    ?.getAttribute("content")
    ?.trim()
    .toUpperCase();
  return v === "AT" || v === "DE" ? v : null;
}

export function detectVisitorCountry(): DeliveryCountry {
  if (typeof navigator === "undefined" || navigator.webdriver) return "AT";

  const fromHost = hostCountry();
  if (fromHost) return fromHost;

  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (DE_ZONES.has(zone)) return "DE";
    if (AT_ZONES.has(zone)) return "AT";
  } catch {
    /* no Intl time zone — fall through to the language */
  }

  const languages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  for (const lang of languages) {
    const region = lang?.split("-")[1]?.toUpperCase();
    if (region === "DE") return "DE";
    if (region === "AT") return "AT";
  }
  return "AT";
}
