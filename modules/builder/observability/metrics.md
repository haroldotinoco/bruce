# Builder Module Metrics

## Key Performance Indicators (KPIs)

### Pipeline Success Metrics

#### Build Success Rate
- **Definition**: Percentage of builds reaching launch approval
- **Target**: >95% of initiated builds
- **Measurement**: (completed_builds / initiated_builds) * 100
- **Update Frequency**: Real-time
- **Alerting**: <90% triggers warning

#### Average Pipeline Duration
- **Definition**: Mean time from build initiation to governance approval
- **Target**: <4 hours
- **Measurement**: Aggregate duration across completed builds
- **Update Frequency**: Per completed build
- **Alerting**: >5 hours is warning

### Stage-Level Metrics

#### Per-Stage Pass Rate
- **Stages**: functional-validation, ux-bdd, architecture, backend, frontend, qa, security, governance
- **Definition**: Percentage of builds passing each stage without rework
- **Target**: >90% per stage
- **Measurement**: (passed_at_stage / total_attempted_at_stage) * 100
- **Update Frequency**: Per stage completion
- **Alerting**: <80% is warning, <70% is critical

#### Per-Stage Average Duration
- **Definition**: Mean execution time for each stage
- **Target**: See table below
- **Measurement**: Aggregate duration for stage across all builds
- **Update Frequency**: Per stage completion
- **Alerting**: >150% of target is warning

| Stage | Target Duration (min) |
|-------|----------------------|
| Functional Validation | 10 |
| UX-BDD Specification | 30 |
| Solution Architecture | 45 |
| Backend Development | 60 |
| Frontend Development | 60 |
| QA Testing | 30 |
| Security Audit | 45 |
| Governance Review | 20 |

### Code Quality Metrics

#### Test Coverage
- **Definition**: Percentage of code covered by automated tests
- **Backend Target**: >80%
- **Frontend Target**: >70%
- **Measurement**: Lines covered / total executable lines
- **Update Frequency**: Per build
- **Alerting**: Below target blocks build

#### Code Quality Score
- **Definition**: Overall code quality assessment (0-100)
- **Target**: >80
- **Measurement**: SonarQube or equivalent
- **Update Frequency**: Per build
- **Alerting**: <75 is warning, <70 blocks build

#### Complexity (Cyclomatic)
- **Definition**: Average cyclomatic complexity per function
- **Target**: <10
- **Measurement**: Max complexity / function count
- **Update Frequency**: Per build
- **Alerting**: >15 is warning

### QA Metrics

#### Scenario Pass Rate
- **Definition**: Percentage of BDD scenarios passing in QA
- **Target**: >95%
- **Measurement**: (passed_scenarios / total_scenarios) * 100
- **Update Frequency**: Per QA run
- **Alerting**: <90% triggers rework

#### Test Execution Duration
- **Definition**: Time to execute full QA test suite
- **Target**: <30 minutes
- **Measurement**: Total time for all scenarios
- **Update Frequency**: Per test run
- **Alerting**: >45 minutes is warning

#### Critical Failure Count
- **Definition**: Number of scenarios failing with critical impact
- **Target**: 0
- **Measurement**: Count of failures blocking deployment
- **Update Frequency**: Per QA run
- **Alerting**: >0 is critical

### Security Metrics

#### Security Score
- **Definition**: Overall security assessment (0-100)
- **Target**: >80
- **Measurement**: OWASP assessment + dependency scan + code review
- **Update Frequency**: Per security audit
- **Alerting**: <70 blocks launch

#### Vulnerability Counts
- **Definition**: Count of vulnerabilities by severity
- **Targets**:
  - Critical: 0
  - High: 0
  - Medium: <5
  - Low: <10
- **Measurement**: Security scanning tools
- **Update Frequency**: Per audit
- **Alerting**: Any critical blocks launch

#### OWASP Coverage
- **Definition**: Percentage of OWASP Top 10 items assessed
- **Target**: 100% (all 10 categories)
- **Measurement**: Assessment completion per category
- **Update Frequency**: Per security audit
- **Alerting**: <100% is warning

