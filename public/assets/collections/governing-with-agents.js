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
    sourceLabel: 'SF Gov Graph',
    sourceHref: 'https://sfgov.civlab.org/',
    sourceQuote: 'We cannot govern systems we don’t understand, so we built the first complete data model of the San Francisco government.',
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
    sourceLabel: 'Joshua P. Darr, Knight First Amendment Institute',
    sourceHref: 'https://knightcolumbia.org/content/participatory-journalism-and-its-potential-in-ai-assisted-local-news',
    sourceQuote: 'This data set includes three months of Documenters meeting notes from 2024, comprising 100 local government meetings.',
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
    sourceLabel: 'CalMatters methodology',
    sourceHref: 'https://calmatters.digitaldemocracy.org/data-sources-methodology',
    sourceQuote: 'Digital Democracy uses technology and human judgment to discern how these data points should be recorded and linked to other records.',
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
    sourceLabel: 'MAPLE',
    sourceHref: 'https://www.mapletestimony.org/about/how-maple-uses-ai',
    sourceQuote: 'We use Artificial Intelligence (AI) on MAPLE to help you quickly understand legislative information and navigate to policies that interest you.',
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
    sourceLabel: 'Knight Lab Studio',
    sourceHref: 'https://studio.knightlab.com/projects/reporters-workbench/',
    sourceQuote: 'Reporters Workbench: an agent‑augmented “notebook” that helps journalists turn raw notes into actionable tasks and evidence‑based insights.',
    image: '/assets/governing-with-agents/reporters-workbench.webp',
    imageAlt: 'Knight Lab page for Reporter’s Workbench AI.',
    links: [['Project page', 'https://studio.knightlab.com/projects/reporters-workbench/']]
  },
  {
    id: 'talk-to-the-city',
    title: 'Talk to the City',
    category: 'participation',
    categoryLabel: 'Participation, organising & public discourse',
    status: 'live',
    statusLabel: 'Deployed platform',
    who: 'The AI Objectives Institute; used in collaboration with Taiwan’s Ministry of Digital Affairs',
    sourceLabel: 'Talk to the City',
    sourceHref: 'https://talktothe.city/product',
    sourceQuote: 'Talk to the City (T3C) is an open-source AI tool that reimagines how communities, institutions, and decision-makers gather and act on public input.',
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
    categoryLabel: 'Participation, organising & public discourse',
    status: 'pilot',
    statusLabel: 'Small field pilot',
    who: 'Fair Count through Cooperative Impact Lab’s AI-for-organizing programme',
    sourceLabel: 'Cooperative Impact Lab',
    sourceHref: 'https://www.cooperativeimpactlab.org/ai4org',
    sourceQuote: 'Community Voice is an application that enhances canvassing campaigns with real-time constituent sentiment analysis.',
    image: '/assets/governing-with-agents/community-voice.webp',
    imageAlt: 'Cooperative Impact Lab page for AI-assisted organising projects.',
    links: [['Programme case record', 'https://www.cooperativeimpactlab.org/ai4org']]
  },
  {
    id: 'zke-youth-voices',
    title: 'zKe: Youth Voices',
    category: 'participation',
    categoryLabel: 'Participation, organising & public discourse',
    status: 'live',
    statusLabel: 'Live programme',
    who: 'Kenyan youth organisers working with Siasa Place and The Situation Room',
    sourceLabel: 'zKe: Youth Voices',
    sourceHref: 'https://www.zkevoices.org/',
    sourceQuote: 'This initiative uses unique deliberative digital spaces like WhatsApp, Talk to the City, pol.is, and Remesh to ensure robust discussions and gather real-time insights.',
    image: '/assets/governing-with-agents/zke-youth-voices.webp',
    imageAlt: 'zKe Youth Voices campaign artwork featuring Kenyan youth participants.',
    links: [
      ['Participate in zKe', 'https://www.zkevoices.org/'],
      ['Plurality Institute mapping report', 'https://drive.google.com/file/d/1cmePd2Rie7V3tWdhKjGWXZeqshszmDqm/view']
    ]
  },
  {
    id: 'bridgingbot',
    title: 'BridgingBot',
    category: 'participation',
    categoryLabel: 'Participation, organising & public discourse',
    status: 'pilot',
    statusLabel: 'Randomized trial',
    who: 'Plurality Institute, led by Jeffrey Fossett with research and community partners',
    sourceLabel: 'Plurality Institute',
    sourceHref: 'https://www.plurality.institute/',
    sourceQuote: 'BridgingBot is an LLM-powered social media moderator developed by Plurality Institute to foster healthier, more constructive online dialogue.',
    image: '/assets/governing-with-agents/bridgingbot.webp',
    imageAlt: 'Jeffrey Fossett presenting BridgingBot at the Plurality Institute.',
    links: [
      ['Project account', 'https://jeffreyfossett.com/2025/08/11/bridging-bot-media.html'],
      ['Prototype and trial design', 'https://techandsocialcohesion.substack.com/p/from-battleground-to-common-ground']
    ]
  },
  {
    id: 'a-healthier-democracy',
    title: 'A Healthier Democracy AI',
    category: 'participation',
    categoryLabel: 'Participation, organising & public discourse',
    status: 'live',
    statusLabel: 'In use',
    who: 'Northeastern University’s Burnes Center with A Healthier Democracy, Link Health, and Vot-ER',
    sourceLabel: 'Burnes Center for Social Change',
    sourceHref: 'https://burnes.northeastern.edu/projects/a-healthier-democracy-ai/',
    sourceQuote: 'Delivers over $4M in federal aid by helping low-income families apply for benefits directly in healthcare settings via an AI assistant.',
    image: '/assets/governing-with-agents/a-healthier-democracy.webp',
    imageAlt: 'A healthcare worker holding a Vot-ER voter registration badge.',
    links: [
      ['AI for Impact project', 'https://burnes.northeastern.edu/projects/a-healthier-democracy-ai/'],
      ['National programme', 'https://burnes.northeastern.edu/a-healthier-democracy-ai/']
    ]
  },
  {
    id: 'civic-connect',
    title: 'Civic Connect',
    category: 'participation',
    categoryLabel: 'Participation, organising & public discourse',
    status: 'pilot',
    statusLabel: 'Completed pilot',
    who: 'Northeastern University’s Burnes Center with POPVOX Foundation and Representative Seth Moulton',
    sourceLabel: 'Burnes Center for Social Change',
    sourceHref: 'https://burnes.northeastern.edu/projects/civic-connect/',
    sourceQuote: 'Test the use of AI to help a Member of Congress respond to constituent questions.',
    image: '/assets/governing-with-agents/civic-connect.webp',
    imageAlt: 'POPVOX Foundation logo.',
    links: [['Project record', 'https://burnes.northeastern.edu/projects/civic-connect/']]
  },
  {
    id: 'consult',
    title: 'Consult',
    category: 'participation',
    categoryLabel: 'Participation, organising & public discourse',
    status: 'live',
    statusLabel: 'Operational system',
    who: 'The UK government’s Incubator for AI, built within DSIT',
    sourceLabel: 'GOV.UK Algorithmic Transparency Record',
    sourceHref: 'https://www.gov.uk/algorithmic-transparency-records/dsit-consult',
    sourceQuote: 'Consult is a new internal tool offering civil service departments high-quality, assured AI topic modelling capabilities for consultation processing.',
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
    categoryLabel: 'Participation, organising & public discourse',
    status: 'pilot',
    statusLabel: 'Completed process',
    who: 'A New Jersey AI Task Force working group, Citizens Foundation, and The GovLab',
    sourceLabel: 'New Jersey AI Task Force report',
    sourceHref: 'https://dspace.njstatelib.org/bitstreams/23f513ef-b2ad-43a5-9798-30d24e487c73/download',
    sourceQuote: 'Policy Synth: An AI toolkit used by New Jersey’s AI Task Force Working Group to conduct large-scale automated research and generate evidence-based policy recommendations.',
    image: '/assets/governing-with-agents/policy-synth.webp',
    imageAlt: 'Policy Synth open-source repository.',
    links: [
      ['Official task-force report', 'https://dspace.njstatelib.org/bitstreams/23f513ef-b2ad-43a5-9798-30d24e487c73/download'],
      ['Policy Synth source', 'https://github.com/CitizensFoundation/policy-synth']
    ]
  },
  {
    id: 'grantwell',
    title: 'GrantWell',
    category: 'law-administration',
    categoryLabel: 'Law & administrative capacity',
    status: 'pilot',
    statusLabel: 'Functional + piloted',
    who: 'Northeastern University’s Burnes Center with the Massachusetts Federal Funds and Infrastructure Office',
    sourceLabel: 'Burnes Center for Social Change',
    sourceHref: 'https://burnes.northeastern.edu/projects/grantwell-simplifying-federal-grant-applications-with-ai/',
    sourceQuote: 'Assisting Massachusetts municipalities, environmental justice groups, rural towns, and historically-underserved communities to apply for federal and state grant, grant-matching, and tax-break opportunities.',
    image: '/assets/governing-with-agents/grantwell.webp',
    imageAlt: 'GrantWell interface for finding grants from a description of local funding needs.',
    links: [
      ['Project record', 'https://burnes.northeastern.edu/projects/grantwell-simplifying-federal-grant-applications-with-ai/'],
      ['Source code', 'https://github.com/The-Burnes-Center/AI4Impact-GrantWell']
    ]
  },
  {
    id: 'transit-planning-ai',
    title: 'Caltrans–UCLA Transit Planning AI',
    category: 'law-administration',
    categoryLabel: 'Law & administrative capacity',
    status: 'pilot',
    statusLabel: 'Prototype',
    who: 'Caltrans and UCLA; documented by Elizabeth Speed and Bennett Capozzi at the Institute for Progress',
    sourceLabel: 'Institute for Progress',
    sourceHref: 'https://ifp.org/use-ai-to-improve-transit-planning/',
    sourceQuote: 'Caltrans and UCLA’s prototype AI tool is RAG-based, and demonstrates how AI can be safely and reliably used to surface information from existing project documents.',
    image: '/assets/governing-with-agents/transit-planning-ai.webp',
    imageAlt: 'Institute for Progress cover for Use AI to Improve Transit Planning.',
    links: [['IFP project account', 'https://ifp.org/use-ai-to-improve-transit-planning/']]
  },
  {
    id: 'axiom',
    title: 'Axiom Foundation',
    category: 'law-administration',
    categoryLabel: 'Law & administrative capacity',
    status: 'live',
    statusLabel: 'Live infrastructure',
    who: 'The Axiom Foundation',
    sourceLabel: 'Axiom Foundation',
    sourceHref: 'https://axiom.org/',
    sourceQuote: 'The Axiom Foundation publishes that layer — statute by statute, citation by citation as rules as code — in the open, free for anyone to use.',
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
    sourceLabel: 'Stanford RegLab',
    sourceHref: 'https://reglab.github.io/stara/',
    sourceQuote: 'STARA can dramatically reduce the time for discerning the law.',
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
    sourceLabel: 'LOCUS abstract',
    sourceHref: 'https://arxiv.org/abs/2606.19334',
    sourceQuote: 'The resulting raw corpus contains codes from 9,239 cities and counties.',
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
    sourceLabel: 'Citizens Foundation',
    sourceHref: 'https://citizens.is/impact/gold-plating-iceland/',
    sourceQuote: 'Citizens Foundation built the system: a Policy Synth Gold-plating Research Agent that ingests the relevant EU directives alongside Icelandic laws and regulations…',
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
    sourceLabel: 'Cyber Security Agency of Singapore',
    sourceHref: 'https://www.csa.gov.sg/news-events/press-releases/ai-agents--insights-from-the-singapore-government-and-google-sandbox-/',
    sourceQuote: 'To ensure meaningful and well-rounded insights, participants prioritised three use cases spanning different levels of risk exposure.',
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
    sourceLabel: 'Anthropic',
    sourceHref: 'https://www.anthropic.com/research/donating-open-source-petri',
    sourceQuote: 'In October 2025, we launched Petri, an open-source toolbox of alignment tests that can be applied to any large language model.',
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
    sourceLabel: 'United Nations University documentation',
    sourceHref: 'https://c3.unu.edu/projects/ai/simulator/',
    sourceQuote: 'A form-based interface for creating agent-based simulations powered by Google DeepMind’s Concordia framework. No coding required.',
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
    sourceLabel: 'SlopChecker README',
    sourceHref: 'https://github.com/nawagner/SlopChecker',
    sourceQuote: 'An open-source utility for funding orgs to screen incoming proposals for AI-generation signals, citation integrity, solicitation compliance, and tagging.',
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
  card.dataset.search = [item.title, item.categoryLabel, item.statusLabel, item.who, item.sourceQuote].join(' ');
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
  const attribution = element('div', 'case-attribution');
  attribution.appendChild(element('span', 'case-field-label', 'Organization / team'));
  attribution.appendChild(element('p', 'case-who', item.who));
  body.appendChild(attribution);

  const source = element('div', 'case-source');
  source.appendChild(element('span', 'case-field-label', 'Source quotation'));
  source.appendChild(element('blockquote', 'source-description', item.sourceQuote));
  source.appendChild(externalLink(`${item.sourceLabel} ↗`, item.sourceHref, 'source-link'));
  body.appendChild(source);

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
