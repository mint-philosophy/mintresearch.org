export interface SectionLink {
  href: string;
  label: string;
  divider?: string;
  children?: SectionLink[];
}

export interface PageNav {
  path: string;
  label: string;
  icon: string;
  sections: SectionLink[];
  groupOnly?: boolean;
  alwaysExpanded?: boolean;
}

export const siteNav: PageNav[] = [
  {
    path: "/",
    label: "About MINT Lab",
    icon: "◆",
    sections: [
      { href: "#about", label: "About" },
      { href: "#people", label: "People" },
      { href: "#papers", label: "Papers" },
      { href: "#events", label: "Events" },
      { href: "#news", label: "News" },
      { href: "#contact", label: "Contact" },
    ],
  },
  {
    path: "/cv/",
    label: "Seth Lazar CV",
    icon: "◆",
    sections: [
      { href: "#employment", label: "Employment" },
      { href: "#education", label: "Education" },
      { href: "#fellowships", label: "Fellowships" },
      { href: "#books", label: "Books & Symposia" },
      { href: "#papers", label: "Papers" },
      { href: "#other-writing", label: "Other Writing" },
      { href: "#grants", label: "Grants" },
      { href: "#events", label: "Events" },
      { href: "#presentations", label: "Presentations" },
      { href: "#impact", label: "Impact" },
      { href: "#supervision", label: "Supervision" },
      { href: "#teaching", label: "Teaching" },
      { href: "#service", label: "Service" },
    ],
  },
  {
    path: "/guide/",
    label: "Lab Infrastructure",
    icon: "▸",
    sections: [
      { href: "#overview", label: "Overview" },
      { href: "#what-is-this", label: "What Is This?" },
      { href: "#content-pipeline", label: "Content Pipeline" },
      { href: "#corpus", label: "Corpus Ingestion" },
      { href: "#corpus-overview", label: "The Corpus" },
      { href: "#corpus-search", label: "Corpus Search" },
      { href: "#persona", label: "Minty Persona" },
      { href: "#daemons", label: "Daemons" },
      { href: "#timeline", label: "Schedule" },
      {
        href: "#guide",
        label: "For Lab Members",
        divider: "Practical Guide",
        children: [
          { href: "#bots", label: "Bots" },
          { href: "#slack-channels", label: "Slack Channels" },
        ],
      },
      { href: "#agents", label: "Agent Engineering" },
      { href: "#integrations", label: "Integrations" },
      { href: "#subscribe", label: "Subscribe" },
    ],
  },
  {
    path: "/newsletter/",
    label: "Newsletters",
    icon: "◈",
    sections: [
      { href: "#yesterday-in-ai", label: "Yesterday in AI" },
      { href: "#philosophy-of-computing", label: "Philosophy of Computing" },
      { href: "#back-issues", label: "YinAI Archive" },
    ],
  },
  {
    path: "",
    label: "Microsites",
    icon: "◇",
    groupOnly: true,
    sections: [
      { href: "/governing-with-agents/", label: "Governing with Agents" },
      { href: "/ai-culture/", label: "AI (etc)" },
      { href: "https://blindrefusal.mintresearch.org/", label: "Blind Refusal" },
      { href: "/lab-overview/", label: "Can Machines Reason Morally?" },
      { href: "/nc/", label: "Evaluating LLM Normative Competence" },
      { href: "/FDC", label: "The AGI-Ready Policy Student" },
    ],
  },
  {
    path: "/corpus-map/",
    label: "Corpus Map",
    icon: "◎",
    sections: [],
  },
  {
    path: "/data-dash/",
    label: "Data Dash",
    icon: "▶",
    sections: [],
  },
];
