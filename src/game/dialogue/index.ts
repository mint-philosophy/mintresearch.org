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

  // Level 7 — Cool Minty (YouTube)
  'l7-cool': {
    speaker: 'Cool Minty',
    lines: [
      'Most of the octopuses here are flimsy. Clear them fast before the comment swarm stacks up.',
      'Those mean comments yank you toward their trap papers. Keep moving and stomp them when they drift low.',
      'The neckbeard reflects papers. Don\'t waste ammo on him, get above him and land on that head.',
    ],
  },

  'l8-red': {
    speaker: 'Red Minty',
    lines: [
      'The NeurIPS crowd is full of red octopuses that barely tire — keep your range high.',
      'Venture capitalists throw money that scrambles your controls, so hug the platforms and stay steady.',
      'The blue BCI octopuses go down if you stomp the exposed brain. Save your ammo for the boss barrage.',
    ],
  },

  'l9-red': {
    speaker: 'Red Minty',
    lines: [
      'San Francisco’s octopuses fire peace-sign slop laterally, so stay low and dodge their wide arcs.',
      'Mark Zuck heads sweep the ground with their nets—if he catches Minty he steals three papers.',
      'Ride the Golden Gate helper for 15 seconds, but land safely or the fall hurts worse than the glue boss.',
    ],
  },

  'l10-green': {
    speaker: 'Green Minty',
    lines: [
      'This datacenter hums with GPUs and furious waves—stay at full health, they shock with colour-changing bursts.',
      'Bernie’s head hovers overhead and fires spectacles; outrun him while you swap into the Nvidia heals.',
      'Grab an Apple puddle power-up only if you need a clean slate—he melts Minty, then snaps him back to the start after 3 seconds.',
    ],
  },
};

export function getDialogue(key: string): DialogueData {
  return dialogues[key] || {
    speaker: 'Unknown Minty',
    lines: ['...', '(This Minty seems lost in thought.)'],
  };
}
