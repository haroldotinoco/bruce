# Quality Policy for Venture Dossiers

## Overview
This policy defines quality standards for completed venture dossiers and governs iteration, approval, and escalation decisions.

## Quality Dimensions & Scoring

### Dimension 1: Market Clarity (Weight: 20%)
- Clear TAM/SAM/SOM analysis grounded in data
- Market timing and urgency well-articulated
- Regulatory/macro context compelling
- Growth trajectory documented
**Minimum acceptable score: 65 (per dimension)**

### Dimension 2: Customer Evidence (Weight: 20%)
- ICP narrowly defined and specific
- Customer pain/JTBD well-understood
- Willingness-to-pay documented with rationale
- Decision-maker mapping clear
**Minimum acceptable score: 65**

### Dimension 3: Model Soundness (Weight: 20%)
- Unit economics grounded in real data
- CAC/LTV assumptions justified
- Break-even timeline realistic
- Three scenarios modeled with consistent methodology
**Minimum acceptable score: 65**

### Dimension 4: GTM Realism (Weight: 15%)
- ICP addressable and reachable
- 90-day plan executable with identified resources
- Channel strategy grounded in Vol 2/Vol 4
- Budget allocation realistic
**Minimum acceptable score: 65**

### Dimension 5: Risk Awareness (Weight: 15%)
- Critical assumptions identified (minimum 10)
- Kill criteria clear and measurable (minimum 3)
- Validation roadmap realistic
- High-impact risks mitigated
**Minimum acceptable score: 65**

### Dimension 6: Narrative Quality (Weight: 10%)
- Brand narrative compelling and grounded
- Positioning differentiated vs. competitors
- Messaging pillars consistent across volumes
- Stakeholder narratives appropriately tailored
**Minimum acceptable score: 65**

## Overall Scoring & Recommendation Logic

### Score Interpretation
- **Overall Score 70-100**: PASS → Approve for dossier composition
- **Overall Score 60-69**: ITERATE → Identify weak volumes (score <65), re-run, recriticize
- **Overall Score <60**: REJECT → Insufficient foundation, escalate or archive

### Weak Volume Definition
- Any volume scoring below 65 is flagged for iteration
- Weak volumes identified by venture-critic agent
- Re-run is focused: only weak volumes re-executed, not full pipeline

## Iteration Rules

**Related (Opportunity module):** automated screening in `@bruce/app-opportunity` uses env-driven thresholds (`OPPORTUNITY_PASS_SCORE`, retries, and new-candidate caps) before opportunities reach AddVenture structuring. See `modules/opportunity/README.md` (“Quality gate and retries”) and `.env.example`. That loop is independent of per-volume iteration below but follows the same idea: iterate until a cut score or cap.

