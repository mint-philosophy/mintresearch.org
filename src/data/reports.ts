export interface Report {
  slug: string;
  title: string;
  date: string;       // YYYY-MM-DD
  dateLabel: string;   // display format
  topic: string;
  papers: number;
  wordCount: string;
  summary: string;
}

export const reports: Report[] = [
  {
    slug: "ai-welfare",
    title: "AI Welfare: A Quick Review of Recent Work",
    date: "2026-02-26",
    dateLabel: "26 Feb 2026",
    topic: "AI Moral Status",
    papers: 19,
    wordCount: "~4,000",
    summary: "Safety-welfare tensions, the willing servant problem, philosophical foundations for AI moral consideration, and empirical approaches to measuring welfare in language models.",
  },
  {
    slug: "language-model-moral-competence",
    title: "Language Model Moral Competence",
    date: "2026-02-27",
    dateLabel: "27 Feb 2026",
    topic: "LLM Evaluation",
    papers: 22,
    wordCount: "~5,200",
    summary: "Benchmarks for moral reasoning in LLMs, the gap between surface competence and genuine moral understanding, cross-linguistic variation, and what moral competence would actually require.",
  },
  {
    slug: "ai-in-war",
    title: "AI in War and by the Military",
    date: "2026-02-28",
    dateLabel: "28 Feb 2026",
    topic: "Military AI",
    papers: 38,
    wordCount: "~8,500",
    summary: "Autonomous weapons and responsibility gaps, cyber operations, strategic competition narratives, surveillance and authoritarianism, decision support and escalation, governance architectures.",
  },
  {
    slug: "ai-slop",
    title: "AI Slop: Definitions and Normative Status",
    date: "2026-03-04",
    dateLabel: "4 Mar 2026",
    topic: "Epistemic Pollution",
    papers: 14,
    wordCount: "~9,000",
    summary: "From vernacular insult to contested concept. Descriptive and normative framings of AI slop, epistemic pollution, automation bias, and whether the category is analytically useful.",
  },
];
