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
    label: "Lab",
    icon: "◆",
    sections: [
      { href: "#about", label: "About" },
      { href: "#people", label: "People" },
      { href: "#publications", label: "Publications" },
      { href: "#events", label: "Events" },
    ],
  },
  {
    path: "/guide/",
    label: "Guide",
    icon: "▸",
    sections: [
      { href: "#overview", label: "Overview" },
      { href: "#what-is-this", label: "Read → System" },
      { href: "#content-pipeline", label: "Agent → Pipeline" },
      { href: "#corpus", label: "Bash → Ingest" },
      { href: "#corpus-overview", label: "Glob → Corpus" },
      { href: "#corpus-search", label: "Grep → Search" },
      { href: "#persona", label: "Read → Persona" },
      { href: "#daemons", label: "TaskList()" },
      { href: "#timeline", label: "Bash → Schedule" },
      {
        href: "#guide",
        label: "AskUser → Guide",
        divider: "Practical Guide",
        children: [
          { href: "#bots", label: "Bots" },
          { href: "#slack-channels", label: "Slack Channels" },
        ],
      },
      { href: "#agents", label: "Agent → Engineering" },
      { href: "#integrations", label: "WebFetch → APIs" },
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
