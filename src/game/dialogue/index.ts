// ═══════════════════════════════════════════════════
// Data Dash — Dialogue Registry
// ═══════════════════════════════════════════════════

export interface DialogueData {
  speaker: string;
  lines: string[];
}

const dialogues: Record<string, DialogueData> = {
  // Level 1 — Green Minty (Twitter/X)
  'l1-green': {
    speaker: 'Green Minty',
    lines: [
      'The trolls will ratio your papers if you let them. Wild that a platform built on \'connecting the world\' ended up being where research goes to die in a pile of reply-guys.',
      'State capacity to understand what\'s happening here is decades behind. You can\'t regulate at human speed when the platform ships changes before the regulator\'s coffee is cold.',
      'Grab what you can. Good platform governance research is scarce and the people writing policy need it yesterday.',
    ],
  },

  // Level 2 — Purple Minty (LinkedIn)
  'l2-purple': {
    speaker: 'Purple Minty',
    lines: [
      'Watch the influencers \u2014 they\'ll repost your papers and call it thought leadership. By the time anyone checks the source, the bad summary is already the canonical version.',
      'The real sclerosis is regulatory agencies built for fax machines trying to govern stuff they can barely describe. AI-augmented governance would help, but nobody\'s building it.',
      'Every paper here represents someone who did the work instead of posting about doing the work. Protect them.',
    ],
  },

  // Level 3 — Yellow Minty (Bluesky)
  'l3-yellow': {
    speaker: 'Yellow Minty',
    lines: [
      'The parrots shoot down papers before you can reach them. Standard Bluesky \u2014 people who\'ve never read a governance paper explaining why all AI research is existentially dangerous.',
      'Most of them want the same things we do. But \'NO\' is easier than \'here\'s what evaluative infrastructure actually looks like.\' The research they\'re destroying would have helped them.',
      'Save what you can. The epistemic commons needs people who build, not just people who object.',
    ],
  },

  // Level 4 — Indigo Minty (ArXiv)
  'l4-indigo': {
    speaker: 'Indigo Minty',
    lines: [
      'Paper mills contaminate anything they touch. Same noise-to-signal problem as the real ArXiv \u2014 the load-bearing work is buried under volume nobody has the institutional capacity to sift.',
      'Alignment is an institutional capacity problem wearing a technical hat. We need evaluative infrastructure that doesn\'t exist, and our bureaucracies have forgotten how to build new things.',
      'Gold papers matter. In a field this young, rigour over speed is load-bearing infrastructure.',
    ],
  },

  // Level 5 — Red Minty (PhilPapers)
  'l5-red': {
    speaker: 'Red Minty',
    lines: [
      'The void under these platforms isn\'t decoration. The normative infrastructure we inherited assumed human-scale decisions at human speed. Those foundations are actually gone.',
      'Rebuilding requires people who understand that ideas need institutional bones \u2014 not just arguments, but structures that survive contact with politics.',
      'Watch the ledges. Losing a paper to the void is losing an argument nobody else was going to make.',
    ],
  },

  // Level 6 — Brown Minty (SSRN)
  'l6-brown': {
    speaker: 'Brown Minty',
    lines: [
      'The cloudflare walls are paywalling the research. Destroy the wall, collect the paper. If that sounds like the real SSRN experience, you\'re paying attention.',
      'Look at the crumbling buildings. The institutions that survive will be the ones that augment human judgment with AI at the scale the problems actually demand.',
      'The slop, the parrots, the paper mills, the paywalls \u2014 institutional capacity failures, all of them. The papers are how we fight back.',
    ],
  },
};

export function getDialogue(key: string): DialogueData {
  return dialogues[key] || {
    speaker: 'Unknown Minty',
    lines: ['...', '(This Minty seems lost in thought.)'],
  };
}
