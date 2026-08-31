/**
 * Marketing photography in `src/assets/images/`, resolved at build time.
 * Keyed by `<folder>/<basename>` without extension, e.g. "Homepage/Hero".
 */
const modules = import.meta.glob<string>("../assets/images/**/*.png", {
  eager: true,
  import: "default",
});

const byKey: Record<string, string> = {};
for (const [path, url] of Object.entries(modules)) {
  const key = path.split("/assets/images/")[1]?.replace(/\.png$/, "");
  if (key) byKey[key] = url;
}

export function siteImage(key: string): string | undefined {
  return byKey[key];
}

/** Named references so components don't hard-code fragile path strings. */
export const IMG = {
  homeHero: "Knowledge Hub/Hero",
  homeDoctor: "How it works Page",
  homeGuidance: "Condition Page",
  homeTrust: "Homepage/Hero",
  /** Left-hand welcome panel on the login page. */
  login: "Homepage/13",
  problem: {
    sleep: "Homepage/9",
    pain: "Homepage/10",
    stressAnxiety: "Homepage/11",
    migraine: "Homepage/12",
  },
  /** "How WeCare works" step cards (keys match `HOW_STEPS`). */
  process: {
    choose: "Knowledge Hub/60",
    assessment: "Knowledge Hub/61",
    match: "Homepage/8",
    continue: "Knowledge Hub/64",
  },
  conditionHero: {
    sleep: "C1 - Sleep Problem/Hero",
    pain: "C2 - Chronic Pain/26",
    stressAnxiety: "C3 - Stress & Anxiety/35",
    migraine: "C4 - Migraine/44",
    generalWellness: "Homepage/Hero",
  },
} as const;
