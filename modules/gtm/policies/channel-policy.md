# GTM Channel Policy

## Channel Evaluation Criteria

### Core Evaluation Dimensions

Every channel is evaluated across these dimensions during strategy definition and ongoing review:

#### 1. Customer Acquisition Cost (CAC) Target

**Target CAC Benchmarks by Business Model:**

| Business Model | Target CAC | Max Acceptable | Minimum LTV/CAC |
|---|---|---|---|
| B2B SaaS ($5K+/year) | $300-800 | $1,500 | 3.0x |
| B2B SaaS (<$5K/year) | $50-200 | $400 | 3.0x |
| B2C SaaS | $20-50 | $100 | 4.0x |
| Enterprise (>$100K/year) | $2,000-5,000 | $10,000 | 3.0x |

**Rule:** If a channel's measured CAC exceeds 2x the target after 2 consecutive weeks, flag for review.

**Action:** If CAC remains above target for 4 consecutive weeks, trigger rebalancing analysis.

#### 2. Volume Potential

**Definition:** Maximum addressable customer volume the channel can deliver

**Categories:**

| Potential | Monthly Leads | Typical Channels |
|---|---|---|
| High (>500) | >500 | Paid search, paid social, content marketing |
| Medium (100-500) | 100-500 | Email, organic social, partnerships |
| Low (<100) | <100 | Direct sales, influencer, events |

**Rule:** Channels must have minimum medium volume potential to qualify for active spend (unless strategic fit overrides).

#### 3. Brand Fit Score

**Evaluation (0-10 scale):**
- 9-10: Perfect alignment with brand positioning
- 7-8: Strong alignment with minor tweaks
- 5-6: Moderate alignment with content/messaging adjustments
- 3-4: Challenging fit; requires careful execution
- 0-2: Poor fit; not recommended

**Requirement:** Minimum brand fit score of 5 to activate channel.

---

## Channel Activation & Budget Rules

### Minimum Budget Per Channel

**Active Channels (Minimum Monthly Spend):**
- Paid channels (paid search, paid social): **$500/month minimum**
- Earned/organic channels: **No minimum** (only resource cost)
- Direct sales: **No minimum** (only staffing cost)

**Rationale:** Paid channels below $500/month generate insufficient data for meaningful optimization.

**Exception:** Test phase allows $200-500/month for new channel testing (max 4 weeks).

### Maximum Channels Active Simultaneously

**Hard Cap:** **4 channels maximum** per venture

**Rationale:**
- Focus limited resources on winning channels
- Avoid thin spreading of budget across too many channels
- Simplify content production and management

**Exception:** Can activate 5th channel if existing 4 are all >target CAC with strong growth.

### Budget Allocation Rules

**Primary Rule:** No single channel >60% of total budget

**Rationale:** Avoid over-dependence on single channel

**Recommended Distribution:**
- Dominant channel (best performer): 30-45%
- Secondary channel (strong performer): 20-35%
- Tertiary channel (growth/test): 10-20%
- Experimental channel: 5-15%

**Rebalancing Trigger:** Any channel reaching 60% of budget → Automatically flag for rebalancing.

---

## Channel Kill Threshold

### Automatic Kill Criteria

**Rule 1: CAC Threshold**
- If channel's measured CAC > 2x target CAC **for 4 consecutive weeks**, initiate kill review
- **Action:** Kill channel if CAC remains >2x target after 5th week

**Rule 2: Volume Threshold**
- If channel delivers <50% of expected volume for 3 consecutive weeks, flag for review
- **Action:** Kill if volume remains <50% for 4th week without clear explanation (seasonality, etc.)

**Rule 3: Quality Threshold (Activation Rate)**
- If channel's activation rate (signup → activated) < 20% for 2 consecutive weeks, flag
- **Action:** Kill if remains <20% for 3rd week (indicates wrong audience targeting)

**Rule 4: ROAS Threshold (If E-commerce)**
- If return on ad spend (ROAS) < 2.0x for 3 consecutive weeks, flag for review
- **Action:** Kill if remains <2.0x for 4th week

### Manual Kill Criteria

Portfolio leadership can manually kill a channel with written justification:
- Strategic shift requiring channel removal
- Brand risk or reputational concerns
- Resource constraints requiring focus
- Better opportunities requiring budget reallocation

**Documentation Required:** Written explanation of kill decision with data supporting rationale.

### Kill Process

1. **Flag for Review** (when threshold triggered)
2. **Notify stakeholders** (channel manager, leadership)
3. **Decision Period** (3-5 days for analysis)
4. **Kill Decision** (automatic if threshold sustained, or leadership review if borderline)
5. **Windown Period** (pause spending, collect final data, extract learning)
6. **Archive** (store performance data and learnings for future reference)

