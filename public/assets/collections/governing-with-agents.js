import { element, externalLink, setupGallery, showSubmissionReceipt } from './gallery.js';

const cases = [
  {
    id: 'sf-government-graph',
    title: 'SF Government Graph',
    category: 'public-information',
    categoryLabel: 'Public information & journalism',
    status: 'live',
    statusLabel: 'Live platform',
    who: 'Michael Adams at CivLab',
    goal: 'Make San Francisco government legible: its entities, relationships, oversight, budgets, meetings, and legal authority.',
    method: 'Language models help aggregate and process the underlying records, then automate generation and maintenance of a navigable government graph.',
    image: '/assets/governing-with-agents/sf-government-graph.webp',
    imageAlt: 'The SF Government Graph interface showing connected public bodies and officials.',
    links: [
      ['Explore the graph', 'https://sfgov.civlab.org/'],
      ['How it was built', 'https://www.writing.civlab.org/p/introducing-a-new-type-of-civic-tech']
    ]
  },
  {
    id: 'docgpt',
    title: 'DocGPT',
    category: 'public-information',
    categoryLabel: 'Public information & journalism',
    status: 'research',
    statusLabel: 'Research prototype',
    who: 'Joshua P. Darr with Cleveland and Cuyahoga County Documenters notes',
    goal: 'Test whether community-observed meeting records can produce better, more locally current answers than a generic chatbot.',
    method: 'One hundred sets of public-meeting notes were loaded into a custom ChatGPT, restricted to that corpus, with answers required to cite the meeting and date.',
    image: '/assets/governing-with-agents/docgpt.webp',
    imageAlt: 'Knight First Amendment Institute article introducing participatory journalism and AI-assisted local news.',
    links: [
      ['Darr’s account', 'https://knightcolumbia.org/content/participatory-journalism-and-its-potential-in-ai-assisted-local-news'],
      ['About Documenters', 'https://www.documenters.org/about/']
    ]
  },
  {
    id: 'digital-democracy',
    title: 'CalMatters Digital Democracy',
    category: 'public-information',
    categoryLabel: 'Public information & journalism',
    status: 'live',
    statusLabel: 'Live platform',
    who: 'CalMatters, Cal Poly’s Institute for Advanced Technology and Public Policy, and 10up',
    goal: 'Help journalists and the public follow what California legislators say, do, vote on, and receive from political interests.',
    method: 'The platform joins hearing transcripts, bills, votes, campaign finance, gifts, travel, and district data. AI assists transcription and entity matching, with mandatory human review.',
    image: '/assets/governing-with-agents/digital-democracy.webp',
    imageAlt: 'CalMatters Digital Democracy search interface.',
    links: [
      ['Explore the platform', 'https://calmatters.digitaldemocracy.org/'],
      ['Methodology', 'https://calmatters.digitaldemocracy.org/data-sources-methodology']
    ]
  },
  {
    id: 'maple',
    title: 'MAPLE',
    category: 'public-information',
    categoryLabel: 'Public information & journalism',
    status: 'live',
    statusLabel: 'Live platform',
    who: 'Partners in Democracy–Education, originating at Northeastern NuLawLab with Code for Boston',
    goal: 'Make Massachusetts legislation and public testimony easier to understand and participate in.',
    method: 'GPT-4o generates bill summaries and topic tags from public legal materials; AssemblyAI transcribes hearings. Outputs remain attached to the relevant bills and sessions.',
    image: '/assets/governing-with-agents/maple.webp',
    imageAlt: 'MAPLE legislative participation homepage.',
    links: [
      ['How MAPLE uses AI', 'https://www.mapletestimony.org/about/how-maple-uses-ai'],
      ['Explore MAPLE', 'https://www.mapletestimony.org/']
    ]
  },
  {
    id: 'reporters-workbench',
    title: 'Reporter’s Workbench AI',
    category: 'public-information',
    categoryLabel: 'Public information & journalism',
    status: 'research',
    statusLabel: 'Studio prototype',
    who: 'Northwestern University’s Knight Lab, led by Nick Hagar',
    goal: 'Speed up the early stages of reporting without surrendering editorial control or provenance.',
    method: 'OpenAI o3 turns notes into proposed tasks and can use bounded tools for search, PDF extraction, and DuckDB queries. Results return as traceable notes for verification.',
    image: '/assets/governing-with-agents/reporters-workbench.webp',
    imageAlt: 'Knight Lab page for Reporter’s Workbench AI.',
    links: [['Project page', 'https://studio.knightlab.com/projects/reporters-workbench/']]
  },
  {
    id: 'talk-to-the-city',
    title: 'Talk to the City',
    category: 'participation',
    categoryLabel: 'Participation & consultation',
    status: 'live',
    statusLabel: 'Deployed platform',
    who: 'The AI Objectives Institute; used in collaboration with Taiwan’s Ministry of Digital Affairs',
    goal: 'Gather and represent public input at a scale that remains useful for deliberation and policymaking.',
    method: 'Conversational surveys or imported transcripts become source-linked claims and themes, while retaining participant quotations, audit trails, and ways to correct interpretations.',
    image: '/assets/governing-with-agents/talk-to-the-city.webp',
    imageAlt: 'Talk to the City product page.',
    links: [
      ['Product', 'https://talktothe.city/product'],
      ['Taiwan MODA account', 'https://web.moda.gov.tw/en/press/background-information/9411'],
      ['Source code', 'https://github.com/AIObjectives/tttc-light-js']
    ]
  },
  {
    id: 'community-voice',
    title: 'Community Voice',
    category: 'participation',
    categoryLabel: 'Participation & consultation',
    status: 'pilot',
    statusLabel: 'Small field pilot',
    who: 'Fair Count through Cooperative Impact Lab’s AI-for-organizing programme',
    goal: 'Help canvassing organisations learn quickly from what constituents tell people in the field.',
    method: 'A Mississippi pilot collected 120 short voice memos, transcribed them, and used Claude for sentiment analysis. A one-day hackathon then prototyped thematic reports.',
    image: '/assets/governing-with-agents/community-voice.webp',
    imageAlt: 'Cooperative Impact Lab page for AI-assisted organising projects.',
    links: [['Programme case record', 'https://www.cooperativeimpactlab.org/ai4org']]
  },
  {
    id: 'consult',
    title: 'Consult',
    category: 'participation',
    categoryLabel: 'Participation & consultation',
    status: 'live',
    statusLabel: 'Operational system',
    who: 'The UK government’s Incubator for AI, built within DSIT',
    goal: 'Make very large public consultations tractable without handing policy judgment to a model.',
    method: 'A model proposes themes, which officials may add, split, combine, edit, or discard. Responses are mapped only after the framework is approved, and remain searchable.',
    image: '/assets/governing-with-agents/consult.webp',
    imageAlt: 'UK government algorithmic transparency record for Consult.',
    links: [
      ['Transparency record', 'https://www.gov.uk/algorithmic-transparency-records/dsit-consult'],
      ['Published example', 'https://www.gov.uk/government/consultations/pathways-to-work-reforming-benefits-and-support-to-get-britain-working-green-paper/outcome/government-response-to-the-pathways-to-work-consultation']
    ]
  },
  {
    id: 'policy-synth',
    title: 'New Jersey AI Task Force + Policy Synth',
    category: 'participation',
    categoryLabel: 'Participation & consultation',
    status: 'pilot',
    statusLabel: 'Completed process',
    who: 'A New Jersey AI Task Force working group, Citizens Foundation, and The GovLab',
    goal: 'Let workers set priorities for the state’s response to AI’s workforce effects, then develop a broader evidence-backed option space.',
    method: 'More than 2,200 workers made nearly 68,000 pairwise judgments. Agents researched 1,000-plus sources and generated options; experts and officials reduced them to five recommendations.',
    image: '/assets/governing-with-agents/policy-synth.webp',
    imageAlt: 'Policy Synth open-source repository.',
    links: [
      ['Official task-force report', 'https://dspace.njstatelib.org/bitstreams/23f513ef-b2ad-43a5-9798-30d24e487c73/download'],
      ['Policy Synth source', 'https://github.com/CitizensFoundation/policy-synth']
    ]
  },
  {
    id: 'axiom',
    title: 'Axiom Foundation',
    category: 'law-administration',
    categoryLabel: 'Law & administrative capacity',
    status: 'live',
    statusLabel: 'Live infrastructure',
    who: 'The Axiom Foundation',
    goal: 'Publish tax and benefit rules as open, executable, time-aware code where every value and clause points back to governing legal text.',
    method: 'An agentic encoder converts pinned statutes into RuleSpec files. Compilation, proof-tree checks, tests, external calculator comparisons, and signed manifests gate publication.',
    image: '/assets/governing-with-agents/axiom.webp',
    imageAlt: 'Axiom Foundation homepage with the heading Computable law for all.',
    links: [
      ['Axiom Foundation', 'https://axiom.org/'],
      ['Encoder and validation pipeline', 'https://github.com/TheAxiomFoundation/axiom-encode']
    ]
  },
  {
    id: 'stara',
    title: 'STARA',
    category: 'law-administration',
    categoryLabel: 'Law & administrative capacity',
    status: 'pilot',
    statusLabel: 'Closed beta + enacted pilot',
    who: 'Faiz Surani, Lindsey Gailmard, Allison Casasola, Varun Magesh, Emily Robitschek, and Daniel Ho at Stanford RegLab',
    goal: 'Find and annotate every statutory provision matching a legal criterion, rather than returning a convenient sample.',
    method: 'STARA reconstructs code hierarchy, definitions, and cross-references before model classification. In San Francisco it found 528 mandated reports; a reviewed cleanup ordinance was enacted in July 2026.',
    image: '/assets/governing-with-agents/stara.webp',
    imageAlt: 'STARA research paper page.',
    links: [
      ['STARA project', 'https://reglab.github.io/stara/'],
      ['Enacted San Francisco ordinance', 'https://sfgov.legistar.com/LegislationDetail.aspx?GUID=9C3D32F7-1A6A-43E7-913C-B1ACFC59E312&ID=7423230']
    ]
  },
  {
    id: 'locus',
    title: 'LOCUS',
    category: 'law-administration',
    categoryLabel: 'Law & administrative capacity',
    status: 'research',
    statusLabel: 'Research infrastructure',
    who: 'Denis Peskoff, Joe Barrow, Christopher Vu, and Diag Davenport',
    goal: 'Turn fragmented US municipal and county codes into a large, machine-readable research corpus.',
    method: 'The team collected codes from 9,239 jurisdictions, using vision-language OCR, frontier-model labelling and comparisons, and smaller classifiers to construct the dataset.',
    image: '/assets/governing-with-agents/locus.webp',
    imageAlt: 'LOCUS research paper abstract on arXiv.',
    links: [
      ['Paper', 'https://arxiv.org/abs/2606.19334'],
      ['Dataset', 'https://huggingface.co/datasets/LocalLaws/LOCUS-v1']
    ]
  },
  {
    id: 'gold-plating',
    title: 'Iceland’s Gold-Plating Research Agent',
    category: 'law-administration',
    categoryLabel: 'Law & administrative capacity',
    status: 'pilot',
    statusLabel: 'Government pilot',
    who: 'Iceland’s Ministry of Higher Education, Industry and Innovation with Citizens Foundation',
    goal: 'Find where Icelandic implementation adds requirements beyond the relevant European Union directive.',
    method: 'The agent extracts, translates, and compares legal texts article by article, checks supporting documents, and drafts cited analyses. Multiple models run in parallel; humans decide.',
    image: '/assets/governing-with-agents/gold-plating.webp',
    imageAlt: 'Citizens Foundation case study about finding gold-plating in Icelandic law.',
    links: [
      ['Case study', 'https://citizens.is/impact/gold-plating-iceland/'],
      ['Government launch', 'https://www.stjornarradid.is/efst-a-baugi/frettir/stok-frett/2024/08/20/Beita-gervigreind-gegn-gullhudun/']
    ]
  },
  {
    id: 'singapore-sandbox',
    title: 'Singapore AI Agents Sandbox',
    category: 'law-administration',
    categoryLabel: 'Law & administrative capacity',
    status: 'pilot',
    statusLabel: 'Completed sandbox',
    who: 'Google with Singapore’s Cyber Security Agency, GovTech, and Infocomm Media Development Authority',
    goal: 'Test where computer-use agents might help government—and what could go wrong before public deployment.',
    method: 'Teams tested government-site quality assurance, chatbot safety testing, and social-assistance applications, using risk tiers and structured human oversight.',
    image: '/assets/governing-with-agents/singapore-sandbox.webp',
    imageAlt: 'Cover of the Singapore government and Google AI Agents Sandbox report.',
    links: [
      ['Official summary', 'https://www.csa.gov.sg/news-events/press-releases/ai-agents--insights-from-the-singapore-government-and-google-sandbox-/'],
      ['Joint report', 'https://publicpolicy.google/resources/ai_agents_singapore.pdf']
    ]
  },
  {
    id: 'inspect-petri',
    title: 'Inspect Petri',
    category: 'evaluation',
    categoryLabel: 'Evaluation, simulation & experimentation',
    status: 'live',
    statusLabel: 'Active open source',
    who: 'Developed through MATS and Anthropic Fellows; stewarded by Meridian Labs with UK AISI collaboration',
    goal: 'Help evaluators discover risky model behaviour across many multi-turn scenarios.',
    method: 'An auditor model interacts with a target model and simulated users or tools; judge models score retained transcripts for human inspection. It is exploratory auditing, not a benchmark.',
    image: '/assets/governing-with-agents/inspect-petri.webp',
    imageAlt: 'Anthropic page announcing the open-source Petri auditing tool.',
    links: [
      ['Anthropic account', 'https://www.anthropic.com/research/donating-open-source-petri'],
      ['Repository', 'https://github.com/meridianlabs-ai/inspect_petri']
    ]
  },
  {
    id: 'concordia',
    title: 'Concordia Simulation Builder',
    category: 'evaluation',
    categoryLabel: 'Evaluation, simulation & experimentation',
    status: 'research',
    statusLabel: 'Research & teaching tool',
    who: 'Ng Chong at United Nations University, built on Google DeepMind’s Concordia framework',
    goal: 'Make multi-agent social simulations accessible for research, teaching, and exploratory institutional “wind-tunnelling.”',
    method: 'Users give model-driven agents goals, memories, and traits; a Game Master resolves interactions; batch runs show how outcomes vary with assumptions. Outputs are not population forecasts.',
    image: '/assets/governing-with-agents/concordia.webp',
    imageAlt: 'United Nations University Concordia Simulation Builder interface.',
    links: [
      ['UNU documentation', 'https://c3.unu.edu/projects/ai/simulator/'],
      ['Source code', 'https://github.com/ngstcf/concordia-sim-builder']
    ]
  },
  {
    id: 'slopchecker',
    title: 'SlopChecker',
    category: 'evaluation',
    categoryLabel: 'Evaluation, simulation & experimentation',
    status: 'research',
    statusLabel: 'Hackathon prototype',
    who: 'Nick Wagner, Dan Parshall, Emerson Brooking, Alex, and Dominique Ramsawak',
    goal: 'Help funders inspect proposals without turning screening into an automated rejection system.',
    method: 'The prototype checks citation integrity, solicitation fit, document overlap, tagging, and AI-generation signals, returning source-anchored evidence for human review.',
    image: '/assets/governing-with-agents/slopchecker.webp',
    imageAlt: 'SlopChecker interface for inspecting a grant proposal.',
    links: [
      ['Repository and team', 'https://github.com/nawagner/SlopChecker'],
      ['Live sample', 'https://slop-checker.com/']
    ]
  }
];

