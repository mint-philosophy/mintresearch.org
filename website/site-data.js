/**
 * MINT Lab Website — Content Data
 * ================================
 *
 * All site content lives here. To update the website, edit this file.
 * The HTML structure (index.html) and styling (style.css) are separate —
 * you only need to touch this file to update people, publications, events,
 * or project descriptions.
 *
 * HOW TO EDIT:
 *
 * ADDING A NEW TEAM MEMBER:
 *   Find the `people.team` array below and add:
 *   { name: "Full Name", role: "Role Title", discipline: "Field" }
 *
 * ADDING A PUBLICATION:
 *   Find the `feed` array below and add:
 *   { type: "publication", title: "Paper Title", authors: "Author, Author",
 *     date: "2026", description: "Journal Name", url: "https://..." }
 *
 * ADDING AN EVENT:
 *   Find the `feed` array below and add:
 *   { type: "event", title: "Event Name", date: "2026",
 *     description: "Brief description", url: null }
 *
 * ADDING NEWS:
 *   Find the `feed` array below and add:
 *   { type: "news", title: "Headline", date: "2026",
 *     description: "Brief description", url: null }
 *
 * ADDING A NEWSLETTER POST:
 *   Find the `feed` array below and add:
 *   { type: "newsletter", title: "Post Title", date: "2026",
 *     description: "Brief description", url: "https://philosophyofcomputing.substack.com/p/..." }
 *
 * MOVING SOMEONE TO ALUMNI:
 *   Cut their entry from people.team and paste into people.alumni.
 *   Change their role to "Alumni" or "Alumni, [previous role]".
 */

