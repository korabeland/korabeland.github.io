## Why This Prompt Works (Principle Annotations)



**Principle 1 (Purpose):** "enables someone to execute a repeatable process consistently and correctly" - SOPs exist to ensure consistency and quality when multiple people execute the same process. The structure forces operational precision.



**Principle 2 (Structure as Logic):** Purpose → Scope → Roles → Prerequisites → Steps → Edge Cases → Quality Checks → Troubleshooting → Metadata. This is the execution sequence: "Why am I doing this? Is this the right procedure? Who's involved? Am I ready to start? What do I do? What if something's different? Did I do it right? What if something breaks? Who maintains this?"



**Principle 3 (Constraints):**



- 1200 words allows comprehensive coverage of edge cases

- "Must state what this does NOT cover" prevents wrong procedure being used

- "Each step must have verb and expected outcome" makes steps executable

- "IF/THEN/ELSE format" eliminates ambiguity in decisions

- "DO NOT make steps dependent on tribal knowledge" ensures transferability

- "Must use actual scenarios from inputs" prevents invented edge cases



**Principle 4 (Self-Evaluation):** Quality checks ensure SOP is actually usable by someone unfamiliar with the process. "No step relies on 'knowing how we usually do this'" is the critical test.



**Principle 5 (Failure Modes):** Addresses how SOPs typically fail:



- Assumes tribal knowledge (only experts can follow it)

- Missing scope boundaries (used for wrong situations)

- Vague steps (no clear action or success criteria)

- No edge case handling (breaks when reality differs from happy path)

