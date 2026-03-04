// ═══════════════════════════════════════════════════
// Data Dash — Dialogue Registry
// ═══════════════════════════════════════════════════

export interface DialogueData {
  speaker: string;
  lines: string[];
}

const dialogues: Record<string, DialogueData> = {
  // Level 1 — Green Minty: AI Alignment
  'l1-green': {
    speaker: 'Green Minty',
    lines: [
      'Hey there! Welcome to the social media gauntlet.',
      'AI alignment is about building AI systems that do what humans actually want.',
      'Sounds simple, right? But "what humans want" turns out to be really complicated.',
      'The octopuses here? They\'re what happens when AI optimises for engagement over truth.',
      'Collect those research papers — they\'re our best weapon against misinformation!',
    ],
  },

  // Level 2 — Purple Minty: AI Governance
  'l2-purple': {
    speaker: 'Purple Minty',
    lines: [
      'Welcome to the corporate world. Everything here runs on engagement metrics.',
      'AI governance is about the rules and institutions that shape how AI is developed and deployed.',
      'Who decides what AI can do? Governments? Companies? Users? All of the above?',
      'The Engagement King boss ahead thinks attention = value. We disagree.',
      'Keep collecting papers — evidence-based policy needs actual evidence!',
    ],
  },

  // Level 3 — Yellow Minty: Responsible AI
  'l3-yellow': {
    speaker: 'Yellow Minty',
    lines: [
      'The sky\'s wide open here, but so are the challenges.',
      'Responsible AI means fairness, transparency, and accountability.',
      'When an AI system makes a decision that affects your life, you deserve to know how and why.',
      'The Fork Swarm ahead fragments conversation into echo chambers. Sound familiar?',
      'Papers aren\'t just points — they represent real knowledge we need to protect.',
    ],
  },

  // Level 4 — Indigo Minty: Technical Safety
  'l4-indigo': {
    speaker: 'Indigo Minty',
    lines: [
      'Welcome to the archives. This is where the real work lives.',
      'Technical AI safety covers RLHF, interpretability, robustness, and more.',
      'RLHF — Reinforcement Learning from Human Feedback — is how models learn human preferences.',
      'But the Paper Mill boss ahead produces garbage research at industrial scale.',
      'Catch the gold-bordered papers — those are the genuine contributions worth protecting.',
    ],
  },

  // Level 5 — Red Minty: Philosophy of AI
  'l5-red': {
    speaker: 'Red Minty',
    lines: [
      '... you made it to the void. Not many do.',
      'Philosophy of AI asks the deep questions. Can AI have moral status? Rights? Obligations?',
      'If an AI system can suffer, does that change what we owe it?',
      'The Void boss ahead will challenge everything you think you know.',
      'Sometimes the most important research is the kind that makes you uncomfortable.',
    ],
  },

  // Level 6 — Brown Minty: AI Adaptation
  'l6-brown': {
    speaker: 'Brown Minty',
    lines: [
      'Final stage. The fortress of legacy systems and paywalls.',
      'AI adaptation is about how societies and institutions change in response to AI.',
      'Not just the technology — the laws, norms, markets, and relationships.',
      'The Shoggoth ahead represents unconstrained AI — powerful but directionless.',
      'Everything you\'ve collected, everything you\'ve learned — use it all.',
      'Good luck, researcher. The integrity of the field depends on you.',
    ],
  },
};

export function getDialogue(key: string): DialogueData {
  return dialogues[key] || {
    speaker: 'Unknown Minty',
    lines: ['...', '(This Minty seems lost in thought.)'],
  };
}
