// ═══════════════════════════════════════════════════
// Data Dash — Dialogue Registry
// ═══════════════════════════════════════════════════

export interface DialogueData {
  speaker: string;
  lines: string[];
}

const dialogues: Record<string, DialogueData> = {
  // Level 1 — Green Minty: AI Slop
  'l1-green': {
    speaker: 'Green Minty',
    lines: [
      'Superficial competence is the real danger. Slop doesn\'t fail obviously — it fails in ways that look like success.',
      'The octopuses don\'t write content. They generate it. The difference matters more than you\'d think.',
      'Every auto-generated summary that gets it almost right erodes the ability to notice when things are wrong.',
      'Collect the papers — not because knowledge is ammunition, but because reading carefully is the only antidote to reading carelessly.',
      'The trolls here aren\'t just mean — they\'re optimised. Engagement metrics reward the worst instincts.',
      'When everything looks authoritative, the skill isn\'t finding truth — it\'s noticing the absence of thought.',
    ],
  },

  // Level 2 — Purple Minty: Governance
  'l2-purple': {
    speaker: 'Purple Minty',
    lines: [
      'Algorithmic authority is quiet power. Nobody voted for the recommendation engine, but it shapes what millions believe.',
      'Governance isn\'t just about rules. It\'s about who gets to make them, who they protect, and who they leave out.',
      'The Engagement King ahead thinks attention equals value. That conflation is the root of most platform pathologies.',
      'Corporate self-regulation is an oxymoron when the incentive structure punishes caution and rewards speed.',
      'The hard question isn\'t whether AI should be regulated. It\'s whether our institutions can adapt fast enough to regulate it well.',
    ],
  },

  // Level 3 — Yellow Minty: Epistemic Health
  'l3-yellow': {
    speaker: 'Yellow Minty',
    lines: [
      'Epistemic health isn\'t about everyone agreeing. It\'s about maintaining the conditions under which disagreement is productive.',
      'The information commons is fragile. It took centuries to build institutions of shared knowledge, and algorithms can undermine them in years.',
      'Echo chambers aren\'t just filter bubbles — they\'re trust architectures. You believe what your community believes, and platforms engineer communities.',
      'The Fork Swarm ahead fragments conversation until every faction has its own facts. Sound familiar?',
      'Transparency without comprehension is just noise. The right to know means nothing without the capacity to understand.',
    ],
  },

  // Level 4 — Indigo Minty: Research Quality
  'l4-indigo': {
    speaker: 'Indigo Minty',
    lines: [
      'Methodology is ethics. Sloppy research doesn\'t just waste time — it warps the evidence base that policy depends on.',
      'A paper mill doesn\'t care about knowledge. It cares about volume. That\'s the same logic that makes slop dangerous.',
      'The gold papers aren\'t just shinier — they represent work where someone cared enough to get it right.',
      'Peer review is imperfect. But the alternative — trusting whatever sounds plausible — is catastrophically worse.',
      'RLHF aligns models to human preferences. The uncomfortable question is whose preferences, and which ones.',
      'Catch the gold-bordered papers. Those are the ones where rigour wasn\'t sacrificed for convenience.',
    ],
  },

  // Level 5 — Red Minty: Moral Philosophy
  'l5-red': {
    speaker: 'Red Minty',
    lines: [
      'Value pluralism isn\'t relativism. It\'s the recognition that multiple things can matter, and they don\'t always agree.',
      'The strongest argument against your position is the one you need to understand best. That\'s not weakness — it\'s intellectual honesty.',
      'If an AI system can suffer, does that change what we owe it? If it can\'t, does that settle the question?',
      'The Void ahead won\'t challenge your skills. It\'ll challenge your assumptions. Those are harder to defend.',
      'Moral philosophy isn\'t about finding the right answer. It\'s about understanding why the question is hard.',
    ],
  },

  // Level 6 — Brown Minty: Adaptation
  'l6-brown': {
    speaker: 'Brown Minty',
    lines: [
      'Institutions don\'t adapt because they should. They adapt when the cost of not adapting exceeds the cost of change — and by then it\'s often too late.',
      'Capability without purpose isn\'t progress. A more powerful system without better values is just a more powerful problem.',
      'The Shoggoth ahead represents what happens when you scale capability without scaling wisdom. Powerful, but directionless.',
      'Every paywall you passed to get here represents a choice about who gets access to knowledge and who doesn\'t.',
      'Adaptation isn\'t about keeping up with technology. It\'s about ensuring our values evolve at least as fast as our tools.',
      'Good luck, researcher. What you\'ve collected here matters — not the points, but the understanding.',
    ],
  },
};

export function getDialogue(key: string): DialogueData {
  return dialogues[key] || {
    speaker: 'Unknown Minty',
    lines: ['...', '(This Minty seems lost in thought.)'],
  };
}
