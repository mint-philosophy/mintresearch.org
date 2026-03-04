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
      'These platforms hollowed out the public sphere that democracy actually needs to function. Nobody voted for that. It just happened while regulators were still writing fax-era rules.',
      'State capacity to even understand what\'s happening on these platforms is decades behind. The agencies are understaffed, outpaced, and half the time getting briefings from the companies they\'re supposed to oversee.',
      'The octopuses optimise for engagement because that\'s the business model. We need AI-augmented governance just to keep up with what\'s being deployed. You can\'t regulate at human speed anymore.',
      'Content moderation at scale is already an AI governance problem. The old institutions can\'t keep pace, and nobody has built the new ones yet. That gap is where the damage happens.',
      'Collect the papers. The research base for rebuilding these systems is still thin, and the people with the best ideas need ammunition.',
    ],
  },

  // Level 2 — Purple Minty: Institutional Sclerosis & AI as State Capacity
  'l2-purple': {
    speaker: 'Purple Minty',
    lines: [
      'Institutional sclerosis is real. Regulatory agencies built for the postwar era are trying to govern technologies that move at a completely different clock speed.',
      'AI could be the state capacity multiplier that lets small, competent teams do what used to take entire bureaucracies. But only if we actually build the infrastructure for it, and we haven\'t started.',
      'The ship has sailed on whether to use AI in governance. What matters now is whether we do it well enough to matter before the institutions lose what\'s left of their credibility.',
      'Voluntary commitments are nice for press releases. Binding mechanisms that work across jurisdictions are the hard part, and they require exactly the kind of institutional innovation our sclerotic systems haven\'t managed in decades.',
      'Every paper you grab here is a brick in the road. We\'re building evaluative infrastructure from scratch, and speed matters.',
    ],
  },

  // Level 3 — Yellow Minty: Epistemic Infrastructure & Verification at Scale
  'l3-yellow': {
    speaker: 'Yellow Minty',
    lines: [
      'The epistemic infrastructure of democracy is degrading, and we\'re not building replacements fast enough. Provenance, verification, trust. State capacity problems wearing information-theory hats.',
      'Synthetic media doesn\'t need to be convincing. It just needs to make everything uncertain enough that trust becomes the casualty. A tragedy of the commons playing out in real time.',
      'AI-powered verification at scale might be the only way to keep the information commons functional. Markets won\'t provide it because the incentives point the wrong way. Public good, needs public investment.',
      'Echo chambers shape what people think everyone else believes, and those second-order effects are where democratic decision-making actually breaks down.',
      'The parrots here just repeat whatever gets engagement. Better infrastructure for knowing what to trust would do more than any amount of counter-speech.',
    ],
  },

  // Level 4 — Indigo Minty: Alignment as Institutional Capacity
  'l4-indigo': {
    speaker: 'Indigo Minty',
    lines: [
      'The alignment problem is an institutional capacity problem as much as a technical one. We need evaluative infrastructure that doesn\'t exist yet, and building it demands institutional innovation our sclerotic bureaucracies haven\'t managed in decades.',
      'Interpretability matters because you can\'t govern what you can\'t inspect. The research exists. What\'s missing are institutions that can actually use interpretability tools at regulatory speed.',
      'Scaling laws tell us about capability growth. They tell us nothing about whether governance capacity scales to match. That asymmetry is the core danger.',
      'The gold papers represent work where someone cared about rigour over speed. In a field this young, that kind of work is load-bearing infrastructure.',
      'Evaluation frameworks, red teams, shared benchmarks for dangerous capabilities. These are the institutional sinews we need. Without them, safety claims are just vibes.',
    ],
  },

  // Level 5 — Red Minty: Rebuilding Normative Infrastructure
  'l5-red': {
    speaker: 'Red Minty',
    lines: [
      'Liberal institutions were built for a world that no longer exists. The philosophical frameworks we inherited assume human-scale decision-making and human-speed change. Those assumptions are breaking.',
      'If AI changes the structure of agency itself, we need to rebuild our normative infrastructure, not just patch it. Call that a design challenge rather than panicking about it.',
      'Value pluralism is real. The question that matters is what institutional structures let plural values coexist without someone\'s values being silently overwritten by default.',
      'The strongest argument against your position is the one you need to engage with most seriously. The philosophers who understood that built things that lasted.',
      'Progress requires each generation to rebuild normative infrastructure for the world it actually lives in. Ours just happens to involve artificial intelligence.',
    ],
  },

  // Level 6 — Brown Minty: Crumbling Institutions & the Transition
  'l6-brown': {
    speaker: 'Brown Minty',
    lines: [
      'Look around. The institutions are literally crumbling. You can see it in the buildings. But we\'re in a transition, and transitions are where the action is.',
      'The institutions that survive will be the ones that figure out how to incorporate AI into their capacity. Making human judgment possible at the scale our problems demand.',
      'State capacity has been declining for decades. Stagnation, institutional sclerosis, the slow erosion of the ability to actually do things. AI might be the most plausible path to reversing that.',
      'Labour market transformation, access inequality, the distribution of technological dividends. We need to build these constraints into the institutions now, before the AI is finished.',
      'Everything you\'ve fought through in this game mirrors what\'s happening in the real world. The slop, the parrots, the paper mills, the void. All institutional capacity problems.',
      'The integrity of this field depends on people who take the questions seriously enough to do the work. That\'s what the papers are for.',
    ],
  },
};

export function getDialogue(key: string): DialogueData {
  return dialogues[key] || {
    speaker: 'Unknown Minty',
    lines: ['...', '(This Minty seems lost in thought.)'],
  };
}
