# Portfolio Resource Allocation Policy

## Overview

This policy governs how budget, headcount, and tools are allocated across the venture portfolio. It ensures efficient resource use, prevents concentration risk, maintains minimum viable allocations, and enables reallocation to maximize overall portfolio impact.

---

## Allocation Components

Each venture receives allocation in three dimensions:

### 1. Budget (Monthly Cash)
- Covers: Operational costs, contractor/freelancer work, marketing spend
- Units: USD per calendar month
- Minimum: $2,000/month per active venture (covers infrastructure, basic tools, minimal team support)
- Maximum: Determined by portfolio capacity (typically $50k-$100k per venture at growth stage)

### 2. Headcount (FTE)
- Covers: Full-time team members (founders, employees)
- Units: Full-time equivalents (FTE), can include fractional allocations
- Minimum: 0.5 FTE (founder + part-time support)
- Maximum: No hard cap; determined by role requirements and portfolio constraints

### 3. Tools & Infrastructure Budget
- Covers: Software subscriptions, cloud infrastructure, services
- Units: USD per calendar month
- Typical: 5-15% of operational budget
- Defaults: $200-$500/month per venture depending on stage

---

## Concentration Limits

### Max Single Venture
- **No venture may consume > 40% of total monthly portfolio budget**
- Rationale: Prevents over-reliance on single venture; enables portfolio resilience
- Enforcement: Automatic flagging if any venture breach this threshold

### Top 3 Ventures
- **Top 3 ventures combined may not exceed 70% of portfolio budget**
- Rationale: Ensures resource spread across portfolio
- Exception: If one venture is being scaled aggressively, can temporarily reach 75% for 2 review cycles

### Minimum Allocation Obligations
- **Every active venture in portfolio must receive >= $2,000/month**
- Rationale: Ensures core infrastructure, tools, and basic team support
- Exceptions:
  - Ventures in final shutdown phase (reallocate immediately post-kill)
  - Ventures in temporary pause mode (skeleton crew budget applies)

---

## Minimum Viable Allocations by Stage

| Stage | Monthly Budget | Headcount | Tools Budget | Notes |
|-------|---|---|---|---|
| **Ideation** | $3,000 | 0.5 FTE | $300 | Founder + part-time support |
| **Pre-Launch** | $5,000 | 1.0 FTE | $500 | Dedicated founder/lead; product prep |
| **Launch** | $8,000 | 1.5 FTE | $800 | Founder + 1 builder; basic GTM |
| **Growth** | $15,000 | 2.5 FTE | $1,200 | Core team + 1 specialist; active GTM |
| **Scale** | $30,000+ | 4+ FTE | $2,000+ | Full team; aggressive growth budget |
| **Mature** | Variable | Variable | $1,500+ | Self-sustaining; optimization focus |

---

## Budget Reallocation Triggers

Reallocation evaluations happen:

### Automatic (No Approval Needed)
1. **Venture killed or paused**
   - Budget released back to portfolio pool
   - Reallocation to pending ventures within 1 week

2. **Stage transition** (e.g., launch → growth)
   - Increase to stage-appropriate allocation
   - Notification to venture and finance within 48 hours

### Requiring Approval
1. **Any single allocation increase > 20% of current budget**
   - Approval: Portfolio lead (async via decision workflow)
   - Timeline: 48 hours

2. **Any single allocation decrease > 30% of current budget**
   - Approval: Portfolio lead + venture founder (notification/consensus)
   - Timeline: 5 business days (allows for transition plan)

3. **Concentration risk mitigation**
   - If any venture exceeds 40%, auto-decrease to 38% threshold
   - Excess reallocated to portfolio pool
   - Advance notification: 2 weeks

---

## Resource Sharing Rules

### Shared Infrastructure (No Duplicate Allocation)
Ventures **may NOT allocate separate budgets** for:
- Cloud infrastructure (shared AWS/GCP accounts managed by bruce-ops)
- Basic legal/compliance (managed at portfolio level)
- Finance/accounting tools (portfolio-level licenses)
- Core HR systems

**Cost Model**: Portfolio overhead charged once at module level; ventures pay pro-rata share through budget ceiling adjustment.

### Shared Talent (Fractional Allocation)
- Specialized skills (e.g., DevOps, Data, Legal) may be shared across ventures
- Allocation tracking: FTE split proportionally across ventures
- Example: 1 DevOps engineer = 0.3 FTE to Venture A, 0.4 FTE to Venture B, 0.3 FTE to Venture C

### Tools Efficiency
- License sharing encouraged (e.g., single GitHub team account across ventures)
- Cost basis: Purchase centrally under portfolio; allocate to ventures by usage
- Audit: Quarterly review of unused licenses; reallocate savings

