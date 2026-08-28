/**
 * Knowledge Hub articles. Structure only — titles / summaries / bodies live in
 * the `knowledge` i18n namespace, keyed by `slug`. Article bodies are not
 * written yet; each article page shows an "in preparation" state.
 */

export type KnowledgeTopic =
  | "sleep"
  | "pain"
  | "stressAnxiety"
  | "migraine"
  | "process"
  | "safety";

export interface KnowledgeArticle {
  slug: string;
  topic: KnowledgeTopic;
  /** `siteImage` key, i.e. "<folder>/<basename>" under src/assets/images */
  imageKey: string;
  readMin: number;
}

export const KNOWLEDGE_TOPICS: readonly KnowledgeTopic[] = [
  "sleep",
  "pain",
  "stressAnxiety",
  "migraine",
  "process",
  "safety",
];

export const KNOWLEDGE_ARTICLES: readonly KnowledgeArticle[] = [
  {
    slug: "understanding-sleep-problems",
    topic: "sleep",
    imageKey: "Knowledge Hub/59",
    readMin: 5,
  },
  {
    slug: "ongoing-pain-when-to-seek-guidance",
    topic: "pain",
    imageKey: "Knowledge Hub/60",
    readMin: 6,
  },
  {
    slug: "everyday-stress-and-tension",
    topic: "stressAnxiety",
    imageKey: "Knowledge Hub/61",
    readMin: 4,
  },
  {
    slug: "recurring-migraine-and-head-tension",
    topic: "migraine",
    imageKey: "Knowledge Hub/62",
    readMin: 5,
  },
  {
    slug: "what-a-medical-review-looks-at",
    topic: "process",
    imageKey: "Knowledge Hub/63",
    readMin: 4,
  },
  {
    slug: "how-a-prescription-is-decided",
    topic: "process",
    imageKey: "Knowledge Hub/64",
    readMin: 4,
  },
  {
    slug: "from-pharmacy-to-your-door",
    topic: "process",
    imageKey: "Knowledge Hub/65",
    readMin: 3,
  },
  {
    slug: "using-a-solution-safely",
    topic: "safety",
    imageKey: "Knowledge Hub/66",
    readMin: 5,
  },
];

export const KNOWLEDGE_BY_SLUG: Record<string, KnowledgeArticle> =
  Object.fromEntries(KNOWLEDGE_ARTICLES.map((a) => [a.slug, a]));
