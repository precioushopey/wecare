/**
 * Marketing photography in `src/assets/images/`, resolved at build time.
 * Keyed by `<folder>/<basename>` without extension, e.g. "Homepage/Hero".
 */
const modules = import.meta.glob<string>(
  "../assets/images/**/*.{png,jpg,jpeg}",
  { eager: true, import: "default" },
);

const byKey: Record<string, string> = {};
for (const [path, url] of Object.entries(modules)) {
  const key = path
    .split("/assets/images/")[1]
    ?.replace(/\.(png|jpe?g)$/i, "");
  if (key) byKey[key] = url;
}

export function siteImage(key: string): string | undefined {
  return byKey[key];
}

/** Named references so components don't hard-code fragile path strings.
 *  Aug 2026 — the three homepage photos were rotated one section along (owner
 *  request), then hero and "Simple recommendations" were swapped back (owner
 *  call — the tablet/mug photo reads as self-care better than the phone
 *  cut-out for a rotating-problem hero). Net result: hero keeps its original
 *  landscape photo, "Simple recommendations" now carries the portrait phone
 *  cut-out, final CTA is unchanged. `How it works Page.png` is unreferenced. */
export const IMG = {
  /** Hero — landscape cut-out, `w-full` treatment. */
  homeHero: "Knowledge Hub/Hero",
  /** Final-CTA photo — the telehealth cut-out (a person on a video call with
   *  a doctor). Language-free: it replaced `assessment-2.png`, which was a
   *  laptop mock-up of the EN assessment UI showing on the DE homepage
   *  (audit WC-19). */
  homeDoctor: "Homepage/Hero",
  homeGuidance: "Condition Page",
  /** Right-hand anchor photo in the "Simple recommendations" section —
   *  portrait phone cut-out (`hero section.png`, transparent bg). */
  homeSolutions: "hero section",
  /** Left-hand welcome panel on the login page — the portrait phone cut-out
   *  (`hero section.png`, transparent bg), given the `image-glow` +
   *  `object-contain` treatment rather than a full-bleed photo card. */
  login: "hero section",
  problem: {
    sleep: "Homepage/9",
    pain: "Homepage/10",
    stressAnxiety: "Homepage/11",
    migraine: "Homepage/12",
  },
  /** "How WeCare works" step cards (keys match `HOW_STEPS`). Steps 2 & 3
   *  swapped to the `assessment`/`results` photos (owner request, Aug
   *  2026); `choose`/`continue` are unchanged. */
  process: {
    choose: "Knowledge Hub/60",
    assessment: "assessment",
    match: "results",
    /** "Continue to product, support or follow-up" — a courier handing over a
     *  parcel. Was `64.png` (a spread of prescription pill bottles), which
     *  read product-forward for a next-steps step (audit WC-25). */
    continue: "Knowledge Hub/63",
  },
  conditionHero: {
    sleep: "C1 - Sleep Problem/Hero",
    pain: "C2 - Chronic Pain/26",
    stressAnxiety: "C3 - Stress & Anxiety/35",
    migraine: "C4 - Migraine/44",
    generalWellness: "Homepage/Hero",
  },
} as const;
