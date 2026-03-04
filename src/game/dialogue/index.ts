// ═══════════════════════════════════════════════════
// Data Dash — Dialogue Registry
// ═══════════════════════════════════════════════════

export interface DialogueData {
  speaker: string;
  lines: string[];
}

const dialogues: Record<string, DialogueData> = {
  // Level 1 — Green Minty: Concentrated Power & Platform Governance
  'l1-green': {
    speaker: 'Green Minty',
    lines: [
      'A handful of companies now control the infrastructure of public discourse. That concentration wasn\'t inevitable — it was designed.',
      'Content moderation isn\'t censorship and it isn\'t neutrality. It\'s an exercise of power that most democratic institutions have no oversight over.',
      'The octopuses here optimise for engagement because that\'s what the business model rewards. Changing the output means changing the incentive structure.',
      'When a platform decides what counts as authoritative, it\'s making an epistemic judgment with political consequences — whether it admits it or not.',
      'Collect the papers. The research base for governing these systems is still thin, and the policy window won\'t stay open forever.',
    ],
  },

  // Level 2 — Purple Minty: AI Governance & Institutional Design
  'l2-purple': {
    speaker: 'Purple Minty',
    lines: [
      'The governance gap isn\'t about whether to regulate AI — it\'s about building institutions that can keep pace with capability growth.',
      'International coordination on AI is a collective action problem nested inside a geopolitical competition. Neither framing alone gets you far.',
      'Voluntary commitments are useful for signalling but insufficient for constraint. The question is what binding mechanisms can actually work across jurisdictions.',
      'Frontier AI governance requires technical literacy in the regulator and democratic accountability in the developer. Neither currently exists at sufficient scale.',
      'The hardest governance problems aren\'t about banning things — they\'re about building the evaluative infrastructure to know what to permit.',
    ],
  },

  // Level 3 — Yellow Minty: Epistemic Commons & Information Integrity
  'l3-yellow': {
    speaker: 'Yellow Minty',
    lines: [
      'The epistemic commons — the shared information environment that makes democratic self-governance possible — is degrading faster than we\'re repairing it.',
      'Synthetic media doesn\'t need to be convincing to be corrosive. It just needs to make everything uncertain enough that trust itself becomes the casualty.',
      'Provenance infrastructure — knowing where content came from and whether it\'s been altered — is a public good that markets won\'t provide.',
      'Echo chambers aren\'t just about what people believe. They\'re about what people think everyone else believes. Second-order effects are where the damage compounds.',
      'AI-generated slop is a tragedy of the commons: cheap to produce, expensive to detect, and the costs are borne by the information environment rather than the producer.',
    ],
  },

  // Level 4 — Indigo Minty: Technical AI Safety & Alignment
  'l4-indigo': {
    speaker: 'Indigo Minty',
    lines: [
      'Alignment isn\'t a single problem — it\'s a family of problems at different levels: reward specification, goal stability, corrigibility, and value learning.',
      'Interpretability research matters because you can\'t govern what you can\'t inspect. Opacity in high-stakes systems isn\'t a feature — it\'s a governance failure.',
      'Scaling laws tell us about capability growth but not about alignment tax. The open question is whether safety techniques scale with capability or fall behind.',
      'Evaluation infrastructure for frontier models is a bottleneck. Without shared benchmarks for dangerous capabilities, safety claims are unfalsifiable.',
      'The gold papers aren\'t just shinier — they represent work where someone cared about rigour over speed. That matters more than you\'d think in a field this young.',
      'Robustness under distribution shift, deceptive alignment, reward hacking — these aren\'t hypotheticals. They\'re engineering problems with political stakes.',
    ],
  },

  // Level 5 — Red Minty: Moral Philosophy & Value Pluralism
  'l5-red': {
    speaker: 'Red Minty',
    lines: [
      'Whose values should AI systems encode? The question presupposes a unity that doesn\'t exist. Value pluralism is a feature of the moral landscape, not a bug.',
      'If you can\'t specify what you want a system to do without resolving deep ethical disagreements, then deployment is itself a normative choice — not a neutral one.',
      'The moral status question — whether AI systems could matter morally — isn\'t science fiction. It\'s a serious philosophical question that policy may need to address before we have a settled answer.',
      'Consequentialism, deontology, virtue ethics — each gives different answers to how AI should behave. The engineering challenge of alignment inherits all of moral philosophy\'s unresolved tensions.',
      'The strongest argument against your position is the one you need to engage with most seriously. Intellectual honesty is a prerequisite for trustworthy AI governance.',
    ],
  },

  // Level 6 — Brown Minty: Institutional Adaptation & AI Futures
  'l6-brown': {
    speaker: 'Brown Minty',
    lines: [
      'Institutions don\'t adapt because they should — they adapt when the cost of not adapting becomes undeniable. With AI, the lag between capability and governance is the danger zone.',
      'Labour market transformation from AI isn\'t just an economics problem — it\'s a question about the social contract and the distribution of technological dividends.',
      'The access question cuts both ways: who gets the benefits of frontier AI, and who bears the risks of its deployment? Both are concentrated in ways that should concern us.',
      'Capability without purpose isn\'t progress. Scaling systems without scaling the wisdom to deploy them well just produces more powerful versions of existing problems.',
      'Adaptation isn\'t about predicting the future — it\'s about building institutions resilient enough to handle futures we can\'t predict.',
      'Everything you\'ve collected here matters — not the points, but the understanding. The integrity of this field depends on people who take the questions seriously.',
    ],
  },
};

export function getDialogue(key: string): DialogueData {
  return dialogues[key] || {
    speaker: 'Unknown Minty',
    lines: ['...', '(This Minty seems lost in thought.)'],
  };
}
