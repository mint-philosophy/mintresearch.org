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
      'Trolls want your papers — don\'t let them latch on! Shoot them before they get close.',
      'This level\'s got plenty of ammo if you explore the platforms.',
      'You\'ve got this. Go collect everything and smash that algorithm at the end.',
    ],
  },

  // Level 2 — Purple Minty (LinkedIn)
  'l2-purple': {
    speaker: 'Purple Minty',
    lines: [
      'The influencers are fast — they\'ll repost your work before you can blink.',
      'Try the higher platforms. Best papers are up there, and the influencers hate climbing.',
      'Power through. The Engagement King\'s waiting and he\'s a pushover if you\'ve got ammo.',
    ],
  },

  // Level 3 — Yellow Minty (Bluesky)
  'l3-yellow': {
    speaker: 'Yellow Minty',
    lines: [
      'Parrots shoot your papers down from range. Priority targets — take them out first.',
      'Jump a lot. The parrots can\'t lead their shots well against a moving target.',
      'Almost at the boss. The Fork Swarm splits when you hurt it, so save your ammo.',
    ],
  },

  // Level 4 — Indigo Minty (ArXiv)
  'l4-indigo': {
    speaker: 'Indigo Minty',
    lines: [
      'Paper mills contaminate everything grey. Don\'t pick up grey papers — no score, just ammo.',
      'The gold papers here give you serious range. Worth going out of your way.',
      'The Paper Mill boss eats your uncollected papers. Grab them before he does.',
    ],
  },

  // Level 5 — Red Minty (PhilPapers)
  'l5-red': {
    speaker: 'Red Minty',
    lines: [
      'Watch the ledges. This level\'s about precision, not speed.',
      'The Void teleports. Stay moving so it can\'t pin you down.',
      'If it grabs you, mash left and right to break free. Don\'t panic.',
    ],
  },

  // Level 6 — Brown Minty (SSRN)
  'l6-brown': {
    speaker: 'Brown Minty',
    lines: [
      'Cloudflare walls paywall the papers. Destroy the wall first, then collect.',
      'The Shoggoth uses every trick you\'ve seen. All of them. At once.',
      'Last level. Everything you\'ve learned matters here. Go.',
    ],
  },
};

export function getDialogue(key: string): DialogueData {
  return dialogues[key] || {
    speaker: 'Unknown Minty',
    lines: ['...', '(This Minty seems lost in thought.)'],
  };
}