- No quality verification (can't tell if done correctly)

- Outdated (no owner or review schedule)

- Decision points buried in narrative (ambiguous when to do what)



**Principle 6 (Input Quality):**



- "Use only information from inputs" prevents invented process steps

- "Must use actual scenarios from inputs" for edge cases grounds them in reality

- "Must include actual tool names from inputs" ensures accuracy

- Requires current process and actual decision points as inputs



**Principle 7 (Voice):**



- "Instructional and precise"

- "Use imperative voice"

- "State decisions explicitly"

SOPs are instructions, not explanations. This voice reflects that.



**Principle 9 (Workflow):** "Will be used by people with varying experience levels" tells AI the SOP can't assume expertise. It must be explicit enough for someone who's never done this process before.



---



## How to Customize This Prompt



**For your process maturity:**



- Early-stage process: Add section "Known Issues" for things you know are broken but haven't fixed

- Mature process: Add section "Process Metrics" showing cycle time, error rate, completion rate

- Regulated process: Add section "Compliance Requirements" with specific regulations/audits

- Critical process: Add section "Escalation Path" for when things go wrong



**For your organization:**



- If you use process automation: Add section "Automation Status" showing which steps are automated

- If you track process efficiency: Add section "Target Metrics" (time to complete, error rate)

- If you need approvals: Add explicit approval gates in procedure with role and SLA

- If you do regular reviews: Add "Review History" section showing past changes and why



**For different process types:**



- Customer-facing: Add section "Customer Communication Templates" for key messages

- Data processes: Add section "Data Quality Checks" separate from general quality checks

- Financial processes: Add section "Audit Trail" showing what must be documented

- Security processes: Add section "Security Considerations" with specific controls

- Onboarding processes: Add section "Learning Resources" for new people



**For your failure modes:**



- If SOPs become outdated: Make "Review Schedule" mandatory and specific (e.g., "quarterly review by [role]")

- If wrong SOP gets used: Expand Scope section with clear "Use this when X, use [other SOP] when Y"

- If steps get skipped: Add rationale after critical steps: "Why this matters: skipping this causes [specific problem]"

- If decisions are ambiguous: Add decision matrix table for complex decision points

- If quality issues occur: Expand Quality Checks with specific failure modes and how to detect them



---



## Good Output vs Bad Output



**Bad Output (Generic AI):**



```

SOP: Customer Onboarding Process



Purpose:

This document describes how we onboard new customers.



Steps:

1. Receive customer information

2. Set up their account

3. Configure their settings

4. Send welcome email

5. Schedule kickoff call

6. Follow up as needed



Notes:

- Make sure everything is set up correctly

- Use the standard configuration unless they request otherwise

- Be professional and responsive

- Keep the customer updated throughout the process



```



**Why it's bad:** No scope (when to use this). Vague steps with no specific actions. No decision points. No edge cases. No quality checks. No troubleshooting. Assumes tribal knowledge ("standard configuration"). Can't actually execute this without asking questions.



**Good Output (Using This Prompt):**



```

STANDARD OPERATING PROCEDURE: Enterprise Customer Onboarding

Process Owner: Sarah Chen (Customer Success) | Last Updated: Oct 23, 2024

Review Schedule: Quarterly (next review: Jan 2025)



PURPOSE:

This procedure onboards new Enterprise tier customers (contracts >$50K annual) from signed contract to successful kickoff call, ensuring account configuration matches contractual requirements and customer receives proper training resources.



SCOPE:

USE this SOP for:

- Enterprise tier customers (>$50K annual contract)

- New customers only (not expansions or renewals)

- Standard product configuration (core product + standard integrations)



DO NOT use this SOP for:

- SMB tier customers (<$50K) - use SMB Onboarding SOP instead

- Account expansions - use Account Expansion SOP instead

- Custom deployment contracts - use Custom Deployment SOP instead

- Trial conversions - skip to Step 3 (account already exists)



ROLES & RESPONSIBILITIES:

- Sales Rep: Provides signed contract, customer contact info, custom requirements

- Implementation Specialist: Executes Steps 1-7, owns onboarding through kickoff

- Customer Success Manager: Assigned in Step 4, joins kickoff call

- Technical Support: Available for Step 8 escalation if needed



PREREQUISITES:

Before starting, verify you have:

- Signed contract with effective date and contract value

- Primary customer contact (name, email, title, timezone)

- Customer's technical contact (name, email, for Step 6)

- Access to Salesforce (to create account record)

- Access to admin panel (to provision account)

- Access to project management system (to create onboarding project)



STEP-BY-STEP PROCEDURE:



Step 1: Create Salesforce account record

Action: In Salesforce, create new Account with customer company name, contract value, contract start date, and primary contact info.

Expected outcome: Account record created, account ID generated (format: ACC-XXXXX)

Verification: Salesforce account ID appears in format ACC-XXXXX and is searchable by company name.



Step 2: Provision customer account in product

Action: In admin panel, click "New Enterprise Account", enter company name, account ID from Step 1, and contract effective date.

Expected outcome: Account provisioned with enterprise features enabled, welcome email auto-sent to primary contact.

Verification: Account status shows "Active - Enterprise" and primary contact receives welcome email within 5 minutes.



Step 3: Configure account settings based on contract

Action: Review signed contract for custom requirements. In admin panel > Account Settings:

- IF contract includes SSO → Enable SSO, request customer's IdP metadata in Step 6

- IF contract includes API access → Enable API, generate API key, record in secure doc

- IF contract includes custom user limits → Set seat count to contracted amount

- IF contract includes specific integrations → Enable those integration modules

- IF contract is standard (most common) → Use default Enterprise settings (SSO disabled, 25 seats, standard integrations)

Expected outcome: Account settings match contract terms exactly.

Verification: Screenshot account settings page and compare to contract requirements checklist.



Step 4: Assign Customer Success Manager

Action: In Salesforce, check CSM assignment rules. For accounts >$100K, assign to senior CSM (Sarah or Mike). For accounts $50K-$100K, assign to standard CSM (rotate using round-robin). Add CSM to account team.

Expected outcome: CSM assigned in Salesforce and receives notification.

Verification: CSM name appears in Salesforce Account Team, CSM confirms receipt of notification.



Step 5: Create onboarding project

Action: In project management system, create new project from "Enterprise Onboarding" template. Set customer name, account ID, and target kickoff date (10 business days from contract effective date). Assign to yourself and add CSM.

Expected outcome: Onboarding project created with 15 standard tasks, due dates auto-calculated.

Verification: Project appears in dashboard, CSM receives project invitation.



Step 6: Send technical setup email to customer

Action: Use email template "Enterprise Technical Setup". Customize with:

- Customer name

- Account ID

- Login URL

- IF SSO enabled → Request IdP metadata upload by Step 7 date

- IF API access enabled → Include API key and documentation link

Attach: Enterprise Getting Started Guide PDF

Expected outcome: Technical contact receives email within 1 hour of Step 5.

Verification: Email sent confirmation, no bounce-back within 24 hours.



Step 7: Configure requested integrations

Action: Based on contract and customer's technical setup email response:

- IF Salesforce integration → Request Salesforce admin permission, configure sync settings, test data flow

- IF Slack integration → Request Slack workspace admin permission, install app, test notifications

- IF no integrations OR integration setup pending → Mark Step 7 as "Blocked - awaiting customer" and proceed to Step 8

Expected outcome: Integrations configured and tested OR step marked as blocked with clear next action.

Verification: Test each integration, confirm data flows correctly. OR step status is "Blocked" with clear blocker description.



Step 8: Schedule and conduct kickoff call

Action: Send calendar invite to customer primary contact, technical contact, CSM, and yourself for 60-minute kickoff. Use agenda template "Enterprise Kickoff Agenda".

Agenda: Introductions (5 min), product walkthrough (30 min), integration status review (10 min), training plan (10 min), Q&A (5 min)

Expected outcome: Kickoff call scheduled within 10 business days of contract start, call conducted, notes documented.

Verification: Calendar invite accepted by customer, post-call notes added to project within 24 hours.



EDGE CASES:



Edge Case 1: Customer requests kickoff sooner than 10 business days

IF customer requests kickoff in <5 business days AND all prerequisites are met:

  THEN: Expedite Steps 1-7 (work same-day), schedule kickoff as requested

ELSE IF customer requests kickoff in <5 business days BUT prerequisites NOT met:

  THEN: Explain blockers to customer, propose earliest realistic date, escalate to manager if customer insists



Edge Case 2: Customer has existing account from previous trial/demo

IF account already exists (check by company domain):

  THEN: Skip Step 2, use existing account

  AND: In Step 3, verify trial/demo settings are cleared, upgrade to Enterprise settings

  AND: Verify no conflicting data in account before proceeding



Edge Case 3: Contract includes custom features not in standard Enterprise tier

IF contract includes custom features:

  THEN: After Step 3, create Engineering ticket for custom feature enablement

  AND: Add Engineering to Step 8 kickoff call to explain timeline

  AND: Document custom features in Salesforce notes



Edge Case 4: Customer's technical contact is unresponsive in Step 6

IF no response to technical setup email after 48 hours:

  THEN: Email primary contact asking for introduction to technical contact

  AND IF still no response after another 48 hours: Proceed to Step 8 with note "Integration setup pending customer response"



Edge Case 5: Multiple integrations requested but customer hasn't provided access

IF Step 7 is blocked waiting for customer permissions:

  THEN: Document blockers, send reminder email with specific permissions needed

  AND: Proceed to Step 8 kickoff, address blockers on call

  AND: Create follow-up task for integration completion post-kickoff



QUALITY CHECKS:

After completing the SOP, verify:

- [ ] Salesforce account shows status "Active - Enterprise"

- [ ] Account settings in admin panel match all contract requirements

- [ ] CSM is assigned and has accepted assignment

- [ ] Onboarding project exists with all 15 tasks created

- [ ] Customer received welcome email (check admin panel logs)

- [ ] Customer received technical setup email (check sent mail)

- [ ] All requested integrations are either configured OR documented as blocked

- [ ] Kickoff call is scheduled within 10 business days of contract start

- [ ] Post-kickoff notes are documented in project within 24 hours of call



TROUBLESHOOTING:



Problem: Welcome email not received by customer (Step 2)

→ Check: Admin panel logs - was email sent? If yes but not received, check spam folder

→ Try: Resend welcome email manually from admin panel

→ Still failing? Customer domain may block automated emails - send manual email from your work address



Problem: Account provisioning fails in Step 2

→ Check: Error message in admin panel

→ Try: IF error is "Account limit reached" - contact Engineering to increase account limit

→ Try: IF error is "Invalid company name" - check for special characters, remove and retry

→ Still failing? Screenshot error, escalate to Engineering via Slack #engineering-help channel



Problem: Integration testing fails in Step 7

→ Check: Integration status page - is customer's system accessible?

→ Try: Re-authenticate integration (credentials may have expired)

→ Try: Contact customer technical contact to verify permissions are still granted

→ Still failing? Document error in project, include customer in troubleshooting conversation



Problem: Customer non-responsive throughout onboarding

→ After 3 unanswered emails over 1 week: Escalate to Sales Rep who closed the deal

→ Sales Rep attempts contact via phone

→ IF still no response after Sales Rep escalation: Escalate to your manager + CSM manager for account risk assessment



PROCESS METADATA:

- Process Owner: Sarah Chen (sarah@company.com)

- Created: Jan 15, 2024

- Last Updated: Oct 23, 2024

- Version: 2.3

- Review Schedule: Quarterly (Jan, Apr, Jul, Oct)

- Next Review Date: Jan 15, 2025

- Related SOPs: SMB Onboarding SOP, Account Expansion SOP, Custom Deployment SOP

- Change History: v2.3 (Oct 2024) - Added Edge Case 5 for multiple integrations; v2.2 (Jul 2024) - Updated kickoff call agenda



```



**Why it's good:** Clear scope. Explicit roles. Complete prerequisites. Each step has action and expected outcome. Decision points use IF/THEN format. Edge cases address real scenarios. Quality checks are verifiable. Troubleshooting addresses actual failure modes. Process owner and review schedule specified. Someone unfamiliar can execute this. 1189 words.



---



## Common Mistake: Assuming Tribal Knowledge



**The Problem:**

SOPs include phrases like "configure the settings as usual" or "use the standard process" or "do the normal checks." These assume the reader already knows what "usual," "standard," or "normal" means. New team members or people from other teams can't execute the process.



**Why This Breaks:**

The whole point of an SOP is to enable consistent execution across people with different experience levels. If it only works for people who already know the process, it's not a useful SOP - it's just documentation of what experts already do.



**How This Prompt Prevents It:**



- "DO NOT make steps dependent on tribal knowledge" constraint

- Quality check: "No step relies on 'knowing how we usually do this'"

- Tone: "Assume reader is executing this for the first time"

- Structure: Forces explicit prerequisites, decision points, and edge cases



**The Right Approach:**

Instead of: "Configure the settings as usual"

Write: "In admin panel > Account Settings, set: SSO to Disabled, User seats to 25, Integrations to Standard Enterprise bundle (Salesforce, Slack, API access)"



Instead of: "Do the normal checks"

Write: "Verify: (1) Account status shows 'Active', (2) Welcome email sent (check logs), (3) Customer contact received email (no bounce-back)"



Instead of: "Follow standard timeline"

Write: "Schedule kickoff call 10 business days from contract effective date (to allow time for Steps 1-7)"



Make it explicit. Make it executable. Make it work for someone who's never done this before.

