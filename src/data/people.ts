export interface PersonData {
  name: string;
  role: string;
  disc: string;
  affiliation: string;
  bio: string;
  headshot?: string;
  links?: { label: string; url: string }[];
}

export const teamMembers: PersonData[] = [
  {
    name: 'Seth Lazar',
    role: 'Principal Investigator',
    disc: 'Philosophy',
    affiliation: 'Johns Hopkins University',
    bio: 'Professor at Johns Hopkins University School of Government and Policy and principal investigator of MINT Lab. Research focuses on the philosophy of AI and computing, and on the defence, reinvigoration, and redesign of liberal democratic institutions for the AI transition.',
    headshot: 'seth-lazar.jpg',
    links: [
      { label: 'CV', url: '/cv/' },
      { label: 'Google Scholar', url: 'https://scholar.google.com/citations?user=8H9KFCoAAAAJ' },
    ],
  },
  {
    name: 'Daniel Kilov',
    role: 'Lab Manager, Research Fellow',
    disc: 'Philosophy, Cognitive Science',
    affiliation: 'Australian National University',
    bio: 'Daniel Kilov works on philosophy of mind, cognitive science, and moral psychology. His PhD research concerns the shape and limits of expertise and combines experimental methods with the traditional, armchair methods of philosophy. He has recently developed an interest in AI technologies and the ways they may augment or supplant human expertise. In addition, Daniel is interested methodological questions around the development of moral machines; Can empirical results about folk morality undermine traditional a priori moral theorizing? Can we treat \'moral judgement\' as a natural kind term that picks out a nomological clustering of real psychosocial properties to be uncovered by empirical investigation? If so, what are our best empirical theories of moral foundations or moral universals? Answering these questions is a precondition to constructing or training AI agents that are sensitive to moral properties.\n\nDaniel is now working on just these topics, as a postdoctoral research fellow on the ARC Linkage project on socially responsible insurance in the age of AI.',
    headshot: 'daniel-kilov.jpg',
    links: [
      { label: 'Google Scholar', url: 'https://scholar.google.com/citations?user=sMGWxCgAAAAJ' },
    ],
  },
  {
    name: 'Secil Yanik Guyot',
    role: 'Research Engineer',
    disc: 'Cybernetics, Data Science',
    affiliation: 'Johns Hopkins University',
    bio: 'Secil has a background in data, analytics and business analysis with over 15 years industry experience. She worked for leading companies in logistics and cyber security and in domains of finance, marketing and customer service, and as a consultant in the social for-purpose sector. At MINT Lab, she is supporting empirical research with her technical expertise and working on developing AI tools for the lab. She holds a masters degree in Applied Cybernetics from Australian National University, bachelors degree in Business Informatics from Marmara University and a MicroMasters credential in Statistics and Data Science from MITx.',
    links: [
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/secilyanik/' },
    ],
  },
  {
    name: 'Ned Howells-Whitaker',
    role: 'Research Fellow',
    disc: 'Philosophy',
    affiliation: 'Johns Hopkins University',
    bio: 'Research Fellow at MINT Lab. His research addresses philosophical questions about the normative dimensions of AI systems.',
  },
  {
    name: 'Jennifer Munt',
    role: 'Research Fellow',
    disc: 'Philosophy, Political Science',
    affiliation: 'Australian National University',
    bio: 'Jenny is a philosophy PhD candidate in Philosophy at the Australian National University. She works on the epistemology of trust and trustworthiness, with a focus on what it means for individuals, institutions, and AI to trust and be trustworthy.\n\nShe holds a BA (Hons) in philosophy and political science and a MA (Research) in formal epistemology.',
    headshot: 'jennifer-munt.jpg',
  },
  {
    name: 'Tim Dubber',
    role: 'PhD Student',
    disc: 'Philosophy, Political Science',
    affiliation: 'Australian National University',
    bio: 'Tim is a PhD candidate working with the MINT lab. He holds an MSc in Epistemology, Ethics and Mind from the University of Edinburgh and an MA in Strategy and Security from UNSW. Furthermore, Tim has spent over a decade and a half working in the Australian Department of Defence, both in and out of uniform. His area of research focus is the ethics of machine intelligence warfare.',
  },
  {
    name: 'Iman Ferestade',
    role: 'PhD Student',
    disc: 'Philosophy, Engineering',
    affiliation: 'Australian National University',
    bio: 'Iman Ferestade is a first-year PhD student studying Philosophy at the Australian National University. His focus will be on AI safety and robustness, along with a strong interest in digging into AI opacity and computational simulation opacity more broadly.\n\nPrior to coming to ANU, Iman earned a PhD in Mechanical Engineering from IUST. He also completed two Master\'s degrees: one in Philosophy from SFU and one in Mechanical Engineering from IUST. Additionally, He spent one year as a visiting scholar at the Center for Vehicle Systems and Safety (CVeSS) at Virginia Tech University.',
    headshot: 'iman-ferestade.jpg',
  },
  {
    name: 'Cameron Pattison',
    role: 'PhD Student',
    disc: 'Philosophy',
    affiliation: 'Australian National University',
    bio: 'Cameron Pattison is a PhD student in Philosophy at Vanderbilt University, specializing in formal epistemology and applied ethics. His research examines how AI systems mediate access to information, moral reasoning, and democratic participation. Current projects include studying LLM over-refusal in compliance contexts (with Seth Lazar, JHU), investigating corporate influence on AI ethics discourse (Lacy-Fischer Grant), and evaluating AI-assisted translation of classical philosophical texts (with Vanderbilt and Harvard Classics). He co-directs the AI and the Human seminar at Vanderbilt\'s Robert Penn Warren Center, curates the MINT Philosophy of Computing newsletter, and builds computational tools for philosophical research.',
    headshot: 'cameron-pattison.jpg',
    links: [
      { label: 'Website', url: 'https://campattison.github.io/bio/index.html' },
    ],
  },
  {
    name: 'Andrew Smart',
    role: 'PhD Student',
    disc: 'Philosophy, Cognitive Science',
    affiliation: 'Australian National University',
    bio: 'Andrew Smart is a Senior Research Scientist at Google Research working broadly on understanding social impacts of AI. He is based in San Francisco. His first love is philosophy and he is excited to join the MINT lab as a (very old) PhD student. A lifelong goal of his is to finish a PhD in philosophy. At Google he has collaborated with philosophers to critically examine foundational epistemic and philosophy of science questions about data, machine learning, and of course recently LLMs and foundation models. He has collaborated with MINT alum Atoosa Kasirzadah on how counterfactuals get used or misused in ML fairness, and he recently collaborated with Mel Andrews and Abeba Birhane on how abandoned pseudoscientific ideas get recycled back into scientific research via machine learning. He hopes to foster more collaboration between philosophers of technology and technologists at Google.\n\nPrior to joining Google he was a research scientist at Twitter, Novartis, and Honeywell Aerospace. He has worked on data science, medical device safety, clinical research, and safety engineering/human factors in aviation. His academic background is in anthropology, philosophy and cognitive science. He has a masters degree in cognitive science from Lund University in Sweden, and he worked as a junior research scientist at NYU, where he worked on brian imaging of human language. He is also the author of two popular science books about the neuroscience of idleness and about the possibility of robots taking psychedelic drugs.',
    headshot: 'andrew-smart.jpg',
  },
  {
    name: 'Jake Stone',
    role: 'PhD Student',
    disc: 'Philosophy, Law',
    affiliation: 'Australian National University',
    bio: 'Jake is a PhD candidate in Philosophy with the Australian National University and a Postdoctoral researcher with the Hasso Plattner Institute. He holds an MSc in data science, a BA (Hons) in philosophy, and a LLB (Hons). His current work focuses on the political economy of data and compute.',
    headshot: 'jake-stone.jpg',
    links: [
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/jake-s-3b48b1179/' },
      { label: 'PhilPeople', url: 'https://philpeople.org/profiles/jake-iain-stone' },
    ],
  },
  {
    name: 'Caroline Hendy',
    role: 'Research Assistant',
    disc: 'Linguistics, Data Science',
    affiliation: 'Australian National University',
    bio: 'Caroline is a linguist and data scientist undertaking her PhD at the Australian National University, where she researches child language acquisition. She holds degrees in linguistics from ANU and the University of Hawai\u02bbi at M\u0101noa (completed on a Fulbright scholarship), as well as graduate certificates in psychology and applied data analytics. In the MINT Lab, she conducts data analysis across a range of projects, including model evaluation.',
    headshot: 'caroline-hendy.jpg',
  },
  {
    name: 'Theo Murray',
    role: 'Research Assistant',
    disc: 'Philosophy',
    affiliation: 'Australian National University',
    bio: 'Theo is a PhD candidate in Philosophy at the Australian National University, specialising in moral psychology. His doctoral research concerns blame\'s communicative function, and makes progress on related topics, including blame\'s epistemic norm, blame\'s value, and the nature of relationships.\n\nThis research intersects with existing puzzles in the normative philosophy of computing: how AI agents might be responsible and how they might otherwise fit into our ordinary interpersonal moral practices.',
    links: [
      { label: 'PhilPeople', url: 'https://philpeople.org/profiles/theo-murray' },
    ],
  },
  {
    name: 'Charis Yang',
    role: 'Research Assistant',
    disc: 'Philosophy',
    affiliation: 'Australian National University',
    bio: 'Research Assistant at MINT Lab. Her work contributes to research on the normative dimensions of artificial intelligence.',
  },
  {
    name: 'Sichao Li',
    role: 'Visiting Fellow',
    disc: 'Computer Science',
    affiliation: 'Visiting',
    bio: 'Sichao Li, PhD is a computer scientist with a doctorate from the Australian National University (ANU) and a Fellow of the Higher Education Academy (FHEA). His research focuses on explainable AI (XAI) and large language models (LLMs), with particular interests in explainable agents, LLM safety and interpretability, and the application of AI in scientific discovery.\n\nFollowing his PhD, he worked as a Research Fellow exploring the intersection of AI and neuroscience, using machine learning to uncover patterns of neural connectivity and decision-making mechanisms. His current work also examines how LLMs understand, reason, and align with human thinking, with an emphasis on ethics and trustworthy AI.',
  },
  {
    name: 'Elena Ajayi',
    role: 'Visiting Student',
    disc: 'Computer Science',
    affiliation: 'Visiting',
    bio: 'Visiting Student at MINT Lab. Her research focuses on computational approaches to AI safety and governance.',
    headshot: 'elena-ajayi.jpg',
  },
  {
    name: 'Abbas Bagwala',
    role: 'Visiting Student',
    disc: 'Philosophy',
    affiliation: 'Visiting',
    bio: 'Abbas Bagwala is a PhD student in philosophy at the University of Oregon working on questions at the intersection of epistemology, philosophy of technology, and political philosophy. His research examines how emerging information technologies reshape practices of inquiry, explanation, and collective reasoning. He is particularly interested in how machine learning and data infrastructures affect the distribution of knowledge, authority, and responsibility in contemporary social and political life.',
    headshot: 'abbas-bagwala.jpg',
    links: [
      { label: 'PhilPeople', url: 'https://philpeople.org/profiles/abbas-bagwala-1' },
    ],
  },
  {
    name: 'Noah Birnbaum',
    role: 'Visiting Student',
    disc: 'Philosophy, Cognitive Science',
    affiliation: 'Visiting',
    bio: 'Noah Birnbaum is a third-year undergraduate at the University of Chicago studying Philosophy and Cognitive Science. His academic interests center on normative and metaethics, formal epistemology, and decision theory. In AI, he focuses on digital sentience, existential takeover risks from misaligned AI, and value-lock-in dynamics arising from AI centralization. He also writes about ethics, epistemology, and AI on his Substack, Irrational Community.',
  },
  {
    name: 'Angelica Chowdhury',
    role: 'Visiting Student',
    disc: 'Computer Science',
    affiliation: 'Visiting',
    bio: 'Visiting Student at MINT Lab. Her research focuses on the technical and ethical aspects of AI systems.',
  },
  {
    name: 'ChunYan (CY)',
    role: 'Visiting Student',
    disc: 'Computer Science, Philosophy',
    affiliation: 'Visiting',
    bio: 'Visiting Student at MINT Lab. Their research spans computer science and philosophy, investigating normative questions in AI.',
  },
  {
    name: 'Shira Gur Arieh',
    role: 'Visiting Student',
    disc: 'Law',
    affiliation: 'Visiting',
    bio: 'Shira Gur-Arieh is a doctoral candidate at Harvard Law School and a Graduate Student Fellow at the Berkman Klein-Center for Internet & Society. Her research focuses on legitimacy in algorithmic decision-making, with a particular interest in questions that revolve around the gap between model predictions and human decisions. She is also interested in sociotechnical safety, value alignment, and how monoculture manifests in foundation models and its implications on discrimination and exclusion. Before pursuing her doctorate, Shira clerked for the Chief Justice of the Supreme Court of Israel.',
  },
  {
    name: 'Changbai Li',
    role: 'Visiting Student',
    disc: 'Computer Science',
    affiliation: 'Visiting',
    bio: 'Changbai Li is an AI researcher pursuing a dual master in Computer Science and Artificial Intelligence at Oregon State University. His research interests lie in the epistemic influence of AI at the individual and group level, and supporting human operation in open-ended domains. Changbai came from a background in new media art and software engineer; maintained China\'s first makerspace, Xinchejian; and co-founded an AI assistant startup.',
    headshot: 'changbai-li.jpg',
    links: [
      { label: 'Website', url: 'https://changbai.li' },
    ],
  },
  {
    name: 'Lorenzo Manuali',
    role: 'Visiting Student',
    disc: 'Philosophy, Political Science',
    affiliation: 'Visiting',
    bio: 'Lorenzo is a philosopher with interests in the intersection of democratic theory and AI \u2013 especially how practitioners are using LLMs to enhance democratic processes (e.g., as deliberative facilitators, as representatives, etc.). He is also interested in how emerging technologies like AI and social media change our motivational processes in ways that (1) facilitate addiction and/or (2) are (not) conducive to democracy.',
    headshot: 'lorenzo-manuali.jpg',
    links: [
      { label: 'Website', url: 'https://lorenzomanuali.com' },
    ],
  },
  {
    name: 'Lena Wang',
    role: 'Visiting Student',
    disc: 'Philosophy, Computer Science',
    affiliation: 'Visiting',
    bio: 'Lena Wang is a PhD Student in Philosophy at the University of Cambridge, working in the areas of social epistemology, political philosophy, and the philosophy of technology. Currently, her research focuses on examining hierarchies in what counts as knowledge. She has a particular interest in the impact of technological systems on our epistemic practices\u2014including ML agency as it pertains to conceptual engineering and the effect of this on our decision-making processes.\n\nLena received her MPhil in Philosophy from the University of Cambridge, and a BA in Philosophy/BS in Computer Science and Physics from the University of Sydney.',
    headshot: 'lena-wang.jpg',
  },
];
