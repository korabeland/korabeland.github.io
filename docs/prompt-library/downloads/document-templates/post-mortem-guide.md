## Why This Prompt Works (Principle Annotations)



**Principle 1 (Purpose):** "helps the organization learn from this incident" - post-mortems exist to prevent recurrence, not to assign blame. The structure forces learning focus: what happened → why → how to prevent.



**Principle 2 (Structure as Logic):** Summary → Timeline → Root Cause → Impact → What Worked → What Failed → Actions. This is the incident review sequence: "What happened? When exactly? Why did it happen? How bad was it? What worked in our response? What didn't work? What are we fixing?"



**Principle 3 (Constraints):**



- 800 words forces focus on essential learnings

- "Must use actual timestamps" grounds timeline in facts

- "Root cause must go deeper than trigger" prevents shallow analysis

- "Must focus on systems not people" enforces blameless culture

- "Action items must have owner and date" ensures follow-through



**Principle 4 (Self-Evaluation):** Quality checks ensure post-mortem enables learning. "Action items address root cause, not just symptoms" is the key test.



**Principle 5 (Failure Modes):** Addresses how post-mortems typically fail:



- Blame individuals instead of systems

- Surface-level root cause ("the server crashed" vs "we had no circuit breaker")

- Vague impact ("several users affected")

