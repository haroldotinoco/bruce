# BruceMemory Privacy Policy

## What Data IS Permitted in Patterns

### Allowed in Cross-Venture Patterns
- **Anonymized outcomes**: "A B2B SaaS venture in healthcare failed due to..." (NOT "MediLink Connect failed because...")
- **Quantitative metrics**: CAC, LTV, churn, growth rate, sales cycle length
- **Market segment signals**: "B2B SaaS ventures targeting SMBs show..." (OK); "Ventures targeting [customer name]" (NOT OK)
- **Stage-dependent patterns**: "Early-stage ventures launching without domain expertise show..." (OK)
- **Temporal patterns**: "Ventures founded Q3 2025 showed extended sales cycles due to..." (OK)

### Explicitly Anonymized Business Data
- Revenue figures: Aggregate only (e.g., "median ARR $X" not individual venture ARR)
- Customer lists: NEVER included in patterns
- Employee counts and names: NEVER included
- Specific product features: OK only if not identifying (e.g., "ventures using usage-based pricing" not "ventures implementing [feature X]")

## What Data IS NOT Permitted

### Strictly Prohibited
- **Founder/team member personal information**: Names, backgrounds, employment history
- **Customer names and contact information**: Customer list anonymization is mandatory
- **Proprietary metrics or formulas**: Venture-specific methodologies, pricing models
- **Contractual terms**: Specific customer contracts, investment terms
- **Sensitive financial details**: Individual venture revenue, profit margins, burn rates (without consent)
- **Acquisition prices**: Any M&A valuation or exit price details

## Anonymization Rules

### Venture Identification
- Use venture_id or role-based description, NEVER venture name
- Example: "v-001" or "a Series A B2B SaaS in healthcare" (NOT "MediLink Connect")
- Kill postmortems reference ventures by ID only in stored patterns

### Customer References
- Use segment, geography, and company size only
- Example: "SMB healthcare provider in US Midwest" (NOT "Company X, Inc.")
- Never include customer logo, brand name, or specific identifiers

### Individual Data
- Founder background OK as aggregate: "ventures with prior exits" (NOT "Founder X from Y company")
- Team composition OK as roles: "strong engineering hiring" (NOT "3 engineers from Z company")
- No personal social media or contact details under any circumstances

## Data Retention and Access

### Retention Rules
- Learning records: Retained indefinitely (audit trail for governance)
- Patterns: Retained indefinitely (with deprecation markers for contradicted patterns)
- Intelligence snapshots: Retained indefinitely
- Query logs: Retained for 90 days for audit; then deleted

### Access Control
- Learning records: Internal use only (not shared externally)
- Patterns: Can be shared with other BruceAI modules; anonymized version can be shared externally
- Snapshots: For internal leadership and authorized personnel only
- Query logs: Access restricted to bruce-core and bruce-memory operations team

### Data Sharing
- NEVER share individual learning records externally
- Patterns can be shared externally ONLY if anonymized (venture names removed, data aggregated)
- Intelligence snapshots shared with authorized BruceAI leadership only

## Kill Postmortem Handling

### Storage
- Kill postmortem learnings stored like all other learnings
- Tagged as "sensitive" for governance purposes
- Included in pattern extraction and synthesis (patterns do not identify the venture)

### Visibility
- Learning records of dead ventures: visible to pattern extraction and synthesis only
- Patterns extracted from kill postmortems: anonymized (ventures identified by ID only)
- Intelligence summaries: Can reference patterns from dead ventures without naming venture

### External Sharing
- Kill postmortem learnings NEVER shared externally
- Patterns extracted from kills: can be shared externally only after anonymization

## User Consent and Opt-Out

### Automatic Processing
- Learning records submitted by BruceAI modules are deemed authorized for internal memory use
- No additional consent required for learning ingestion or pattern extraction
- Consent is scope-limited: patterns and intelligence may be shared with other BruceAI modules

### Opt-Out Mechanisms
- If a venture founder requests their specific learning records excluded from future patterns: accommodated with data deletion (respects founder privacy)
- If external party requests their data removed: evaluate request under data subject rights (GDPR/CCPA) and comply where legally required
- Opt-out does not affect patterns already published; only affects future extractions

## Audit and Compliance

### Audit Trail
- All learning ingestion logged with source, timestamp, quality score
- Pattern extraction logged with evidence ventures (IDs only)
- Query logs maintained for 90 days to track who accessed what patterns

### Compliance Notes
- BruceMemory operates as internal knowledge management system, not a personal data processor
- Venture-specific data treated as confidential business information
- Customer data mentioned in learnings anonymized in all downstream uses

### Regular Review
- Privacy controls reviewed quarterly
- Anonymization rules tested on pattern outputs monthly
- Audit logs reviewed for unauthorized access attempts
