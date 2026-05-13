# GTM Module Metrics

## Key Performance Indicators by Channel

### Universal Metrics (All Channels)

**Cost Per Acquisition (CAC)**
- Definition: Total spend / new customers acquired
- Target: Varies by model (see channel-policy.md)
- Review cadence: Daily for paid channels, weekly for organic
- Alert: If > 1.5x target for 2+ weeks, flag for analysis

**Conversion Rate**
- Definition: Signups / visitors to channel
- Target: 2-5% (varies by channel and business model)
- Review cadence: Weekly
- Alert: If drops >20% from baseline

**Activation Rate**
- Definition: Activated users / new signups
- Target: 50%+ (varies by product)
- Review cadence: Weekly
- Alert: If < 30% for 2+ consecutive weeks

**Customer Lifetime Value (LTV)**
- Definition: Total revenue per customer / acquisition count
- Target: 3x+ CAC (break-even and above)
- Review cadence: Monthly (quarterly for early-stage)
- Alert: If LTV/CAC ratio < 2.5x

**Return on Ad Spend (ROAS)**
- Definition: Revenue generated / ad spend
- Target: >2.0x (varies by margin and model)
- Review cadence: Weekly for paid channels
- Alert: If < 1.5x for 2+ weeks

### Channel-Specific Metrics

**Paid Search**
- Cost per click (CPC)
- Click-through rate (CTR): Target 3-7%
- Quality score: Target 7+/10
- Conversion rate: Target 2-5%

**Paid Social**
- Cost per click: Target $0.20-2.00 (platform/audience dependent)
- CTR: Target 0.5-2%
- Cost per lead: Target per channel
- Video view rate: 25%+ for video ads

**Content Marketing**
- Organic traffic: Month-over-month growth
- Content engagement: Time on page (target 2+ minutes)
- Lead quality: % of content leads that convert to customer
- Cost per lead: Content team salaries / leads generated

**Email**
- Open rate: Target 20-30% (B2B), 15-25% (B2C)
- Click rate: Target 2-5% (B2B), 1-3% (B2C)
- Unsubscribe rate: <0.5% (flag if higher)
- Revenue per email: Track revenue generated from email campaigns

**Organic Search**
- Organic traffic: Month-over-month
- Ranking keywords: Track top 10 keywords, average position
- Click-through rate from search: Target 2-5%
- Cost per lead: $0 (only opportunity cost)

---

## Aggregate Metrics

### Overall GTM Health

**Monthly Recurring Revenue (MRR) Growth**
- Target: 10-20% month-over-month (varies by stage)
- Review cadence: Weekly
- Components: New customers × average price + expansion - churn

**Customer Acquisition Cost Trend**
- Definition: Average CAC across all channels
- Target: < 1.0x target (on or below target)
- Review cadence: Weekly
- Alert: If trending > 1.3x target

**Blended Conversion Funnel**
- Visitors → Signups → Activated → Paying
- Target: Overall visitor-to-paying conversion 1-5% (varies by model)
- Review cadence: Weekly

**Channel Contribution**
- Definition: % of new customers from each channel
- Review cadence: Weekly
- Alert: If single channel > 60% (concentration risk)

### Efficiency Metrics

**Sales Efficiency Ratio**
- Definition: MRR growth / GTM spend
- Target: >1.5x (for every $1 spent, generate $1.50+ MRR growth)
- Review cadence: Monthly
- Alert: If drops below 1.0x

**CAC Payback Period**
- Definition: Months until CAC is recouped through gross margin
- Target: <12 months (varies by model)
- Review cadence: Monthly
- Alert: If extends beyond target

**Burn Rate**
- Definition: Monthly GTM spend
- Target: Trending down (as percentage of revenue) as company scales
- Review cadence: Monthly

---

## Campaign-Level Metrics

### Per-Campaign Tracking

**Impressions & Reach**
- Total impressions: How many people saw the ad/content?
- Unique reach: How many unique people?
- Frequency: Average times seen per person
- Target: Frequency 3-5 for optimal conversion without ad fatigue

**Engagement Metrics**
- Clicks: Raw clicks on ad/link
- Click-through rate: Clicks / impressions
- Time spent: For content, average time on page
- Social engagement: Likes, shares, comments (for social content)

