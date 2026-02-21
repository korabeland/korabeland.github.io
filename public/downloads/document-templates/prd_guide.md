## Why This Prompt Works (Principle Annotations)



**Principle 1 (Purpose):** "bridges what we're building with how we'll build it" - PRDs exist to align product and engineering, preventing the "that's not what I meant" conversation three weeks into development.



**Principle 2 (Structure as Logic):** What → Why → Success → User Stories → Acceptance → Non-Goals → Constraints → Open Questions. This is the translation sequence: outcome → justification → measurement → user perspective → technical specification → boundaries → engineering context → remaining decisions.



**Principle 3 (Constraints):**



- 800 words forces ruthless prioritization

- "Must be testable" prevents vague requirements

- "Non-Goals as specific as goals" prevents scope expansion

- "DO NOT prescribe solution" respects engineering expertise

- "If requirement isn't explicit, it's an Open Question" prevents assumptions



**Principle 4 (Self-Evaluation):** Quality checks ensure the PRD is actually implementable. "QA can verify pass/fail" is the ultimate test for acceptance criteria.



**Principle 5 (Failure Modes):** Addresses how PRDs typically fail:



- Vague requirements ("improve user experience")

- Missing edge cases (only happy path defined)

- Solution prescribed instead of problem described

- Success criteria that can't be measured at launch

- Scope creep (everything is in scope)

- Unstated technical constraints

- Undocumented open questions that block development



**Principle 6 (Input Quality):**



- "Use only information from input" prevents AI from inventing user needs

- "Do not infer technical constraints" prevents fake performance targets

- Requires user research and technical constraints up front



**Principle 7 (Voice):**



- "Precise and testable, not aspirational"

- "Declarative, not suggestive"

- "Specific about edge cases"

PRDs fail when they're vague or optimistic. This voice prevents that.



**Principle 9 (Workflow):** "Will be referenced during implementation" tells AI this is a working document, not a pitch deck. Engineering will point to specific lines when asking questions, so precision matters more than salesmanship.



---



## How to Customize This Prompt



**For your engineering culture:**



- If eng owns solutions: Keep "DO NOT prescribe solution" strict

- If product specifies approach: Add "Recommended Approach" section with technical suggestions

- If you do mob programming: Add "Pairing Sessions" section with product involvement schedule

- If you do agile sprints: Break user stories into story points with engineering input



**For your product process:**



- If you do design first: Add "Design Resources" section linking to Figma with implementation notes

- If you validate in production: Add "Rollout Plan" with feature flags and A/B test strategy

- If you iterate quickly: Add "V1 vs. V2" section showing phased rollout

- If you need analytics: Add "Instrumentation Requirements" with specific events to track



**For different feature types:**



- API features: Add "API Contract" section with endpoints, methods, request/response formats

- Data features: Add "Data Requirements" with schemas, relationships, migration needs

- Performance features: Make Technical Constraints section more detailed (latency, throughput, resource usage)

- Platform features: Add "Integration Points" showing what systems connect

- Experimental features: Add "Success Thresholds" showing when to kill the experiment



**For your failure modes:**



- If scope expands: Make Non-Goals section 50% length of User Stories

- If edge cases get missed: Add "Error Scenarios" section forcing you to think through failures

- If testing is weak: Add "Test Scenarios" section with specific test cases

- If technical constraints are ignored: Add "Performance Requirements" as separate section with consequences ("If <200ms not met, feature is blocked from launch")

- If open questions linger: Add "Decision Deadline" column and escalation path



---



## Good Output vs Bad Output



**Bad Output (Generic AI):**



```

PRD: Enhanced User Dashboard



Overview:

We want to improve the user dashboard to provide better insights and a more modern experience. Users have been asking for better analytics and more customization options.



Goals:

- Improve user experience

- Add analytics capabilities

- Enable customization

- Increase engagement



Requirements:

- The dashboard should show user activity

- Users should be able to customize their view

- Analytics should be comprehensive

- The interface should be intuitive and modern

- Performance should be good

- It should work on all devices



Success Metrics:

- Increased user satisfaction

- Higher engagement rates

- Positive feedback from users



```



**Why it's bad:** No user stories. No acceptance criteria. Goals aren't measurable. Requirements are vague ("comprehensive analytics" - what does that mean?). No non-goals. No technical constraints. No edge cases. Engineering can't build from this without 20 follow-up questions.



**Good Output (Using This Prompt):**