### Iteration Limits
- **Maximum 3 iterations per venture** (if overall score hasn't reached 70 after 3 attempts, reject)
- **Per-iteration time limit**: 5 hours maximum
- **Volume timeout**: 5 minutes per volume execution (hard limit)

### Iteration Process
1. Venture-critic identifies weak volumes (score <65)
2. Iteration controller re-runs only weak volumes (not full pipeline)
3. Updated volumes pass back to venture-critic for re-scoring
4. If score >= 70 after iteration, proceed to composition
5. If score 60-69 after iteration, loop back to step 1
6. If iteration limit exceeded OR score < 60, reject venture

### Iteration Decision Tree
```
Post-Critique Score
├─ >= 70: PASS
├─ 60-69, iteration_count < 3: ITERATE (re-run weak volumes)
│  └─ New Score >= 70: PASS (proceed to composition)
│  └─ New Score 60-69, iteration_count < 3: ITERATE AGAIN
│  └─ New Score < 60 or iteration_count >= 3: REJECT
└─ < 60: REJECT (escalate or archive)
```

## Quality Gates

### Pre-Structuring Gate
- Opportunity score must be 75+ (enforced before advancing to add-venture module)
- Briefing must be 90%+ complete (all sections populated)

### Post-Briefing Gate
- Briefing quality score > 75 required to proceed to volumes
- If < 75: Sent back to briefing-interpreter for rework

### Post-Each-Volume Gate (During Composition)
- Volume confidence score must be > 50 minimum
- Volume < 50 confidence: Flag for re-run before critique

### Pre-Critique Gate
- All 8 volumes completed with confidence > 50
- No volume has null/empty required fields
- Total word count target: 15,000-19,000 words

### Post-Critique Gate
- Overall score >= 70: Proceed to dossier composition
- Overall score 60-69: Iteration triggered (max 3 times)
- Overall score < 60 after max iterations: Reject and escalate

## Failure & Rejection

### Auto-Reject Conditions
1. After 3 iterations, overall score remains < 60
2. Volume execution timeout (> 5 min per volume, twice)
3. Fundamental execution error (volumes contradict each other)
4. New information reveals opportunity no longer viable
5. Capital requirement exceeds portfolio allocation

### Rejection Process
- Status = "rejected"
- Dossier archived with failure reason documented
- Logged for portfolio learning
- Not reconsidered without major new information

## Escalation Rules

### Escalate to Portfolio Leadership When
1. **Score 60-69 after max 3 iterations**: Leadership manual review for go/no-go decision
2. **Score 70+ but foundational assumption weakness revealed**: Request validation strategy review
3. **Venture requires founding team not yet identified**: Escalate for team sourcing decision
4. **Capital requirement exceeds portfolio allocation**: Board approval required

## Performance Tracking

### Metrics Monitored
- **Dossier completion rate**: % of advancing opportunities that complete structured dossier
- **Iteration rate**: % requiring 2+ iterations (target: <20% on second iteration)
- **Average dossier score**: Should trend toward 75-85 over time
- **Time-to-completion**: Target 8 minutes per venture (no iterations)
- **First-pass pass rate**: % scoring 70+ on initial critique

### Quality Trends
- Monthly dashboard: completion rate, iteration rate, average score
- Flag if iteration rate > 30% (indicates weak opportunity funnel)
- Flag if average score trending < 70 (indicates quality slipping)

## Volume-Specific Quality Targets

### Vol 1: Opportunity Diagnosis
- **Minimum score**: 65
- **Quality criteria**: Thesis clear, TAM validated, macro context compelling
- **Common weaknesses**: Speculative TAM, insufficient macro context, weak opportunity thesis

### Vol 2: Customer & Market Architecture
- **Minimum score**: 65
- **Quality criteria**: ICP narrow, JTBD clear, willingness-to-pay justified
- **Common weaknesses**: ICP too broad, JTBD speculative, no willingness-to-pay data

### Vol 3: Value Proposition
- **Minimum score**: 65
- **Quality criteria**: Clear positioning, differentiated vs. competitors, grounded in Vol 2
- **Common weaknesses**: Generic positioning, unsupported differentiation, feature-led (not customer-focused)

### Vol 4: Business Model
- **Minimum score**: 65
- **Quality criteria**: Unit economics grounded, CAC/LTV justified, break-even realistic
- **Common weaknesses**: Optimistic CAC, unsupported LTV assumptions, unrealistic scenarios

### Vol 5: Go-to-Market
- **Minimum score**: 65
- **Quality criteria**: ICP reachable, channels prioritized, 90-day plan executable
- **Common weaknesses**: ICP too large, channels not validated, 90-day plan heroic

### Vol 6: Narrative
- **Minimum score**: 65
- **Quality criteria**: Narrative grounded, positioning distinct, messaging consistent
- **Common weaknesses**: Generic brand story, unclear positioning, messaging contradictions

### Vol 7: Risk & Validation
- **Minimum score**: 65
- **Quality criteria**: 10+ assumptions identified, kill criteria measurable, validation realistic
- **Common weaknesses**: Assumptions not identified, kill criteria vague, validation roadmap infeasible

### Vol 8: Execution Roadmap
- **Minimum score**: 65
- **Quality criteria**: Phases clear, milestones specific, resources realistic
- **Common weaknesses**: Heroic hiring assumptions, vague milestones, unrealistic timeline

## Dossier Completion

### Completion Criteria
- All 8 volumes completed with confidence > 50
- Critique overall score >= 70
- Final dossier assembled by dossier-composer agent
- Status = "approved"

### Dossier Archive
- Path: `/portfolio/ventures/{venture_id}/`
- Contains: briefing.json, vol_1.json through vol_8.json, critique_result.json, final_dossier.json
- Versioning: Each iteration timestamped
- Retention: Permanent

### Downstream Distribution
- Approved dossiers sent to brand-aid module (narrative + positioning)
- Approved dossiers sent to builder module (execution roadmap + resource requirements)
- Rejected/escalated dossiers reviewed by portfolio leadership