**Budget Reallocation:** When channel killed, freed budget reallocated per rebalancing policy.

---

## Channel Priority Framework

### Tier 1 (Core Channels)

**Definition:** Channels that consistently deliver predictable CAC near or below target

**Examples:** Typically paid search and organic search for B2B

**Treatment:**
- Minimum funding: Fully funded year-round
- Scaling: Increase budget if performance supports
- Measurement: Daily/weekly performance review

### Tier 2 (Growing Channels)

**Definition:** Channels showing promise (CAC approaching target, growing volume)

**Examples:** Paid social, early-stage partnerships, email

**Treatment:**
- Funding: Budget conditional on performance improvement
- Review cadence: Weekly
- Scaling: Automatic if CAC <1.5x target for 2+ weeks

### Tier 3 (Test Channels)

**Definition:** New channels in testing phase or low-volume experimental channels

**Treatment:**
- Budget: Capped at 5-15% of total spend
- Duration: 4-week test minimum, 8-week maximum before decision
- Decision: Promote to Tier 2, maintain as Tier 3, or kill

---

## Channel Rebalancing

### Trigger Conditions

**Automatic triggers for rebalancing analysis:**
1. Any channel hits 60% of total budget
2. Top 2 channels combined >70% of budget
3. Channel CAC doubles within a single week (sudden quality drop)
4. New channel demonstrates >30% lower CAC than existing channels
5. Quarterly review (standard cadence)

### Rebalancing Process

1. **Analyze performance** by channel (CAC, volume, activation rate, ROAS)
2. **Identify underperformers** (CAC >1.5x target) and overperformers (CAC <0.8x target)
3. **Propose reallocation:** Reduce spend on underperformers, increase on overperformers
4. **Implement gradually:** Don't cut underperformers >20% in single week (avoid overshooting)
5. **Monitor for 2 weeks:** Ensure rebalancing achieves intended improvement
6. **Document learning:** What changed? Why did rebalancing work/not work?

---

## Seasonal & Market Adjustments

### Seasonal Spending Adjustments

**Rule:** Channels may deviate from target allocation during seasonality if:
1. Historical data supports seasonality pattern (>2 years history)
2. Budget rebalancing returns to normal in off-season
3. Multi-channel approach maintained (no single channel >70% even seasonally)

**Example:** E-commerce venture increasing paid social to 55% in Q4 (holiday season) is acceptable if returns to 35% in Q1.

### Market Condition Adjustments

**Soft Policy:** During market downturns, may temporarily relax CAC targets or kill thresholds:
- CAC target can increase by 25% for 4-week period
- Kill threshold extended by 2 weeks if overall market volume declining
- Duration: Tied to documented market condition (e.g., recession declaration, competitor price war)

**Requirement:** Any adjustment must be documented with external data supporting market shift.

---

## Compliance & Oversight

### Weekly Channel Review

Every Monday, review:
1. CAC vs. target for each active channel
2. Volume trends (are we hitting signup targets?)
3. Activation rates (is audience quality steady?)
4. Any kill-threshold triggers
5. Pending rebalancing decisions

### Monthly Channel Report

First Friday of each month:
- Channel performance summary (CAC, volume, ROAS/LTV)
- Cumulative year-to-date metrics
- Any channels reaching kill review triggers
- Rebalancing analysis if needed

### Quarterly Strategic Review

First week of quarter:
- Review channel portfolio alignment with strategy
- Evaluate new channel opportunities
- Tier 3 (test) channel promotion/kill decisions
- Multi-year channel performance trends

---

## Exception & Override

### Policy Exception

Channel policy can be overridden by portfolio leadership with written justification:
- Maintaining strategic channel despite CAC concerns (e.g., brand awareness channel)
- Testing new channel concept outside normal constraints
- Temporary reallocation due to enterprise customer needs

**Requirement:** Written exception request with business rationale and expected duration.

### Kill Decision Appeal

If a channel is automatically flagged for killing, stakeholder can appeal with:
- Data showing recent improvement trends
- External factor explanation (seasonality, market shift)
- Strategic importance justification

**Appeal Process:** 48-hour window after kill flag, reviewed by portfolio leadership.

---

## Glossary

- **CAC:** Cost to acquire one customer
- **LTV:** Lifetime value of customer
- **ROAS:** Return on ad spend (revenue / spend)
- **Activation Rate:** % of signups who become active users
- **Brand Fit:** Alignment between channel audience and brand positioning
- **Rebalancing:** Shifting budget allocation between channels based on performance
