# business-doc-evaluator



> Evaluates business documents (meeting notes, status reports, executive briefs, proposals, PRDs, technical docs, post-mortems, SOPs) against 9 quality principles to identify specific problems and provide actionable fixes. Use when the user explicitly asks to "evaluate", "review", or "assess" document quality, when something "feels off" about a document, or when checking if a document is ready to ship.



## When to Use This Skill



This skill is triggered when working with tasks related to business-doc-evaluator.



**Common trigger scenarios:**

- the user explicitly asks to "evaluate"

- something "feels off" about a document

- checking if a document is ready to ship





## Skill Structure



- **Lines of documentation:** 268

- **Sections:** 7

- **Code examples:** 3



## Bundled Resources



### Reference Documentation



- [`references/principles.md`](references/references/principles.md)



## Key Sections



- **Business Document Quality Evaluator**

- **When To Use This Skill**

- **How This Works**

- **Evaluation Process**

- **Output Format**



## Usage Examples



### Example 1



```text

OVERALL VERDICT: REJECT - Fundamental Issue



PRIMARY PROBLEM: [Principle 1 or 6 failure description]



EVIDENCE: [Specific examples from document]



RECOMMENDATION: Fix this core issue before detailed evaluation. The other principles don't matter until this is resolved.



NEXT STEPS: [What specifically

...

```



### Example 2



```text

DOCUMENT TYPE: [meeting notes / status report / etc]



OVERALL VERDICT: [SHIP / REVISE / REJECT]

- SHIP: Document is ready to use

- REVISE: Document has fixable issues that should be addressed

- REJECT: Document has fundamental problems (Principle 1 or 6 failures, wrong type, missing critical informa

...

```



### Example 3



```text

DOCUMENT TYPE: [type]

DOCUMENT LENGTH: [word count / page count]



OVERALL VERDICT: [SHIP / REVISE / REJECT]



QUICK SCAN RESULTS:

- Principle 1 (Purpose): [assessment with 1 sentence explanation]

- Principle 6 (Input Quality): [assessment with 1 sentence explanation]

- Principle 3 (Constraints): [ass

...

```



## Quality Validation





<details>

<summary>View validation details</summary>



- `INFO` Description: Description contains vague term 'some' - consider being more specific

- `INFO` Structure: Consider adding an 'Overview' section to introduce the skill

- `INFO` Terminology: Found 'you must' - consider using imperative form (e.g., 'Use' instead of 'You should use')

- `INFO` Examples: Code block 1 has no language tag. Consider adding one for syntax highlighting.

- `INFO` Examples: Code block 2 has no language tag. Consider adding one for syntax highlighting.

- `INFO` Examples: Code block 3 has no language tag. Consider adding one for syntax highlighting.



</details>



---



_Documentation auto-generated from `SKILL.md`_