```

PRD: Dashboard Activity Timeline Feature

Owner: Sarah (PM) | Target: Dec 15 launch | Engineering: James (lead)



WHAT WE'RE BUILDING:

A chronological activity timeline on the user dashboard showing the last 30 days of account activity (logins, profile changes, purchase history, support interactions). Users can filter by activity type and export their activity data as CSV.



WHY NOW:

47% of support tickets (2,400/month) are users asking "Did I change my password?" or "When did I make that purchase?" We're spending $28K/month on support time answering questions users could answer themselves. GDPR and CCPA require we provide user activity data on request - currently manual process taking 2-3 days per request.



SUCCESS CRITERIA:

1. Support tickets asking for activity history: Reduce from 2,400/month to <500/month by Jan 31. Measured via Zendesk ticket categorization.

2. Activity export requests: <100ms generation time for 30-day CSV export. Measured via API monitoring.

3. Data accuracy: 100% of activity logged and visible within 60 seconds of event. Measured via synthetic monitoring + spot checks.



USER STORIES:



US-1: As a user, I want to see my recent login history so that I can verify if there's suspicious account access.

Acceptance Criteria:

- Timeline shows last 50 logins with timestamp, IP address, device type, location (city-level)

- Login events appear in timeline within 60 seconds of login

- User can filter to show only login events

- IP addresses are masked (show first 3 octets only for privacy)

- Failed login attempts shown in red, successful in green



US-2: As a user, I want to see my purchase history so that I can verify past transactions without contacting support.

Acceptance Criteria:

- Timeline shows all purchases in last 30 days with date, amount, item name, status

- Clicking purchase opens detailed view with invoice, payment method, refund status

- User can filter to show only purchase events

- Refunded purchases clearly marked with refund date and amount



US-3: As a user, I want to export my activity data so that I can keep personal records or meet regulatory requirements.

Acceptance Criteria:

- Export button generates CSV file with all activity from last 30 days

- CSV includes: timestamp, event type, event details, IP address, status

- Export completes in <100ms for 30-day data (max 10,000 events)

- User receives download link immediately, no email delay

- CSV format matches GDPR/CCPA data export requirements



US-4: As a user, I want to filter my activity timeline so that I can find specific types of events quickly.

Acceptance Criteria:

- Filter dropdown shows: All, Logins, Purchases, Profile Changes, Support Interactions

- Selecting filter updates timeline in <200ms

- Filter state persists across page refreshes

- Filtered count shows "Showing X of Y events"



US-5: As a support agent, I want to see a user's activity timeline (with permission) so that I can troubleshoot issues without asking for information.

Acceptance Criteria:

- Support agents can view timeline for tickets they own

- Support view shows all activity types, not limited to 30 days (shows last 90 days)

- Support actions are logged in user's timeline ("Support agent viewed your profile")

- Support access requires user's explicit permission (checkbox during ticket creation)



NON-GOALS (What we're NOT building):

- Activity older than 30 days for regular users (support view shows 90 days, but not user-facing)

- Real-time notifications of new activity (future feature)

- Activity comparison between users or benchmarks

- Detailed device fingerprinting beyond device type

- Ability to delete activity (audit trail must be immutable)

- Mobile app version (web only for V1)

- Social features (sharing activity, commenting)

- Admin bulk export of all users' activity (compliance team has separate tool)



TECHNICAL CONSTRAINTS:

- Activity events stored in PostgreSQL activity_log table (already exists, 2M rows/month)

- Query performance: Timeline load must be <200ms at P95 for 10K concurrent users

- Export generation: Must handle up to 10,000 events per user (99th percentile) in <100ms

- Storage: 30-day rolling window means ~60M total rows (2M new/month, 2M purged/month)

- API rate limiting: 10 requests/minute per user for timeline endpoint

- CSV exports served from S3, not generated on-demand (pre-generate nightly for known high-volume users)

- Must work with existing auth system (no new login flow)



OPEN QUESTIONS:

1. Should we show failed password attempts? Could be alarming to users. Decision: Sarah + Security team by Nov 8

2. What's the CSV export size limit? Need infra guidance on S3 costs for large exports. Decision: James + Infrastructure by Nov 10

3. Do we log support agent activity viewing timelines? Privacy implications. Decision: Sarah + Legal by Nov 12

4. Should timeline be real-time or can it have 60-second delay? Impacts engineering approach. Decision: James (technical decision) by Nov 8



```



**Why it's good:** Specific user stories with testable acceptance criteria. Measurable success criteria tied to business impact. Clear non-goals preventing scope creep. Technical constraints with specific numbers. Open questions with owners and deadlines. Engineering can estimate and build from this. 782 words.



---



## Common Mistake: Prescribing the Solution



**The Problem:**

Product managers write "Use Redis for caching" or "Implement with React hooks" in PRDs. This crosses the line from what to build into how to build it, which is engineering's domain.



**Why This Breaks:**

You might be wrong about the solution. Or there's a better approach you don't know about. Or technical constraints make your suggestion impossible. Either way, you've now tied engineering's hands or created conflict.



**How This Prompt Prevents It:**



- "DO NOT prescribe solution" constraint

- Quality check: "No solution prescribed"

- Technical Constraints section gives engineering context without dictating approach

- Open Questions section is where to surface technical unknowns



**The Right Way:**

Instead of "Use Redis for caching to hit <200ms response time," write:



- Technical Constraint: "API response <200ms at P95 under 1000 RPS"

- Open Question: "What caching strategy will hit performance target? Decision: James (Eng Lead) by Nov 8"



This gives engineering the requirement (200ms) and trusts them to pick the solution (maybe it's Redis, maybe it's something better).



**The Hard Truth:**

If you don't trust engineering to pick good solutions, that's a people problem, not a PRD problem. Fix the people problem. Don't use the PRD to micromanage technical decisions.