---

## Allocation Decision Process

### Step 1: Collection (Allocation-Agent)
- Gather: Current allocations, venture metrics, market opportunities
- Timeline: 24 hours

### Step 2: Analysis (Allocation-Agent)
- Calculate: Recommendations based on health scores, growth potential, burn rate
- Optimize: Maximize portfolio impact per dollar
- Constraint satisfaction: Concentration, minimums, stage-appropriate
- Timeline: 24 hours

### Step 3: Human Review Gate
- Review major changes (> 20% for any venture)
- Confirm concentration constraints
- Validate against business priorities
- Timeline: 24 hours

### Step 4: Execution (Bruce-Core)
- Emit allocation changes
- Update venture budgets in financial systems
- Timeline: Real-time

### Total SLA
Allocation decisions completed and executed within 72 hours of portfolio review cycle trigger.

---

## Headcount Allocation

### FTE Sourcing
- **Founder time**: Allocated at 1.0 FTE minimum
- **Employees**: Allocated based on role and compensation
- **Contractors**: Allocated based on contractual hours / 2,080 annual hours
- **Shared roles**: Split proportionally across ventures

### Role Mapping to Allocation
- Founder (100% time): 1.0 FTE to venture
- Full-time employee: 1.0 FTE
- Part-time employee (50%): 0.5 FTE
- 10-hour/week contractor: 0.25 FTE
- Advisor (5 hours/month): 0.01 FTE

### Headcount Rebalancing
- Evaluated every 2 review cycles
- Founders may not be reallocated without their consent
- Employees may be offered to other ventures if original venture needs are met
- Contract labor can be reallocated immediately

---

## Pause Mode Allocation

When a venture is **paused** (external blocker, temporary):

### Skeleton Crew Budget
- **Founders**: 0.5 FTE (light weekly sync)
- **Infrastructure engineer**: 0.25 FTE (keep systems running)
- **Budget**: 30% of normal allocation
- **Duration**: 30-90 days (explicit in pause decision)

### Re-Allocation Rules
- Freed budget returns to portfolio pool
- On pause exit (blocker resolved): Return to normal allocation within 1 week
- On pause expiry → Kill: Archive state, reallocate all resources

---

## Tools & Infrastructure Efficiency

### Tools Budget Benchmarks (Monthly)
| Tool Category | Startup Stage | Growth Stage | Scale Stage |
|---|---|---|---|
| **Development** (IDEs, repos, CI/CD) | $50-150 | $200-400 | $400-800 |
| **Analytics** (product, web, BI) | $50-200 | $200-500 | $500-1500 |
| **Cloud Infrastructure** | $100-500 | $500-2000 | $2000-5000 |
| **Business Tools** (CRM, spreadsheets, docs) | $50-150 | $100-300 | $200-500 |
| **Communication** (Slack, video, email) | $50-100 | $100-200 | $200-400 |
| **Legal/Compliance** | $0-100 | $0-200 | $200-500 |
| **Other/Misc** | $50-100 | $100-300 | $300-1000 |

### Audit
- Quarterly: Review all tools allocations
- Identify: Unused licenses, redundant tools, better alternatives
- Reallocate: Savings to ventures or portfolio pool

---

## Allocation Impact on Decisions

### How Allocation Informs Governance Decisions
1. **SCALE decision**: Allocate proportionally to projected growth (e.g., 2x revenue growth → 1.5x allocation increase)
2. **ITERATE decision**: Allocate modest increase (10-20%) to support pivot/experiment
3. **PAUSE decision**: Cut to skeleton crew allocation (30% of normal)
4. **KILL decision**: Reallocate 100% of budget to other ventures
5. **CONTINUE decision**: Maintain allocation; no change

### Allocation Constraints on Scale Decisions
- Cannot scale a venture that would breach 40% concentration limit
- Unless another venture is simultaneously de-allocated

---

## Budget Transparency & Reporting

### Monthly Reporting
- Each venture sees its own allocation
- Portfolio summary: All allocations + concentration metrics
- Forecast: Projected allocations 2 months ahead

### Escalation
- Allocation decreases > 30%: Requires founder notification 2 weeks in advance
- Allocation increases: Can be auto-executed if < 20% and within concentration constraints

---

## Reallocation to Portfolio Overhead

Savings from paused or killed ventures may be reallocated to:
1. **Portfolio module operations** (portfolio-analyst, risk-monitor, governance-decision-agent infrastructure)
2. **Shared services** (legal, finance, HR, ops)
3. **New venture funding** (pool for emerging opportunities)

Allocation: Decided by portfolio lead + finance lead within 1 week of reallocation event.

---

## Revision History
- **2026-04-06**: Initial version
