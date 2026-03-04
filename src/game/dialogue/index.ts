// ═══════════════════════════════════════════════════
// Data Dash — Dialogue Registry
// ═══════════════════════════════════════════════════

export interface DialogueData {
  speaker: string;
  lines: string[];
}

const dialogues: Record<string, DialogueData> = {
  // Level 1 — Green Minty: Platforms & the Hollowed Public Sphere
  'l1-green': {
    speaker: 'Green Minty',
    lines: [
      'These platforms hollowed out the public sphere that democracy actually needs to function. And nobody voted for that — it just happened while regulators were still writing fax-era rules.',
      'State capacity to even understand what\'s happening on these platforms is decades behind. The agencies are understaffed, outpaced, and half the time they\'re getting their briefings from the companies they\'re supposed to oversee.',
      'The octopuses optimise for engagement because that\'s the business model. But here\'s the thing — we need AI-augmented governance just to keep up with what\'s being deployed. You can\'t regulate at human speed anymore.',
      'Content moderation at scale is already an AI governance problem. The old institutions can\'t keep up — and the new ones haven\'t been built yet. That gap is where the damage happens.',
      'Collect the papers. The research base for rebuilding these systems is still thin, and the people with the best ideas need ammunition.',
    ],
  },

  // Level 2 — Purple Minty: Institutional Sclerosis & AI as State Capacity
  'l2-purple': {
    speaker: 'Purple Minty',
    lines: [
      'Institutional sclerosis is real. Regulatory agencies that were built for the postwar era are trying to govern technologies that move at a completely different clock speed.',
      'Here\'s what keeps me up: AI could be the state capacity multiplier that lets small, competent teams do what used to take entire bureaucracies. But only if we actually build the infrastructure for it.',
      'The question isn\'t whether to use AI in governance — that ship sailed. The question is whether we do it fast enough and well enough to matter before the institutions lose what\'s left of their credibility.',
      'Voluntary commitments are nice for press releases. Binding mechanisms that work across jurisdictions — that\'s the hard part. And it requires exactly the kind of institutional innovation that our sclerotic systems haven\'t managed in decades.',
      'Every paper you grab here is a brick in the road. We\'re building the evaluative infrastructure from scratch, and speed matters.',
    ],
  },

  // Level 3 — Yellow Minty: Epistemic Infrastructure & Verification at Scale
  'l3-yellow': {
    speaker: 'Yellow Minty',
    lines: [
      'The epistemic infrastructure of democracy is degrading, and we\'re not building replacements fast enough. Provenance, verification, trust — these are all state capacity problems wearing information-theory hats.',
      'Synthetic media doesn\'t need to be convincing. It just needs to make everything uncertain enough that trust becomes the casualty. That\'s a tragedy of the commons playing out in real time.',
      'AI-powered verification at scale might be the only way to keep the information commons functional. Markets won\'t provide it — the incentives point the wrong way. This is a public good that needs public investment.',
      'Echo chambers aren\'t just about belief — they\'re about what people think everyone else believes. The second-order effects are where democratic decision-making actually breaks down.',
      'The parrots here just repeat whatever gets engagement. Sound familiar? The cure isn\'t more speech — it\'s better infrastructure for knowing what to trust.',
    ],
  },

  // Level 4 — Indigo Minty: Alignment as Institutional Capacity
  'l4-indigo': {
    speaker: 'Indigo Minty',
    lines: [
      'The alignment problem is an institutional capacity problem as much as a technical one. We need evaluative infrastructure that simply doesn\'t exist yet — and building it requires the kind of institutional innovation our sclerotic bureaucracies haven\'t managed in decades.',
      'Interpretability matters because you can\'t govern what you can\'t inspect. But the bottleneck isn\'t the research — it\'s building the institutions that can actually use interpretability tools at regulatory speed.',
      'Scaling laws tell us about capability growth. They tell us nothing about whether our governance capacity scales to match. That asymmetry is the core danger.',
      'The gold papers aren\'t just shinier — they represent work where someone cared about rigour over speed. In a field this young, that\'s load-bearing infrastructure.',
      'Evaluation frameworks, red teams, shared benchmarks for dangerous capabilities — these are the institutional sinews we need. Without them, safety claims are just vibes.',
    ],
  },

  // Level 5 — Red Minty: Rebuilding Normative Infrastructure
  'l5-red': {
    speaker: 'Red Minty',
    lines: [
      'Liberal institutions were built for a world that no longer exists. The philosophical frameworks we inherited assume human-scale decision-making, human-speed change, human-legible systems. Those assumptions are breaking.',
      'If AI changes the structure of agency itself — who acts, how fast, at what scale — then we don\'t just need to patch our normative infrastructure. We need to rebuild it. That\'s not a crisis, it\'s a design challenge.',
      'Value pluralism is real. But "whose values" isn\'t the right question. The right question is: what institutional structures let plural values coexist without someone\'s values being silently overwritten by default?',
      'The strongest argument against your position is the one you need to engage with most seriously. The philosophers who got that right built things that lasted. The ones who didn\'t... didn\'t.',
      'Progress isn\'t automatic. Every generation has to rebuild the normative infrastructure for the world it actually lives in. Our generation\'s version of that challenge just happens to involve artificial intelligence.',
    ],
  },

  // Level 6 — Brown Minty: Crumbling Institutions & the Transition
  'l6-brown': {
    speaker: 'Brown Minty',
    lines: [
      'Look around — the institutions are literally crumbling. You can see it in the buildings. But this isn\'t a story of decline. It\'s a story of transition, and transitions are where the action is.',
      'The institutions that survive will be the ones that figure out how to incorporate AI into their capacity. Not as a replacement for human judgment, but as the infrastructure that makes human judgment possible at the scale our problems demand.',
      'State capacity has been declining for decades — stagnation, institutional sclerosis, the slow erosion of the ability to actually do things. AI might be the most plausible path to reversing that. Not guaranteed, but plausible.',
      'Labour market transformation, access inequality, the distribution of technological dividends — these aren\'t problems to solve after we build the AI. They\'re design constraints we need to build into the institutions now.',
      'Everything you\'ve fought through in this game is a microcosm of what\'s happening in the real world. The slop, the parrots, the paper mills, the void — they\'re all institutional capacity problems.',
      'The integrity of this field depends on people who take the questions seriously enough to do the work. That\'s what the papers are for. That\'s what you\'re for.',
    ],
  },
};

export function getDialogue(key: string): DialogueData {
  return dialogues[key] || {
    speaker: 'Unknown Minty',
    lines: ['...', '(This Minty seems lost in thought.)'],
  };
}
