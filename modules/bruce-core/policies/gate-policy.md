# Gate Policy

## Gate Thresholds

| Gate | Stage | Threshold | Auto-Pass | Auto-Fail | Borderline Range |
|------|-------|-----------|-----------|-----------|------------------|
| **Post-Screening** | GENERATED→QUALIFIED | 70 | 85+ | <65 | 65-69 |
| **Post-Structuring** | QUALIFIED→STRUCTURED | 75 | 88+ | <70 | 70-74 |
| **Post-Build** | STRUCTURED→BUILT | 70 | 85+ | <65 | 65-69 |
| **Post-Launch** | BUILT→LAUNCHED | 75 | 88+ | <70 | 70-74 |
| **Post-Traction** | LAUNCHED→OPERATING | 80 | 92+ | <75 | 75-79 |

**Opportunity module pre-screening:** The opportunity Temporal workflow can automatically retry analysis and vary discovery seeds until a configurable pass score (`OPPORTUNITY_PASS_SCORE` in `.env`) or a candidate cap — see `modules/opportunity/README.md`. Gate Enforcer still evaluates ventures against this table when invoked; automated screening does not replace human policy for borderline cases.

## Scoring Rules

### Scoring Scale

- **90-100**: Exceptional (best-in-class, no material weaknesses)
- **80-89**: Strong (above average, minor weaknesses acceptable)
- **70-79**: Acceptable (meets threshold, some concerns)
- **60-69**: Below threshold (material weaknesses)
- **<60**: Deficient (significant risks)

### No Grade Inflation

- Gate Enforcer must justify every point on 0-100 scale with specific data
- Cannot award >80 without strong supporting evidence
- Subjective impressions cannot influence score above rubric guidance
- Comparison to prior ventures should inform confidence, not score

### Data Quality Requirements

- All scoring criteria require supporting evidence from module outputs or metrics
- Missing data should reduce score, not be assumed favorably
- Contradictory data should be flagged and scored conservatively
- Data older than policy-specified age reduces score (see below)

### Data Freshness Requirements

| Gate | Data Freshness | Impact if Stale |
|------|----------------|-----------------|
| Post-Screening | <30 days | Reduce score by 5 points |
| Post-Structuring | <14 days | Reduce score by 5 points |
| Post-Build | <7 days | Reduce score by 5 points |
| Post-Launch | <7 days | Reduce score by 10 points |
| Post-Traction | <7 days | Cannot evaluate, escalate |

## Decision Logic

### PASS Decision (Automatic)

**Condition**: Score ≥ Threshold

**Effect**:
- Gate Enforcer outputs PASSED status
- Lifecycle Manager may advance venture (no escalation needed)
- Record decision, emit gate.decision event

**Confidence**: Any confidence level acceptable for PASS (even if low confidence)

### FAIL Decision (Automatic)

**Condition**: Score < Threshold - 5

**Examples**:
- Post-Screening (threshold 70): Score <65 = FAIL
- Post-Traction (threshold 80): Score <75 = FAIL

**Effect**:
- Gate Enforcer outputs FAILED status
- Lifecycle Manager holds venture in current stage
- Emit gate.decision event with failure rationale
- Recommend actions for improvement and retry timeline

**Confidence**: Any confidence level acceptable for FAIL

### BORDERLINE Decision (Escalation Required)

**Condition**: Threshold - 5 ≤ Score < Threshold

**Examples**:
- Post-Screening (threshold 70): Score 65-69 = BORDERLINE
- Post-Traction (threshold 80): Score 75-79 = BORDERLINE

**Effect**:
- Gate Enforcer outputs BORDERLINE status
- MUST set escalation_required = true
- Route to human for judgment review
- Humans can APPROVE (advance) or REJECT (hold)
- SLA: 24 hours for human response
- Default action if no response: HOLD

## Auto-Pass Criteria

For fast-track decisions, ventures can auto-pass if:

**Post-Screening (score ≥85)**:
- Founder has 7+ years relevant startup experience OR prior successful exit
- Problem validated with 10+ customers in paid conversations
- TAM >$500M
- MVP feasible in <12 months

**Post-Structuring (score ≥88)**:
- Business model clearly defined with $X revenue per customer
- 3+ customer acquisition channels identified and tested
- Unit economics projected with defensible assumptions
- Entire founding team identified and committed

**Post-Build (score ≥85)**:
- All core features spec-complete and tested
- Code quality acceptable, basic documentation present
- Landing page and pitch deck finalized
- User testing scheduled with 5+ customers in next 2 weeks

**Post-Launch (score ≥88)**:
- Launch plan executed per timeline
- Initial customers acquired (5+ paying customers)
- Cohort tracking setup ready
- Weekly retention dashboard live

**Post-Traction (score ≥92)**:
- Month 2 retention ≥50%
- CAC-LTV ≥3:1 with sustainable growth path
- Week-over-week growth ≥20% sustained
- Market demand confirmed (50+ inbound inquiries per month)

## Auto-Fail Criteria

For fast-track rejections, ventures auto-fail if:

