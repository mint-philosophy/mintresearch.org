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

  'l11-green': {
    speaker: 'Green Minty',
    lines: [
      'The foundry is packed with stamping machines and brittle routes, so keep moving and don’t let the Paper Flood boxes pin you.',
      'Cloudflare walls here work like cleanroom barriers. Break the barrier first, then sweep the papers behind it.',
      'The EUV scanner telegraphs its beams before it fires. Read the lane, move early, then punish it between sweeps.',
    ],
  },

  'l12-yellow': {
    speaker: 'Yellow Minty',
    lines: [
      'The bubble level throws venture capitalists and influencers at you from both heights and the floor. Protect your ammo and don’t get cornered.',
      'When the market turns red, the whole arena gets busier. Leave yourself a safe platform before you chase a gold paper.',
      'The boss drops candlestick crashes in marked columns. Watch the floor, not just the chart-face.',
    ],
  },

  'l13-purple': {
    speaker: 'Purple Minty',
    lines: [
      'Critics and trolls are trying to box you into the hearing room. Clear the speakers on the high platforms first.',
      'The dais keeps summoning fresh nuisance enemies, so don’t spend too long dueling one target.',
      'When the microphones start to flash, the strike lanes are already chosen. Step out, then hit back.',
    ],
  },

  'l14-indigo': {
    speaker: 'Indigo Minty',
    lines: [
      'This maze is all about traffic control. The barriers make the route look worse than it is, but only if you panic.',
      'Paper Flood machines in Brussels love to guard high-value papers. Pick the machine or the paper first; don’t split your attention.',
      'The binder boss keeps dropping compliance lanes on your current position. Break rhythm and it will miss.',
    ],
  },

  'l15-red': {
    speaker: 'Red Minty',
    lines: [
      'The desert campus punishes hesitation. Water, gas, and reactor hazards all want to rush you at once.',
      'Use the Nvidia heals aggressively here; the stage is long and the mirror tower can turn your own papers back against you.',
      'If your papers start reflecting, stop shooting and reposition. The tower only stays safe while it’s lit up.',
    ],
  },

  'l16-cool': {
    speaker: 'Cool Minty',
    lines: [
      'Robotaxi City is faster than it looks. The floor enemies want to herd you into the floating nuisances above.',
      'Zuck heads still steal papers, so don’t let the traffic patterns trap you in a shallow lane.',
      'The robotaxi boss wins if you stand in front of a charge. Bait it, jump clear, then punish the recovery.',
    ],
  },

  'l17-teal': {
    speaker: 'Teal Minty',
    lines: [
      'The trench current keeps dragging everything sideways. Short corrections beat big ones down here.',
      'Water waves and gas bottles move like they know where you’re going, so fight them on platforms with room to reverse.',
      'The trawler net pulls first and punishes second. Save your jump until the pull starts.',
    ],
  },

  'l18-indigo': {
    speaker: 'Indigo Minty',
    lines: [
      'Orbit changes the jump arc. Minty hangs in the air longer, and so do your mistakes.',
      'Parrots and mean comments are nastier with floaty gravity, so clear the air before you commit to a long crossing.',
      'The launch vehicle rains danger from above. Watch the booster lanes as much as the rocket itself.',
    ],
  },

  'l19-purple': {
    speaker: 'Purple Minty',
    lines: [
      'The studio is trying to flood you with doubles, decoys, and obnoxious attention magnets. Pick one side of the screen and reclaim it.',
      'BCI octopuses still die to a clean stomp, which matters more here because the fake clutter wants your ammo.',
      'The director boss mixes fake papers with real pressure. If the arena starts feeling crowded, slow down and read it.',
    ],
  },

  'l20-red': {
    speaker: 'Red Minty',
    lines: [
      'War Claude marks the floor before the big strikes land. Cover is a fantasy here, so movement is the whole plan.',
      'Project Maven, Palantir, and Anduril all get a cameo in the background, but the parrots up top are the ones that will actually ruin your day.',
      'When you see the lock indicators, don’t shoot. Run first, then answer the memo volley.',
    ],
  },

  'l21-cool': {
    speaker: 'Cool Minty',
    lines: [
      'The Weights is the whole game folding back on itself. Every bad habit gets collected here.',
      'You don’t need to kill everything. You need to keep enough space to read the boss cycle and stay alive.',
      'When the core starts layering strike lanes, clones, and volleys together, take the safe route and trust the long game.',
    ],
  },
};

export function getDialogue(key: string): DialogueData {
  return dialogues[key] || {
    speaker: 'Unknown Minty',
    lines: ['...', '(This Minty seems lost in thought.)'],
  };
}
