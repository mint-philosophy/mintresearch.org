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
}

export const siteNav: PageNav[] = [
  {
    path: "/",
    label: "About the Lab",
    icon: "◆",
    sections: [
      { href: "#about", label: "About" },
      { href: "#people", label: "People" },
      { href: "#publications", label: "Publications" },
      { href: "#events", label: "Events" },
      { href: "#news", label: "News" },
      { href: "#contact", label: "Contact" },
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
    label: "Newsletter",
    icon: "◈",
    sections: [
      { href: "#weekly", label: "Weekly Digest" },
      { href: "#philosophy-of-computing", label: "Philosophy of Computing" },
      { href: "#back-issues", label: "Back Issues" },
      { href: "#subscribe", label: "Subscribe" },
    ],
  },
  {
    path: "/corpus-map/",
    label: "Corpus Map",
    icon: "◎",
    sections: [],
  },
];