### Rework Metrics

#### Rework Rate by Stage
- **Definition**: Percentage of builds requiring rework at each stage
- **Target**: <10% per stage
- **Measurement**: (reworked_builds / total_builds_at_stage) * 100
- **Update Frequency**: Per stage completion
- **Alerting**: >15% is warning

| Stage | Rework Rate Target |
|-------|-------------------|
| Backend Development | <5% |
| Frontend Development | <5% |
| QA Testing | <15% (gate at 90%) |

#### Rework Cycle Count
- **Definition**: Average number of rework cycles per build
- **Target**: <1.2 cycles
- **Measurement**: Sum of rework cycles / total builds
- **Update Frequency**: Per completed build
- **Alerting**: >1.5 is warning

#### Rework Success Rate
- **Definition**: Percentage of rework cycles that resolve failures
- **Target**: >85%
- **Measurement**: (successful_rework_attempts / total_rework_attempts) * 100
- **Update Frequency**: Per rework completion
- **Alerting**: <75% is warning

### Trend Metrics

#### Build Success Trend (30-day)
- **Definition**: 30-day rolling average of build success rate
- **Target**: Stable >95%
- **Measurement**: Daily average over 30 days
- **Update Frequency**: Daily
- **Alerting**: Downward trend >5% triggers review

#### Stage Failure Rate Trend
- **Definition**: Trending for each stage failure rate
- **Target**: Stable or improving
- **Measurement**: 7-day moving average per stage
- **Update Frequency**: Daily
- **Alerting**: Upward trend >10% triggers review

#### Average Build Quality Score Trend
- **Definition**: 30-day rolling average quality
- **Target**: Stable >85
- **Measurement**: Daily average of quality scores
- **Update Frequency**: Daily
- **Alerting**: Downward trend >5 points triggers review

## Dashboard Visualizations

### Executive Dashboard
- Build success rate (gauge chart)
- Average pipeline duration (line chart)
- Active builds (counter)
- Completed builds this week (counter)
- Failed builds (recent list)

### Operations Dashboard
- Stage completion status (funnel chart)
- Stage failure rates (bar chart)
- Average duration per stage (bar chart)
- Current build status (detailed view)
- Rework activity (table)

### Quality Dashboard
- Code quality score trend (line chart)
- Test coverage trend (area chart)
- Security score trend (line chart)
- Bug/vulnerability discovery rate (trend)

### Security Dashboard
- Vulnerability counts by severity (pie chart)
- OWASP assessment status (checklist)
- Dependency vulnerability trends (line chart)
- Critical vulnerability timeline (events)

## Metrics Collection

### Data Sources
- Pipeline execution logs
- Agent output reports
- Quality scanning tools (SonarQube, etc.)
- Security scanning tools
- Test execution logs
- Time tracking systems

### Collection Intervals
- Real-time: Build status, stage progress
- Per-build: Quality metrics, security scores
- Hourly: Trend calculations
- Daily: Dashboard updates
- Weekly: Report generation

### Storage
- Metrics stored in time-series database (Prometheus, CloudWatch)
- Retention: 1 year of metrics
- Archive: Quarterly exports to S3

## Alerting Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Build Success Rate | <90% | <75% |
| Avg Pipeline Duration | >5h | >6h |
| Per-Stage Pass Rate | <80% | <70% |
| Test Coverage | <75% | <70% |
| Code Quality | <75 | <70 |
| Security Score | <75 | <70 |
| Rework Rate | >15% | >25% |
| Vulnerability (Critical) | - | >0 |

## Reporting

### Weekly Report
- Build success rate
- Average pipeline duration
- Failed builds breakdown
- Top failure causes
- Quality metrics summary

### Monthly Report
- Trend analysis for all KPIs
- Performance improvements/regressions
- Security audit summary
- Recommendations for process improvement
- Resource utilization analysis