const SITE_DATA = {

  // ============================================================
  // META — Site-wide settings
  // ============================================================

  meta: {
    labName: "MINT Lab",
    fullName: "Machine Intelligence and Normative Theory",
    tagline: "Machine Intelligence and Normative Theory",
    institution: "Australian National University · Johns Hopkins University",
    contactEmail: "mint@anu.edu.au",
    twitter: "https://twitter.com/mintresearchlab",
    substackSeth: "https://sethlazar.substack.com",
    substackNewsletter: "https://philosophyofcomputing.substack.com/",
  },

  // ============================================================
  // ABOUT — Principal Investigator and lab mission
  // ============================================================

  about: {
    pi: {
      name: "Seth Lazar",
      title: "Professor of Philosophy",
      institution: "Johns Hopkins University",
      photo: null, // Photo available: assets/photos/seth-lazar.jpg
      bio: "Seth Lazar is Professor of Philosophy at Johns Hopkins University and founding director of MINT Lab. His research focuses on the normative philosophy of computing\u200A\u2014\u200Afoundational questions about what computational tools should be used for, who decides, and how AI systems reshape power, agency, and moral life. He is also a Distinguished Research Fellow at the University of Oxford Institute for Ethics in AI.",
    },
    mission: "MINT Lab develops robust philosophical foundations for AI governance and safety. We do empirically- and technically-grounded philosophical work on AI and computational technologies, bridging normative theory with real-world impact through policy engagement, industry collaboration, and public scholarship.",
  },

  // ============================================================
  // RESEARCH PROJECTS — Expandable cards on the page
  // ============================================================
  // TODO: Seth/Theo to provide full descriptions via SPEC doc.
  //       Current descriptions are placeholders.

  projects: [
    {
      id: "normative-competence",
      title: "Normative Competence",
      icon: "\u2696\uFE0F",
      summary: "How should AI systems handle moral reasoning? We investigate the foundations of normative competence in artificial agents\u200A\u2014\u200Awhat it means for machines to act well, and how to evaluate whether they do.",
      description: "Placeholder\u200A\u2014\u200Adetailed description to be provided. This project investigates the moral and epistemic capacities required for AI systems to function as normative agents, drawing on philosophical accounts of moral skill, practical wisdom, and ethical expertise.",
    },
    {
      id: "agents",
      title: "Agents",
      icon: "\uD83E\uDD16",
      summary: "Language model agents are becoming autonomous actors in the world. We study their societal impact, the right norms to guide their behaviour, and the policies and technical interventions needed to govern them.",
      description: "Placeholder\u200A\u2014\u200Adetailed description to be provided. This project examines tool-using augmented language models in executive control, anticipating the societal impact of these agents and developing frameworks for their responsible deployment.",
    },
    {
      id: "post-agi",
      title: "Post-AGI Political Philosophy",
      icon: "\uD83C\uDF10",
      summary: "What political and social institutions do we need for a world with transformatively powerful AI? We develop philosophical frameworks for governance, justice, and human flourishing beyond the current paradigm.",
      description: "Placeholder\u200A\u2014\u200Adetailed description to be provided. This project develops political philosophy adequate to the possibility of artificial general intelligence, addressing questions of power, distribution, democratic governance, and human meaning in a post-AGI world.",
    },
  ],

  // ============================================================
  // FEED — Publications, Events, News
  // ============================================================
  // Sorted by date (newest first). The page renders them in this order.

  feed: [
    // --- Publications ---
    {
      type: "publication",
      title: "Build Agent Advocates, Not Platform Agents",
      authors: "Kapoor, Kolt, Lazar",
      date: "2025",
      description: "ICML 2025",
      url: null,
    },
    {
      type: "publication",
      title: "Infrastructure for AI Agents",
      authors: "Lazar, Perrier, Chan",
      date: "2025",
      description: "Preprint",
      url: null,
    },
    {
      type: "publication",
      title: "Can LLMs Advance Democratic Values?",
      authors: "Lazar, Manuali",
      date: "2025",
      description: "FAccT 2025",
      url: null,
    },
    {
      type: "publication",
      title: "No Right to an Explanation",
      authors: "Karlan, Kugelberg",
      date: "2025",
      description: "Philosophy and Phenomenological Research",
      url: null,
    },
    {
      type: "publication",
      title: "Moral Disagreement and the Limits of AI Value Alignment",
      authors: "Schuster, Kilov",
      date: "2025",
      description: "AI & Society",
      url: null,
    },
    {
      type: "publication",
      title: "Governing the Algorithmic City",
      authors: "Lazar",
      date: "2024",
      description: "Philosophy & Public Affairs",
      url: null,
    },
    {
      type: "publication",
      title: "Moral Agency Without Consciousness",
      authors: "Semler",
      date: "2024",
      description: "Canadian Journal of Philosophy",
      url: null,
    },
    {
      type: "publication",
      title: "Attention, Moral Skill, and Algorithmic Recommendation",
      authors: "Lazar, Schuster",
      date: "2024",
      description: "Philosophical Studies",
      url: null,
    },
    {
      type: "publication",
      title: "On the Site of Predictive Justice",
      authors: "Lazar, Stone",
      date: "2024",
      description: "Nous",
      url: null,
    },
    {
      type: "publication",
      title: "Frontier AI Ethics",
      authors: "Lazar",
      date: "2024",
      description: "Aeon",
      url: null,
    },

    // --- Events ---
    {
      type: "event",
      title: "Sociotechnical AI Safety Retreat",
      date: "2024",
      description: "Kioloa Coastal Campus \u2014 focused research workshop on integrated approaches to AI safety",
      url: null,
    },
    {
      type: "event",
      title: "Gianelli Annual Lecture: On AI Personhood Without Sentience",
      date: "2024",
      description: "Seth Lazar at St. John\u2019s University",
      url: null,
    },
    {
      type: "event",
      title: "Workshop: The Philosophy of AI \u2014 Themes from Seth Lazar",
      date: "2024",
      description: "University of Hong Kong",
      url: null,
    },
    {
      type: "event",
      title: "NeurIPS Keynote: Philosophical Foundations for Pluralistic Alignment",
      date: "2024",
      description: "Invited keynote at NeurIPS conference",
      url: null,
    },
    {
      type: "event",
      title: "Australian AI Safety Forum",
      date: "2024",
      description: "Keynote presentation on AI governance and safety policy",
      url: null,
    },

    // --- Newsletter (Philosophy of Computing Substack) ---
    {
      type: "newsletter",
      title: "Placeholder \u2014 recent newsletter posts will go here",
      date: "2025",
      description: "Replace with actual posts from philosophyofcomputing.substack.com",
      url: "https://philosophyofcomputing.substack.com/",
    },

    // --- News ---
    {
      type: "news",
      title: "MINT Lab Moves to Johns Hopkins University",
      date: "2025",
      description: "The lab relocates from the Australian National University to the Department of Philosophy at Johns Hopkins",
      url: null,
    },
    {
      type: "news",
      title: "Seth Lazar Joins Knight Institute as Senior AI Advisor",
      date: "2024",
      description: "Knight First Amendment Institute, 2024\u20132025 appointment",
      url: null,
    },
    {
      type: "news",
      title: "UN Human Development Report Features MINT Research",
      date: "2024",
      description: "Seth Lazar\u2019s work on algorithmic power highlighted in the UN\u2019s flagship report",
      url: null,
    },
  ],

  // ============================================================
  // PEOPLE — Team, Affiliates, Alumni
  // ============================================================
  // Each person: { name, role, discipline (optional), bio (optional), photo (optional) }
  // To add someone, copy an existing entry and edit the fields.
  //
  // PHOTO MAPPING (48 of 61 available in assets/photos/):
  //   To enable photos, add photo: "assets/photos/filename" to each entry.
  //   Seth Lazar → seth-lazar.jpg | Daniel Kilov → daniel-kilov.jpg
  //   Secil Yanik Guyot → secil-yanik-guyot.jpg | Jake Stone → jake-stone.png
  //   Andrew Smart → andrew-smart.jpg | Tim Dubber → tim-dubber.jpg
  //   Vincent Zhang → vincent-zhang.jpg | James Leib → james-leib.jpg
  //   Theo Murray → theo-murray.jpeg | Nick Schuster → nick-schuster.jpg
  //   Sean Donahue → sean-donahue.jpg | Michael Barnes → michael-barnes.jpg
  //   Tiberio Caetano → tiberio-caetano.jpeg | Kimberlee Weatherall → kimberlee-weatherall.jpeg
  //   Iason Gabriel → iason-gabriel.jpg | Giada Pistilli → giada-pistilli.jpg
  //   Beba Cibralic → beba-cibralic.jpg | Luise Mueller → luise-mueller.png
  //   Ehsan Nabavi → ehsan-nabavi.jpeg | Fei Song → fei-song.jpg
  //   Henrik Kugelberg → henrik-kugelberg.png | Shang Long Yeo → shang-long-yeo.png
  //   Noam Kolt → noam-kolt.jpg | David Thorstad → david-thorstad.png
  //   J. Dimitri Gallow → j-dimitri-gallow.png | Nick Laskowski → nick-laskowski.png
  //   Luca Belli → luca-belli.jpeg | Roberta Fischli → roberta-fischli.jpg
  //   Syed AbuMusab → syed-abumusab.jpg | Ninell Oldenburg → ninell-oldenburg.jpeg
  //   Glen Berman → glen-berman.jpg | Sadhika Malladi → sadhika-malladi.jpg
  //   Cedric Whitney → cedric-whitney.jpg | Cameron Pattison → cameron-pattison.jpg
  //   Jacqueline Harding → jacqueline-harding.jpg | Jen Semler → jen-semler.png
  //   Anton Leicht → anton-leicht.jpg | Silvia Milano → silvia-milano.jpg
  //   Claire Benn → claire-benn.jpeg | Pamela Robinson → pamela-robinson.jpg
  //   Rhiannon Nielsen → rhiannon-nielsen.jpg | Emily Leijer → emily-leijer.jpg
  //   Max Fedoseev → max-fedoseev.jpg | Ben Robinson → ben-robinson.jpeg
  //   Christine Balasa → christine-balasa.jpg | Harrison Munday → harrison-munday.jpg
  //   Aleks Hammo → aleks-hammo.jpeg | Elija Perrier → elija-perrier.jpg
  //   NO PHOTO: Caroline Hendy, Jennifer Munt, Iman Ferestade, Jessie He,
  //     Elsa Kugelberg, Damian Clifford, Olivia Shen, Jenny Judge,
  //     William D'Alessandro, Kristina Vaia, Charles Wan, Corey McCabe, Antonio Esposito

  people: {
    team: [
      { name: "Seth Lazar", role: "Principal Investigator", discipline: "Philosophy" },
      { name: "Daniel Kilov", role: "Research Fellow", discipline: "Philosophy, Cybernetics" },
      { name: "Caroline Hendy", role: "Research Assistant" },
      { name: "Secil Yanik Guyot", role: "Research Officer" },
      { name: "Jake Stone", role: "Research Assistant, PhD", discipline: "Philosophy" },
      { name: "Andrew Smart", role: "PhD Student", discipline: "Philosophy" },
      { name: "Jennifer Munt", role: "PhD Student", discipline: "Philosophy" },
      { name: "Tim Dubber", role: "PhD Student", discipline: "Philosophy" },
      { name: "Zhihe (Vincent) Zhang", role: "PhD Student", discipline: "Philosophy" },
      { name: "Iman Ferestade", role: "PhD Student", discipline: "Philosophy" },
      { name: "James Leib", role: "Honours Student", discipline: "Philosophy" },
      { name: "Jessie He", role: "Honours Student", discipline: "Philosophy" },
      { name: "Theo Murray", role: "Research Officer", discipline: "Philosophy" },
    ],

    affiliates: [
      { name: "Nick Schuster", role: "Affiliate", discipline: "Philosophy" },
      { name: "Sean Donahue", role: "Affiliate", discipline: "Philosophy" },
      { name: "Michael Barnes", role: "Affiliate", discipline: "Philosophy" },
      { name: "Tiberio Caetano", role: "Senior Affiliate", discipline: "Computer Science" },
      { name: "Kimberlee Weatherall", role: "Senior Affiliate", discipline: "Law" },
      { name: "Iason Gabriel", role: "Senior Affiliate", discipline: "Philosophy, Computer Science" },
      { name: "Giada Pistilli", role: "Affiliate", discipline: "Philosophy, Industry" },
      { name: "Elsa Kugelberg", role: "Affiliate", discipline: "Philosophy" },
      { name: "Damian Clifford", role: "Affiliate", discipline: "Law" },
      { name: "Beba Cibralic", role: "Affiliate", discipline: "Philosophy, Industry" },
      { name: "Olivia Shen", role: "Affiliate", discipline: "Policy" },
      { name: "Luise Mueller", role: "Affiliate", discipline: "Philosophy" },
      { name: "Ehsan Nabavi", role: "Affiliate", discipline: "Cybernetics" },
      { name: "Jenny Judge", role: "Affiliate", discipline: "Philosophy" },
      { name: "Fei Song", role: "Affiliate", discipline: "Philosophy" },
      { name: "Henrik Kugelberg", role: "Affiliate", discipline: "Philosophy" },
      { name: "Shang Long Yeo", role: "Affiliate", discipline: "Philosophy" },
      { name: "Noam Kolt", role: "Affiliate", discipline: "Law" },
      { name: "David Thorstad", role: "Affiliate", discipline: "Philosophy" },
      { name: "J. Dimitri Gallow", role: "Affiliate", discipline: "Philosophy" },
      { name: "Nick Laskowski", role: "Affiliate", discipline: "Philosophy" },
      { name: "Luca Belli", role: "Affiliate", discipline: "Computer Science, Industry" },
      { name: "William D\u2019Alessandro", role: "Affiliate", discipline: "Philosophy" },
      { name: "Roberta Fischli", role: "Affiliate", discipline: "Philosophy" },
      { name: "Syed AbuMusab", role: "Affiliate", discipline: "Philosophy" },
      { name: "Ninell Oldenburg", role: "Affiliate", discipline: "Philosophy" },
      { name: "Glen Berman", role: "Affiliate", discipline: "Computer Science" },
      { name: "Sadhika Malladi", role: "Affiliate", discipline: "Computer Science" },
      { name: "Cedric Whitney", role: "Affiliate", discipline: "Information Science" },
      { name: "Cameron Pattison", role: "Affiliate", discipline: "Philosophy" },
      { name: "Jacqueline Harding", role: "Affiliate", discipline: "Philosophy" },
      { name: "Jen Semler", role: "Affiliate", discipline: "Philosophy" },
      { name: "Anton Leicht", role: "Affiliate", discipline: "Philosophy" },
    ],

    alumni: [
      { name: "Kristina Vaia", role: "Alumni", discipline: "Public Policy" },
      { name: "Charles Wan", role: "Alumni", discipline: "Computer Science" },
      { name: "Silvia Milano", role: "Alumni", discipline: "Philosophy" },
      { name: "Corey McCabe", role: "Alumni, PhD", discipline: "Philosophy" },
      { name: "Claire Benn", role: "Alumni, Research Fellow", discipline: "Philosophy" },
      { name: "Pamela Robinson", role: "Alumni, Research Fellow", discipline: "Philosophy" },
      { name: "Rhiannon Nielsen", role: "Alumni", discipline: "International Relations" },
      { name: "Emily Leijer", role: "Alumni, PhD", discipline: "Philosophy" },
      { name: "Max Fedoseev", role: "Alumni, PhD", discipline: "Philosophy" },
      { name: "Antonio Esposito", role: "Alumni, Honours" },
      { name: "Ben Robinson", role: "Alumni, Honours" },
      { name: "Christine Balasa", role: "Alumni, Honours" },
      { name: "Harrison Munday", role: "Alumni, Honours" },
      { name: "Aleks Hammo", role: "Alumni, Honours" },
      { name: "Elija Perrier", role: "Alumni, Research Fellow", discipline: "Computer Science" },
    ],
  },

  // ============================================================
  // FOOTER
  // ============================================================

  footer: {
    acknowledgment: "We acknowledge the Traditional Custodians of Country throughout Australia, and their continuing connection to culture, community, land, sea and sky. We pay our respects to Elders past, present and future.",
    credits: {
      mascot: "Minty Squid Mascot by Oink! Design",
      site: "Site design: MINT Lab",
    },
  },
};
