# The 9 Principles of Quality Business Writing



## Principle 1: Purpose - Every Document Exists to Change Someone's Mind or Behavior



Documents must have a clear purpose: what specific decision or action should the reader take after reading? If you can't articulate the intended behavior change, the document shouldn't exist.



**Test:** Can you state in one sentence what this document is supposed to make someone do or understand differently?



**Common failures:** Documents that explain things without orienting readers toward decisions or actions. Analysis without recommendations. Meeting notes without action items. Status reports without asks.



**Why this matters:** If Purpose is broken, nothing else matters. A well-structured document with no clear purpose is still useless. This is always the highest priority issue.



## Principle 2: Structure - Structure Is a Forcing Function for Thought



Real structure sequences information in the order the reader needs it to make a decision and makes gaps in thinking visible. Templates are not structure—they let you fill boxes without developing actual arguments.



**Test:** Does the structure force you to answer hard questions? If you can't fill a section, does it reveal what you don't know yet?



**Common failures:** Generic five-section documents (Introduction, Background, Analysis, Recommendations, Conclusion) that look complete but say nothing. Structure as formatting rather than logic.



## Principle 3: Constraints - Constraints Do More Work Than Instructions



Every constraint ("don't include X", "maximum 500 words", "use only provided data") is more valuable than an instruction ("include Y"). Constraints force prioritization; instructions allow comprehensiveness.



**Test:** Are there hard limits on length, scope, and content? Do these limits force hard choices about what matters most?



**Common failures:** No length constraints (leads to padding). No scope boundaries (everything is included). No content constraints (AI fills gaps with plausible-sounding fiction).



**Why this matters:** AI's default mode is comprehensive helpfulness. Without constraints, every document expands to include everything, making nothing a priority.



## Principle 4: Self-Evaluation - Quality Scales Through Self-Evaluation, Not Human Review



If your quality control depends on humans reading everything, you've already lost. Make documents self-check against explicit criteria before delivery.



**Test:** Does the document verify itself against concrete quality checks? Are the checks specific enough to be pass/fail?



**Common failures:** No built-in quality verification. Vague checks ("Is this good?" vs "Does every action item have an owner and deadline?"). Reliance on human review that can't scale.



## Principle 5: Failure Modes - Failure Modes Are More Predictable Than Success



You can't define what makes a great document, but you can define what makes a broken one. Every document type has predictable failure modes—test for those.



**Test:** Does the document address the specific ways this document type typically fails? Are checks objective and testable?



**Common failures:** Optimizing for "great" instead of "not broken". Missing the predictable failures (meeting notes without decisions, briefs without asks, docs without error handling).



## Principle 6: Input Quality - You Can't Prompt Your Way Around Bad Inputs



AI will happily write comprehensive documents from incomplete information by filling gaps with plausible-sounding inferences. The output looks complete but is built on assumptions, not facts.



**Test:** Do you have the actual information required for this document type? Not "I sort of know this" but specific data, decisions, and examples?



**Common failures:** Prompting AI to write before gathering actual information. Accepting output that looks complete without verifying it's based on real data. Estimated numbers, inferred decisions, invented examples.



**Why this matters:** If inputs are wrong, nothing downstream can fix it. A beautifully structured document built on assumptions is still fiction. This is the second-highest priority issue after Purpose.



## Principle 7: Voice - Every Organization's Documents Sound the Same Unless You Fight It



AI has a default voice (diplomatically hedge-y, generically professional). Without explicit voice specification, everything converges to the same tone, flattening the signal that comes from how people write.



**Test:** Does this document sound like it came from your organization/person, or does it sound like generic AI?



**Common failures:** Same cadence, transitions, and hedge language across all documents. Loss of personality and differentiation. Voice carries information about certainty—AI's default flattens this.



**Note:** This principle is more subjective than others. When evaluating, focus on whether generic AI phrases appear ("It's worth noting", "Additionally", "Moreover") rather than judging voice authenticity.



## Principle 8: Iteration - Iteration Is About Diagnosis, Not Polishing



"Make it better" doesn't work. Effective iteration requires specific diagnosis of what's broken before the next revision.



**Test:** Can you articulate the specific problem? Not "this feels off" but "Section 2 is too long" or "examples are generic" or "no clear recommendation"?



**Common failures:** Vague iteration requests that lead to full rewrites. Multiple passes without identifying the actual problem. Wasted iterations because the diagnosis was wrong.



## Principle 9: Workflows - Documents Don't Exist in Isolation—They Exist in Workflows



## Principle 9: Workflows - Documents Don't Exist in Isolation—They Exist in Workflows



Documents are tools in workflows. If the format doesn't match how the document is actually used in your organization, it doesn't matter how well-written it is.



**Test:** How is this document used downstream? Who reads it? What do they do with it? Does the format enable that use?



**Common failures:** Documents optimized as standalone artifacts rather than workflow tools. Format that doesn't match actual usage (meeting notes that can't be imported into task tracker, reports that don't surface information decision-makers need).



**Note:** This principle requires context about the organization's workflows. If you lack this context, note in evaluation: "Cannot assess Principle 9 without workflow context" and skip this principle.



---



## Principle Prioritization for Evaluation



When identifying priority fixes, use this hierarchy:



**Tier 1 - Fundamental (Always highest priority)**

1. **Principle 1 (Purpose)** - If this is broken, nothing else matters

2. **Principle 6 (Input Quality)** - Can't fix output if inputs are wrong



**Tier 2 - Structural (Fix after Tier 1)**

3. **Principle 3 (Constraints)** - Missing constraints cause everything else to expand

4. **Principle 2 (Structure)** - Affects how everything is organized



**Tier 3 - Refinement (Fix after Tier 1 and 2)**

5. **Principle 4 (Self-Evaluation)** - Important for scaling

6. **Principle 5 (Failure Modes)** - Document-specific quality

7. **Principle 8 (Iteration)** - Process improvement



**Tier 4 - Polish (Often subjective or context-dependent)**

8. **Principle 7 (Voice)** - Subjective, but matters for differentiation

9. **Principle 9 (Workflows)** - Requires organizational context



Within the same tier, prioritize fixes that:

- Affect the document's core function

- Block downstream usage

- Are quick wins (high impact, low effort)



---



## Document-Specific Failure Modes



### Meeting Notes

- No decisions documented

- Action items without owners or deadlines

- No clear next steps

- Missing date/attendees



### Status Reports

- No actual status stated (just narrative)

- Vague progress claims

- Hidden blockers

- No clear asks for help



### Executive Briefs

- No decision request

- Recommendation buried or absent

- Vague options without trade-offs

- Unsourced claims



### Project Proposals

- Vague problem statement

- Solution describes features, not outcomes

- No resource estimates provided (or estimates lack justification)

- Scope creep (no out-of-scope section)

- Hidden dependencies



### PRDs

- Vague requirements

- Missing edge cases

- Solution prescribed instead of problem described

- Success criteria unmeasurable at launch

- Undocumented open questions



### Technical Documentation

- Missing prerequisites

- Happy path only (no error handling)

- Incomplete code examples

- No troubleshooting

- Assumed knowledge



### Post-Mortems

- Blame individuals instead of systems

- Surface-level root cause

- Vague impact

- Timeline without specific times

- Action items without owners



### SOPs

- Assumes tribal knowledge

- Vague steps without clear actions

- No edge case handling

- No quality verification

- Outdated with no review schedule