- Timeline without specific times (can't reconstruct events)

- Action items without owners (nothing gets fixed)

- Action items address symptoms not causes



**Principle 6 (Input Quality):**



- "Use actual timestamps from inputs" prevents rounded times

- "Use actual numbers from monitoring" prevents minimizing impact

- "Do not invent timeline events" keeps facts accurate

- Requires monitoring data and logs as inputs



**Principle 7 (Voice):**



- "Factual and learning-oriented"

- "Systems-focused not people-focused"

- "DO NOT blame" / "DO NOT sugarcoat"

Post-mortems need psychological safety (blameless) combined with honesty (no sugarcoating). This voice balances both.



**Principle 9 (Workflow):** "Will be read by people who weren't involved" tells AI this isn't just for the incident team - it's organizational knowledge capture. Therefore context and clarity matter more than insider shorthand.



---



## How to Customize This Prompt



**For your incident management process:**



- If you use incident levels: Add "Severity Level" section with your org's definitions (P0/P1/P2 or SEV1/SEV2/etc)

- If you track SLOs: Add "SLO Impact" section showing which SLOs were breached and by how much

- If you do incident reviews: Add "Review Date" and "Attendees" at top

- If you assign incident commanders: Add "Incident Commander" to Context section



**For your organization culture:**



- If blameless is new: Emphasize in constraints: "Replace any 'X should have' with 'The system lacked Y'"

- If you track action items: Add "Action Item Status" column (Not Started/In Progress/Complete)

- If you need exec visibility: Add "Executive Summary" section at top (3 sentences: what, impact, fix)

- If you do quarterly reviews: Add "Related Incidents" section linking to similar past incidents



**For different incident types:**



- Security incidents: Add sections: "Attack Vector", "Data Exposure", "Remediation Steps", "Compliance Implications"

- Data incidents: Add sections: "Data Affected", "Data Recovery", "Data Quality Impact"

- Performance incidents: Add sections: "Performance Metrics", "Capacity Analysis", "Scaling Response"

- Customer-facing incidents: Add sections: "Customer Communications", "Support Ticket Volume", "Customer Impact by Segment"

- Third-party incidents: Add sections: "Vendor Response", "Vendor SLA Status", "Dependency Risk"



**For your failure modes:**



- If action items don't get done: Add "Review Date" showing when actions will be verified complete

- If root cause is shallow: Add check: "Root cause must answer 'why' at least 3 times" (5 whys technique)

- If impact is minimized: Add constraint: "Impact must include customer quotes or support ticket data"

- If blame creeps in: Add check: "Find/replace check for 'should have', 'forgot to', 'didn't realize'"

- If learning isn't captured: Add section: "Key Learnings" separate from action items



---



## Good Output vs Bad Output



**Bad Output (Generic AI):**



```

Post-Mortem: Website Outage



Summary:

We experienced an outage on Tuesday afternoon that affected some users. The site was slow and some requests failed. The team worked quickly to resolve the issue.



What Happened:

- Traffic increased

- Servers became overloaded

- Some users couldn't access the site

- We restarted servers and things improved



Root Cause:

The servers couldn't handle the increased load. We should have been monitoring this better.



Lessons Learned:

- We need better monitoring

- Capacity planning is important

- Communication could be improved

- We should scale better



Action Items:

- Improve monitoring

- Add more capacity

- Better communication



```



**Why it's bad:** No specific timestamps. Impact not quantified. Timeline is vague. Root cause is shallow. "What went well" missing. Blame language ("should have"). Action items have no owners or deadlines. Can't learn from this or prevent recurrence.



**Good Output (Using This Prompt):**



```

POST-MORTEM: API Gateway Outage - Oct 23, 2024

Severity: P1 Production Outage | Duration: 47 minutes | Team: Platform, SRE



SUMMARY:

API gateway failed at 14:23 UTC on Oct 23, causing complete service outage for 47 minutes. All API requests returned 503 errors. 12,400 active users affected. Estimated revenue impact: $23K (based on avg transaction value × failed requests). Resolved by emergency failover to backup gateway at 15:10 UTC.



TIMELINE (all times UTC):

14:23:45 - Gateway began returning 503 errors (PagerDuty alert fired)

14:24:12 - James (on-call) acknowledged alert, began investigation

14:26:30 - Identified issue: primary gateway AWS instance terminated (root volume full)

14:28:00 - Sarah joined incident, elevated to P1

14:30:15 - Attempted restart of primary gateway - failed (volume still full, can't boot)

14:32:00 - Decision: failover to backup gateway in different AZ

14:35:45 - DNS update initiated to point to backup gateway

14:42:00 - DNS propagation ~50% complete, traffic recovering

14:47:30 - Traffic fully recovered on backup gateway

15:10:00 - Incident declared resolved, monitoring for stability

15:45:00 - Post-incident: cleared primary gateway disk, ready for failback

16:20:00 - Failed back to primary gateway (verified disk space monitoring)



ROOT CAUSE:

Gateway root volume filled to 100% with application logs (no log rotation configured). AWS EC2 terminates instances when root volume reaches 100% capacity. We had no alerting on disk usage for gateway instances. The actual root cause: we treated gateway as stateless but it wrote logs to root volume, and we never configured log rotation or disk monitoring when we moved from container-based to EC2-based deployment 4 months ago.



IMPACT:

- Duration: 47 minutes total outage

- Users affected: 12,400 active sessions at time of outage

- API requests failed: 86,500 requests returned 503 during outage (from CloudWatch)

- Revenue impact: Estimated $23K in lost transactions (based on $0.27 avg transaction value)

- Support tickets: 127 tickets filed during and immediately after outage

- Customer complaints: 34 customers contacted support, 8 escalated to account managers

- SLO breach: 99.9% monthly uptime SLO breached (now at 99.89% for October)



WHAT WENT WELL:

- PagerDuty alert fired within 60 seconds of first 503 error (alerting worked)

- James responded within 90 seconds (on-call response time met SLA)

- Decision to failover made quickly (8 minutes from detection to decision)

- Backup gateway was functional and tested (failover succeeded on first attempt)

- Status page updated within 6 minutes of incident start (customer communication)

- Post-incident disk cleanup completed before failback (prevented immediate recurrence)



WHAT WENT POORLY:

- No disk usage monitoring on gateway instances (gap in observability)

- No log rotation configured on gateway (operational gap from 4 months ago)

- Backup gateway required DNS change (47-minute failover vs seconds with load balancer)

- No runbook for gateway failover (team had to figure it out during incident)

- Root volume size (8GB) too small for application with verbose logging

- Incident not escalated to P0 until 15 minutes in (should have been immediate)



ACTION ITEMS:

1. Add disk usage alerting for all EC2 instances (not just gateway) | OWNER: James | DUE: Oct 28

   - Alert at 70%, 85%, 95% disk usage

   - Test by filling disk on staging instance



2. Configure log rotation on gateway instances (logrotate daily, 7-day retention) | OWNER: Sarah | DUE: Oct 30

   - Apply to all environments (prod, staging, dev)

   - Verify rotation working for 1 week



3. Move gateway logs to CloudWatch Logs instead of local disk | OWNER: James | DUE: Nov 8

   - Eliminates disk dependency

   - Improves log searchability



4. Increase gateway root volume size from 8GB to 20GB | OWNER: Sarah | DUE: Oct 25

   - Provides buffer even if log rotation fails



5. Replace DNS-based failover with load balancer (eliminates 40+ minute DNS propagation) | OWNER: Platform team (Alex lead) | DUE: Nov 15

   - Gateway instances behind ALB

   - Failover in <30 seconds vs 47 minutes



6. Create gateway incident runbook | OWNER: James + Sarah | DUE: Nov 1

   - Document failover procedure

   - Document disk cleanup procedure

   - Add to incident response docs



7. Review all EC2 instances for missing log rotation | OWNER: SRE team (Mike lead) | DUE: Nov 8

   - Audit all instances

   - Configure rotation where missing



```



**Why it's good:** Specific timestamps in timeline. Impact quantified with actual numbers. Root cause goes deeper than "disk full" to explain why disk filled and why we didn't catch it. "What went well" is specific. "What went poorly" critiques systems not people. Action items have owners, specific deliverables, and deadlines. Organization can learn from this and prevent similar incidents. 789 words.



---



## Common Mistake: Blaming People Instead of Systems



**The Problem:**

Post-mortems include language like "John forgot to set up monitoring" or "Sarah should have noticed the disk filling" or "If someone had checked the logs..." This destroys psychological safety and prevents honest incident reports in the future.



**Why This Breaks:**

When people are blamed in post-mortems, teams start hiding incidents, minimizing impact, and covering up mistakes. You get less information about what's actually broken. The organization can't learn if people are afraid to be honest.



**How This Prompt Prevents It:**



- "DO NOT blame: Focus on system failures, not people failures" constraint

- "What went poorly must focus on systems/processes, never individuals"

- Quality check: "No blame language anywhere"

- Quality check: "'What went poorly' critiques systems/processes, never names individuals"

- Tone: "Systems-focused not people-focused"



**The Right Reframe:**

Instead of: "John forgot to set up monitoring"

Write: "We had no disk usage monitoring on gateway instances"



Instead of: "Sarah should have noticed the disk filling"

Write: "We lacked alerting that would have caught this before outage"



Instead of: "If someone had checked the logs..."

Write: "We had no automated log analysis to surface this pattern"



The question isn't "who messed up" - it's "what systemic gap allowed this to happen." Good post-mortems identify the gaps so the organization can fix them.