**Conversion Funnel**
- Click → Landing page view → Form completion → Demo request → Trial signup
- Conversion rate per step: Identify bottlenecks
- Drop-off analysis: Where do people abandon?

**Quality & Attribution**
- Lead quality score: Sales team score of lead quality
- Time to close: Average days from lead to paying customer
- Lead-to-customer conversion rate: What % of leads close?

---

## Experiment Metrics

### A/B Test Tracking

**Test Variant Performance**
- Variant A performance: CAC, conversion rate, volume
- Variant B performance: CAC, conversion rate, volume
- Statistical significance: Minimum 100 conversions per variant
- Confidence level: 95%+ before declaring winner

**Test Duration**
- Planned: How long was the test planned to run?
- Actual: How long did it actually run?
- Early stop: If one variant clearly dominates, stop early

**Learnings Captured**
- What worked: Which variant won and why?
- What didn't: Why did losing variant underperform?
- Holdover: Which winner learning will apply to future campaigns?

---

## Monthly & Quarterly Reporting

### Weekly GTM Dashboard

Every Monday morning, report:
1. **Acquisition metrics:** New users, signups, activations
2. **Efficiency metrics:** CAC, LTV, ROAS, blended conversion
3. **Channel performance:** CAC by channel, volume by channel
4. **Budget pacing:** Spend vs. plan, forecast to month-end
5. **Alerts:** Any threshold triggers (CAC high, volume low, churn spike)

### Monthly Performance Report

First Friday of each month, review:
1. **Monthly results:** New customers, revenue, spend, profitability
2. **Channel performance:** Which channels won/lost month?
3. **Campaign results:** Top 5 campaigns, bottom 5 campaigns
4. **Budget utilization:** How accurately did we forecast spend?
5. **Experiment outcomes:** Which tests completed? Results?
6. **Actionable insights:** What should we do differently next month?

### Quarterly Business Review

Every quarter:
1. **3-month trends:** Revenue growth, CAC trend, efficiency trend
2. **Channel portfolio health:** Which channels scaling? Declining?
3. **Experiment ROI:** Which experiments justified their spend?
4. **Competitive context:** How are we positioned vs. competitors?
5. **Budget allocation efficiency:** Are we allocating budget optimally?
6. **Next quarter strategy:** What's our focus? Budget? Channels?

---

## Target Metrics by Business Model

### B2B SaaS ($5K-50K/year)

| Metric | Target | Tracking |
|---|---|---|
| CAC | $500-2K | Weekly |
| LTV | $20K-100K | Monthly |
| LTV/CAC | 10-20x | Monthly |
| Payback period | 6-12 months | Monthly |
| Monthly churn | <5% | Monthly |
| Sales efficiency | >3.0x | Monthly |

### B2C SaaS / Freemium

| Metric | Target | Tracking |
|---|---|---|
| CAC | $10-50 | Weekly |
| Paid conversion | 2-10% of free | Monthly |
| LTV | $50-500 | Monthly |
| LTV/CAC | 3-5x | Monthly |
| Viral coefficient | >1.0 | Monthly |
| Organic growth rate | 20%+ | Monthly |

### Enterprise (>$100K/year)

| Metric | Target | Tracking |
|---|---|---|
| CAC | $5K-20K | Monthly |
| Sales cycle | 3-6 months | Monthly |
| Win rate | 20-40% | Monthly |
| Average deal size | $100K+ | Monthly |
| LTV/CAC | >3.0x | Quarterly |
| Payback | 12-24 months | Quarterly |

---

## Alerts & Escalation Triggers

**Critical (Daily review):**
- CAC > 2x target for any channel
- Volume < 50% of forecast
- ROAS < 1.0x on paid channels
- Technical issue preventing tracking/campaigns

**High Priority (Weekly review):**
- CAC > 1.5x target for 2+ weeks
- Activation rate < 30% sustained
- Any single channel approaching 60% of budget
- Major campaign underperforming (CAC > 1.5x after 1 week)

**Medium Priority (Weekly review):**
- Churn spike of >10% from baseline
- Unsubscribe rate > 1% on email
- Any campaign hitting kill threshold (4+ weeks CAC > target)
- Test duration exceeded without statistical significance

---

## Retention & Archival

- Daily metrics: Hot storage for 30 days
- Weekly aggregates: Retained for 1 year
- Monthly reports: Retained for 3 years
- Quarterly deep-dives: Retained for 5 years
