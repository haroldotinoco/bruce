# Brand Quality Policy

## Minimum Quality Standards

### Overall Critique Score
- **Passing threshold**: 75/100 or higher
- **Rejecting threshold**: Below 75/100 triggers iteration
- **Escalation threshold**: Below 60/100 escalates for strategic review

### Dimension Requirements
All dimensions must score ≥ 70:
- Strategic Alignment: ≥ 70
- Distinctiveness: ≥ 70
- Visual Coherence: ≥ 70
- Naming Quality: ≥ 70

**Exception**: A single dimension may score 65-69 if overall score is ≥ 78 AND other dimensions compensate.

## Iteration Limits

- **Maximum iterations per pipeline run**: 3 cycles
- **Maximum iterations before escalation**: 2 complete pipeline re-runs (6 total agent executions)
- **After 2 complete iterations**: Escalate to strategic review; do not continue iteration

## Iteration Triggers

Automatically trigger iteration if:
1. Overall score < 75
2. Any dimension scores < 70
3. Logo at any scale (16px, 64px, 256px) is unreadable
4. Brand name domain is unavailable (except premium .com with available .io alternative)
5. Trademark risk is flagged as "High"

## Auto-Escalation Criteria

Escalate immediately if:
- Strategic position is contradicted by visual/naming output
- Logo is not distinctive vs. competitor logos
- Brand name conflicts with existing trademark
- Critical accessibility violation (contrast ratio < 4.5:1 for primary text)
- Visual system not implementable (colors too similar, typography insufficient scales)

## Quality Gate Responsibilities

- **brand-critic**: Authoritative quality gate; all scores must be approved before proceeding
- **brand-book-composer**: Will refuse composition if critique score < 75
- **Pipeline manager**: Enforces iteration limits; escalates after 2 complete cycles

## Success Definition

Brand identity is complete when:
1. Critique score ≥ 75 with no dimension < 70
2. All artifacts are documented in brand book
3. Design tokens are implementation-ready (validated JSON, CSS)
4. Logo works at all required scales (16px minimum)
5. Domain and trademark conflicts resolved
6. Client approval obtained (if applicable)