**Post-Screening (score <65)**:
- Founder has <2 years relevant experience AND no successful exit
- Problem not validated (0-3 customer interviews)
- TAM <$50M
- MVP timeline >18 months with >10-person team

**Post-Structuring (score <70)**:
- Business model unclear (willingness to pay not estimated)
- Only 1 customer acquisition channel identified
- Unit economics projected but with poor assumptions (e.g., $100 CAC for $120 LTV)
- Key team member not committed

**Post-Build (score <65)**:
- <75% of core features complete
- Code has critical bugs preventing user testing
- No customer feedback collected
- No marketing/sales materials

**Post-Launch (score <70)**:
- Launch delayed >2 weeks from plan
- <3 paying customers acquired
- Cohort tracking not configured
- Retention data unclear

**Post-Traction (score <75)**:
- Month 1 retention <40%
- CAC-LTV <2:1
- Week-over-week growth <5%
- Churn rate accelerating

## Escalation Handling

When gate produces BORDERLINE score:

1. **Gate Enforcer**: Output BORDERLINE with escalation_required=true
2. **Lifecycle Manager**: Create escalation request
   - Required approval: Portfolio manager or founder (context-dependent)
   - SLA: 24 hours
   - Context: Score, scoring breakdown, recommendation, confidence notes
3. **Human Review**:
   - Evaluate borderline score in full context
   - Decide APPROVE (treat as PASS) or REJECT (treat as FAIL)
   - Document reasoning
4. **Lifecycle Manager**: Record decision, advance or hold based on approval

## Override Policy

### Who Can Override Gate Decisions

**Can NEVER override**:
- Gate Enforcer scoring (only human can appeal)
- Hard FAIL (score <threshold-5) without re-evaluation
- Hard PASS cannot be downgraded without gate re-run

**Can override with justification**:
- BORDERLINE decision (human judgment)
- Exceptional circumstances (documented post-mortem)

### Override Process

1. Human must document override request with detailed reasoning
2. Portfolio manager and CEO must both approve
3. Decision recorded with "override" flag for audit trail
4. Post-decision review required if gate is overridden

## Multiple Gate Failures

If a venture fails same gate ≥2 consecutive times:

1. Gate Enforcer flags as "repeated failure"
2. Lifecycle Manager escalates to Governance Agent
3. Governance Agent reviews pattern:
   - If failures improve between attempts → Recommend ITERATE
   - If failures worsen or plateau → Recommend PAUSE or KILL
   - If unresolvable issue → Recommend KILL
4. Governance decision binds next steps

## Gate Waiver Conditions

Gates can be waived only under these conditions:

1. **Regulatory requirement**: External mandates (e.g., compliance filing required before traction gate)
2. **Strategic initiative**: Board-approved special program (e.g., corporate partnership requires non-standard timeline)
3. **Acquisition/merger**: Different entity joining portfolio with existing traction

Waivers must be:
- Approved by Portfolio Manager + CEO
- Documented with waiver record
- Reviewed in quarterly governance retrospective
- NOT used more than once per 20-venture cohort

## Gate Re-evaluation

If a venture fails a gate, when can it re-take?

| Gate | Minimum Interval | Trigger for Re-eval |
|------|------------------|-------------------|
| Post-Screening | 2 weeks | Founder address all feedback |
| Post-Structuring | 4 weeks | Business model revised |
| Post-Build | 2 weeks | MVP features added |
| Post-Launch | 4 weeks | Launch execution continues |
| Post-Traction | 6 weeks | Cohort matures 30+ days |

## Scoring Consistency

To ensure consistent gate scoring across ventures:

1. **Use rubric**: Apply scoring guide from gate SKILL.md exactly
2. **Calibration reviews**: Monthly review of gate scorings to identify drift
3. **No hindsight bias**: Score based on data available at gate time, not future outcomes
4. **Peer review**: High-value or borderline gates reviewed by second evaluator
5. **Blind scoring**: When possible, score ventures without knowing founder/investor names

## Exceptions & Special Cases

### Founders in Tough Markets

If problem is real but market is tough (e.g., biotech with long timelines):

- Do NOT lower post-screening threshold
- Accept longer stage SLAs (e.g., BUILT stage can be 24 months instead of 14)
- Adjust gate criteria to match market (e.g., post-traction gate measures clinical validation, not revenue)

### Second-Time Founders

If founder previously founded venture (successful or not):

- Do NOT give credit for startup experience if first venture failed and lessons not evident
- DO give credit for learning from failure if clearly applied to new venture

### Internal/Corporate Initiatives

If venture is internal corporate initiative or acquisition:

- Apply same gate thresholds
- Ensure objective scoring despite relationship
- Escalate if scoring conflicts with political pressure

## Policy Review

This gate policy should be reviewed:

- **Quarterly**: Assess whether thresholds are calibrated correctly (are we passing/failing at right rates?)
- **Annually**: Comprehensive review of gate criteria, weightings, and data freshness requirements
- **After major failure**: If venture fails unexpectedly post-gate, review whether gate was calibrated

Last reviewed: 2026-04-05
Next review: 2026-07-05
