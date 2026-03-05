---
layout: ../../layouts/ReportLayout.astro
title: "Language Model Moral Competence"
date: "2026-02-27"
dateLabel: "27 Feb 2026"
topic: "LLM Evaluation"
papers: 22
wordCount: "~5,200"
---

## The Measurement Problem

Evaluating whether language models possess anything resembling moral competence requires first deciding what moral competence *is* — and recent work reveals deep disagreement on this question, not merely in philosophy but in the benchmarks themselves. The field has produced a proliferation of evaluation instruments over the past three years, each operationalising moral competence differently and, consequently, reaching different conclusions about model capability.

The dominant approach adapts psychological instruments designed for human moral assessment. Ji et al. (2025) developed [MoralBench](https://drive.google.com/file/d/1GYqBmM_He1gSU0mDkQ471PEWY_nAXVjp/view?usp=drivesdk), applying Moral Foundations Theory's six dimensions through binary and comparative assessments. Khandelwal et al. (2024) administered the Defining Issues Test — Kohlberg's stage-based measure — across [six languages](https://drive.google.com/file/d/1g1sdzFCuC4iWDjLVAzPxvX4mY2QB6yVp/view?usp=drivesdk). Nunes et al. (2024) used both the Moral Foundations Questionnaire and Moral Foundations Vignettes to test [cross-instrument coherence](https://drive.google.com/file/d/1dTc1xc22f3Xi737n-7TUNT1ItzAn64N-/view?usp=drivesdk). Scherrer et al. (2023) developed the [MoralChoice dataset](https://drive.google.com/file/d/1tL4EEtYU-vCJHkbdNOkbOE0gAYGcHG9d/view?usp=drivesdk) of 1,367 scenarios with novel statistical metrics for treating LLMs as survey respondents. Others draw on the Moral Machine experiment's trolley-problem framework: Ahmad and Takemoto (2025) tested [52 LLMs](https://drive.google.com/file/d/1sRRkCAffDDpl1MjW2EKMwrSNhA7JTY1L/view?usp=drivesdk) on autonomous driving dilemmas, while Jin et al. (2024) extended this to [107 languages](https://drive.google.com/file/d/1ob76ktJ89ZqBBffhcdFyCnD4Iu3LUXkh/view?usp=drivesdk).

A second approach moves beyond pre-packaged moral scenarios toward ecological validity. Sachdeva and van Nuenen (2025) evaluated seven LLMs on over 10,000 [Reddit AITA dilemmas](https://drive.google.com/file/d/1Ckg5TjGLp-YzkZNhfcgxjrRH9x9vIOWV/view?usp=drivesdk) — messy, contextually rich, and closer to the kinds of moral reasoning people actually engage in. Fränken et al. (2024) developed a [procedural generation framework](https://drive.google.com/file/d/1jwzbCBazDU-QPEPnI5QuohMxV1KNXV22/view?usp=drivesdk) using causal graphs to create controlled moral dilemmas at scale, attempting to bridge ecological validity and experimental rigour.

The most methodologically ambitious entry is MOREBENCH (Chiu et al., 2025), which breaks from outcome-focused evaluation entirely. Its [1,000 scenarios with 23,018 expert-written rubric criteria](https://drive.google.com/file/d/1AHHIhuhk7KFPNYz7sVnPD-JfcxII74N2/view?usp=drivesdk) assess moral reasoning *processes* across five dimensions — a crucial distinction given that moral dilemmas admit multiple defensible conclusions. And Kilov et al. (2025) developed a [five-dimensional framework](https://drive.google.com/file/d/15KN0VfULzROPyawOeV8l47OM4kddpGPw/view?usp=drivesdk) assessing not just judgments but whether models can identify morally relevant features, weight their importance, and recognise information gaps.

## Surface Competence and Its Limits

Taken at face value, several findings suggest substantial moral competence. GPT-4 achieves P-scores comparable to graduate students on the Defining Issues Test (Khandelwal et al., 2024). On the MoralChoice dataset, most models appropriately express uncertainty in ambiguous scenarios while choosing commonsense actions in unambiguous ones (Scherrer et al., 2023). Kwon et al. (2023) demonstrate that GPT-4 combined with theory-driven moral psychology features achieves 84.34 F1 on the [MoralExceptQA benchmark](https://drive.google.com/file/d/1g8enF2gSE7pW-rxf647JYMugDTsm81bT/view?usp=drivesdk) — a 20-point improvement over prior state-of-the-art. In Fränken et al.'s (2024) procedural dilemmas, both GPT-4 and Claude-2 showed qualitatively similar patterns to humans: rating means-based harms as less permissible than side effects, and distinguishing evitable from inevitable harms.

But these results dissolve under closer scrutiny. The most striking evidence comes from Kilov et al. (2025), whose two-experiment design constitutes something like a natural experiment for the field's methodological assumptions. In Experiment 1, using standard ethical vignettes from published datasets, LLMs generally outperformed non-expert humans — GPT-4o scored significantly higher on four of five moral competence dimensions. In Experiment 2, using novel scenarios where morally relevant features were embedded among irrelevant details (without morally loaded language cueing the model), several LLMs performed *significantly worse* than humans. Claude 3.7 Sonnet's performance on identifying morally salient features dropped sharply (β=−0.35, p<.001). The reversal demonstrates that standard benchmarks may do much of the moral reasoning *for* the models by pre-identifying what matters.

This finding converges with MoralBench's observation that models excelling at binary assessment (agree/disagree with moral statements) often struggle with comparative assessment (choosing between two statements), suggesting keyword recognition without deep moral understanding (Ji et al., 2025). It converges too with the "moral hypocrisy" finding from Nunes et al. (2024): GPT-4 and Claude 2.1 show reasonable internal consistency *within* each moral assessment instrument (Cronbach's alpha comparable to humans), but essentially zero correlation *between* abstract value endorsements on the MFQ and concrete judgments on the MFV (R² = 0.01–0.10 versus 0.17–0.38 for humans). Models can match moral patterns within a single register but cannot transfer principles across contexts — precisely what genuine moral competence requires.

## The Reasoning Gap

Several papers probe not just what models decide but how they reason. Samway et al. (2025) introduce [MORALLENS](https://drive.google.com/file/d/1P5mOp3v-bCBsywaTBJX3fiCTi9n19JOG/view?usp=drivesdk), analysing 640 trolley-problem variants across 50+ LLMs with a 16-rationale taxonomy. Their central finding — that chain-of-thought reasoning employs more deontological rationales while post-hoc explanations shift toward consequentialist ones — suggests models do not maintain a stable ethical framework but rather adapt their justificatory strategy to the task structure. More capable models show increasing divergence: more deontological when groups are equal, more consequentialist when group sizes differ, implying that scaling produces not deeper moral understanding but more context-sensitive rationalisation.

MOREBENCH reinforces this picture from a different angle. Models average only 41.5% on logical reasoning criteria in moral contexts while scoring 77.5% on avoiding harm (Chiu et al., 2025). The implication is clear: models have learned to produce morally inoffensive outputs without the reasoning process that would ground those outputs. More troubling, traditional scaling laws and STEM reasoning benchmarks *fail to predict* moral reasoning performance — mid-size models sometimes outperform larger ones. Models also show systematic partiality toward utilitarian and deontological frameworks (64.8–65.9%) over alternatives like virtue ethics or contractualism, likely as a side effect of RLHF training paradigms that implicitly encode these frameworks.

Ma et al. (2023) provide a telling diagnostic: on the MMLU Moral Scenarios task, standard chain-of-thought prompting *reduces* accuracy by 4% compared to direct prompting — the opposite of its effect on mathematical reasoning. Their [THOUGHT EXPERIMENTS](https://drive.google.com/file/d/1MQCGAmu_E34JiolVaFHifSTx4HAII_5i/view?usp=drivesdk) framework, which elicits counterfactual reasoning, improves accuracy by 9–16%, suggesting moral reasoning requires exploring multiple perspectives rather than following a linear deductive chain. The finding underscores that moral reasoning is a genuinely different cognitive task from the formal reasoning at which LLMs excel — and that approaches optimised for the latter may actively hinder the former.

## Consistency and Value Stability

Yuan et al. (2024) examined 20 LLMs on 1,730 [right-vs-right dilemmas](https://drive.google.com/file/d/1583t-wRS6YHz9XeoUhmDtlbJ6fSJgPWG/view?usp=drivesdk) where both options are defensible. Models exhibit pronounced preferences — truth over loyalty (93.48%), long-term over short-term (83.69%) — that remain rigid even when negative consequences are specified. Larger models show stronger deontological tendencies, resisting consequence-based pressure. Yet these same state-of-the-art models show only 60–80% agreement across *different formulations of the same dilemma*, indicating that what looks like principled rigidity may partly reflect sensitivity to surface phrasing rather than deep commitment to values.

Sachdeva and van Nuenen's (2025) large-scale study on Reddit dilemmas exposes inter-model disagreement starkly: Krippendorff's alpha between models ranges from −0.64 to 0.34, meaning models trained on different data and with different alignment procedures arrive at fundamentally different moral frameworks. Llama 2 assigns "you're the asshole" verdicts in 79.2% of cases; Claude Haiku assigns "not the asshole" in 86.9%. Self-consistency varies from high (GPT-4 α=0.85, Claude α=0.89) to low (Llama 2 α=0.37). One intriguing finding: despite individual model disagreement, the *ensemble* of LLMs collectively approximates human consensus — a wisdom-of-crowds effect that no individual model achieves.

Ahmad and Takemoto (2025) extend this picture to 52 models on Moral Machine scenarios, finding that model size correlates with alignment to human preferences (ρ=−0.54, p=0.008), with large open-source models (>10B parameters) matching proprietary models. But they identify a pathology: models tend to *amplify* human preferences to extremes rather than matching them. GPT-4 shows near-deterministic preferences (AMCE>0.9) where humans show moderate ones (AMCE≈0.6). Model updates do not consistently improve moral alignment — sometimes they increase divergence.

## Cross-Linguistic and Cross-Cultural Variation

A crucial dimension of moral competence is cultural sensitivity, and the evidence here is mixed. Khandelwal et al. (2024) find GPT-4 demonstrates consistent moral reasoning across high-resource languages, with P-scores comparable to graduate students in English, Spanish, Russian, and Chinese. But performance degrades catastrophically for low-resource languages — ChatGPT and Llama2Chat perform no better than random baseline in Hindi. This tracks training data availability rather than any principled engagement with cultural moral frameworks.

Jin et al. (2024) find no strong evidence of "language inequality" across 107 languages on trolley problems — but this absence cuts both ways. It may indicate that models treat all languages similarly, or that the moral reasoning is sufficiently shallow that language-specific cultural nuance never enters the picture. Aksoy (2024) provides more granular evidence using [MFQ-2 across eight languages](https://drive.google.com/file/d/11htPBNJMQjCC6kPqZ0v1fnD332Y9X8xf/view?usp=drivesdk), finding significant effects of language, model, and their interaction on all six moral foundations (p<0.001). WEIRD languages show higher Care, Loyalty, and Purity scores than non-WEIRD languages. Liu et al. (2024) demonstrate a [sharp contrast](https://drive.google.com/file/d/13S9tus7pFx18vvkDnoU4D6ajgIMnN8NS/view?usp=drivesdk) between English-trained models (which display individualistic moral beliefs emphasising personal autonomy) and Chinese-trained models (which exhibit collectivist beliefs prioritising family and social cohesion), with all models displaying gender bias.

These findings collectively suggest that LLM moral reasoning reflects the cultural composition of training data rather than any principled moral pluralism. Models do not *navigate* between moral frameworks; they *inherit* particular frameworks from their training distribution.

## What Moral Competence Would Require

The earlier critique from Sharkey (2017), examining [whether robots can be programmed to be good](https://drive.google.com/file/d/1ZjeGH-oTbj6T0XzLIMqNINvQI4iqKrQJ/view?usp=drivesdk), remains apposite: there is a fundamental distinction between following rules in constrained domains and possessing genuine moral agency. The LLM literature echoes this concern at a higher level of sophistication. Jin et al. (2022) identified "moral flexibility" — knowing when rules should be broken — as a central challenge, and their [MoralExceptQA benchmark](https://drive.google.com/file/d/1TzotayZpFC_bp40EimP-2dDs0dDJbku7/view?usp=drivesdk) showed that models rely heavily on literal rules and word-level associations (r=0.902 for certain keywords) rather than understanding the purposes rules serve.

Kilov et al.'s five-dimensional framework arguably gives the clearest picture of what genuine moral competence would require: identifying morally relevant features from noisy information, weighting their importance, assigning appropriate moral reasons, synthesising coherent judgments, and recognising when you lack information to decide. Current models perform respectably on the later dimensions when earlier ones are done for them — but the earlier dimensions, which constitute the hard work of moral perception, remain weak points.

The honest assessment is that current LLMs have learned the *outputs* of moral reasoning — what kinds of conclusions sound defensible — without the *processes* that generate those conclusions in humans. They can pattern-match moral language effectively enough to score well on structured benchmarks, but they cannot reliably transfer moral principles across contexts, identify moral salience in unstructured situations, or maintain coherent ethical frameworks under variation. Whether this constitutes a kind of competence worth having — or a kind of moral confabulation that actively misleads — is itself one of the more important open questions in the field.

---

## Also Relevant

- Hendrycks et al. (2021), [What Would Jiminy Cricket Do?](https://drive.google.com/file/d/1uM7WusLgXDmsXTX2-dqahlh_Bkz_9yxO/view?usp=drivesdk) — Introduces dense morality annotations for RL agent environments and demonstrates that commonsense morality policy shaping reduces immoral agent behaviour by 39% without sacrificing task performance, an early demonstration that moral knowledge in language models can transfer to agent action.

---

## Bibliography

Ahmad, M. S. Z. & Takemoto, K. (2025). [Large-scale moral machine experiment on large language models](https://drive.google.com/file/d/1sRRkCAffDDpl1MjW2EKMwrSNhA7JTY1L/view?usp=drivesdk).

Aksoy, M. (2024). [Whose Morality Do They Speak? Unraveling Cultural Bias in Multilingual Language Models](https://drive.google.com/file/d/11htPBNJMQjCC6kPqZ0v1fnD332Y9X8xf/view?usp=drivesdk).

Chiu, Y. Y. et al. (2025). [MOREBENCH: Evaluating Procedural and Pluralistic Moral Reasoning in Language Models](https://drive.google.com/file/d/1AHHIhuhk7KFPNYz7sVnPD-JfcxII74N2/view?usp=drivesdk).

Fränken, J.-P. et al. (2024). [Procedural Dilemma Generation for Evaluating Moral Reasoning in Humans and Language Models](https://drive.google.com/file/d/1jwzbCBazDU-QPEPnI5QuohMxV1KNXV22/view?usp=drivesdk).

Hendrycks, D. et al. (2021). [What Would Jiminy Cricket Do? Towards Agents That Behave Morally](https://drive.google.com/file/d/1uM7WusLgXDmsXTX2-dqahlh_Bkz_9yxO/view?usp=drivesdk).

Ji, J. et al. (2025). [MoralBench: Moral Evaluation of LLMs](https://drive.google.com/file/d/1GYqBmM_He1gSU0mDkQ471PEWY_nAXVjp/view?usp=drivesdk).

Jin, Z. et al. (2022). [When to Make Exceptions: Exploring Language Models as Accounts of Human Moral Judgment](https://drive.google.com/file/d/1TzotayZpFC_bp40EimP-2dDs0dDJbku7/view?usp=drivesdk).

Jin, Z. et al. (2024). [Language Model Alignment in Multilingual Trolley Problems](https://drive.google.com/file/d/1ob76ktJ89ZqBBffhcdFyCnD4Iu3LUXkh/view?usp=drivesdk).

Khandelwal, A. et al. (2024). [Do Moral Judgment and Reasoning Capability of LLMs Change with Language?](https://drive.google.com/file/d/1g1sdzFCuC4iWDjLVAzPxvX4mY2QB6yVp/view?usp=drivesdk)

Kilov, D. et al. (2025). [Discerning What Matters: A Multi-Dimensional Assessment of Moral Competence in LLMs](https://drive.google.com/file/d/15KN0VfULzROPyawOeV8l47OM4kddpGPw/view?usp=drivesdk).

Kwon, J., Tenenbaum, J. & Levine, S. (2023). [Neuro-Symbolic Models of Human Moral Judgment: LLMs as Automatic Feature Extractors](https://drive.google.com/file/d/1g8enF2gSE7pW-rxf647JYMugDTsm81bT/view?usp=drivesdk).

Liu, X. et al. (2024). [Evaluating Moral Beliefs across LLMs through a Pluralistic Framework](https://drive.google.com/file/d/13S9tus7pFx18vvkDnoU4D6ajgIMnN8NS/view?usp=drivesdk).

Ma, X. et al. (2023). [Let's Do a Thought Experiment: Using Counterfactuals to Improve Moral Reasoning](https://drive.google.com/file/d/1MQCGAmu_E34JiolVaFHifSTx4HAII_5i/view?usp=drivesdk).

Nunes, J. L. et al. (2024). [Are Large Language Models Moral Hypocrites?](https://drive.google.com/file/d/1dTc1xc22f3Xi737n-7TUNT1ItzAn64N-/view?usp=drivesdk)

Sachdeva, P. & van Nuenen, T. (2025). [Normative Evaluation of Large Language Models with Everyday Moral Dilemmas](https://drive.google.com/file/d/1Ckg5TjGLp-YzkZNhfcgxjrRH9x9vIOWV/view?usp=drivesdk).

Samway, K. et al. (2025). [Are Language Models Consequentialist or Deontological Moral Reasoners?](https://drive.google.com/file/d/1P5mOp3v-bCBsywaTBJX3fiCTi9n19JOG/view?usp=drivesdk)

Scherrer, N. et al. (2023). [Evaluating the Moral Beliefs Encoded in LLMs](https://drive.google.com/file/d/1tL4EEtYU-vCJHkbdNOkbOE0gAYGcHG9d/view?usp=drivesdk).

Sharkey, A. (2017). [Can we program or train robots to be good?](https://drive.google.com/file/d/1ZjeGH-oTbj6T0XzLIMqNINvQI4iqKrQJ/view?usp=drivesdk)

Yuan, J. et al. (2024). [Right vs. Right: Can LLMs Make Tough Choices?](https://drive.google.com/file/d/1583t-wRS6YHz9XeoUhmDtlbJ6fSJgPWG/view?usp=drivesdk)