const statusClass = {
  live: 'status-live',
  pilot: 'status-pilot',
  research: 'status-research'
};

function renderCase(item, index) {
  const card = element('article', 'case-card');
  card.dataset.filterValues = `${item.category} ${item.status}`;
  card.dataset.search = [item.title, item.categoryLabel, item.statusLabel, item.who, item.goal, item.method].join(' ');
  card.id = item.id;

  const imageLink = externalLink('', item.links[0][1], 'case-image');
  const image = element('img');
  image.src = item.image;
  image.alt = item.imageAlt;
  image.width = 900;
  image.height = 540;
  image.loading = index < 2 ? 'eager' : 'lazy';
  image.decoding = 'async';
  imageLink.appendChild(image);
  imageLink.appendChild(element('span', 'case-number', String(index + 1).padStart(2, '0')));
  card.appendChild(imageLink);

  const body = element('div', 'case-body');
  const meta = element('div', 'case-meta');
  meta.appendChild(element('span', `status-chip ${statusClass[item.status]}`, item.statusLabel));
  meta.appendChild(element('span', '', item.categoryLabel));
  body.appendChild(meta);
  body.appendChild(element('h2', '', item.title));
  body.appendChild(element('p', 'case-who', `Built by ${item.who}`));
  body.appendChild(element('p', 'case-goal', item.goal));

  const details = element('details');
  details.appendChild(element('summary', '', 'How it works'));
  details.appendChild(element('p', 'case-method', item.method));
  body.appendChild(details);

  const links = element('div', 'case-links');
  item.links.forEach(([label, href]) => links.appendChild(externalLink(`${label} ↗`, href)));
  body.appendChild(links);
  card.appendChild(body);
  return card;
}

const grid = document.querySelector('#case-grid');
cases.forEach((item, index) => grid?.appendChild(renderCase(item, index)));

setupGallery({
  root: '#case-grid',
  cardSelector: '.case-card',
  buttonSelector: '[data-filter-value]',
  searchSelector: '#collection-search',
  countSelector: '#collection-count',
  emptySelector: '#collection-empty'
});
showSubmissionReceipt();
