-- =============================================================
-- BruceAI Initial Database Migration
-- Creates all schemas, tables, and RLS policies for all modules
-- =============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- MIGRATIONS TRACKING TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS migrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    execution_time_ms INTEGER
);

INSERT INTO migrations (name) VALUES ('001_init') ON CONFLICT (name) DO NOTHING;

-- =============================================================
-- SCHEMA: BRUCE_CORE
-- =============================================================
CREATE SCHEMA IF NOT EXISTS bruce_core;

-- Accounts table
CREATE TABLE IF NOT EXISTS bruce_core.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    organization_name TEXT NOT NULL,
    owner_email TEXT NOT NULL,
    subscription_tier TEXT DEFAULT 'free',
    api_quota_remaining INTEGER DEFAULT 10000,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_accounts_account_id ON bruce_core.accounts(account_id);
CREATE INDEX IF NOT EXISTS idx_accounts_owner_email ON bruce_core.accounts(owner_email);

-- Ventures table (high-level venture records)
CREATE TABLE IF NOT EXISTS bruce_core.ventures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_name TEXT NOT NULL,
    description TEXT,
    industry TEXT,
    stage TEXT,
    founder_names TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ventures_account_id ON bruce_core.ventures(account_id);
CREATE INDEX IF NOT EXISTS idx_ventures_stage ON bruce_core.ventures(stage);

-- Jobs table (background job tracking)
CREATE TABLE IF NOT EXISTS bruce_core.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_id UUID,
    module_name TEXT NOT NULL,
    job_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    temporal_workflow_id TEXT,
    temporal_run_id TEXT,
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_account_id ON bruce_core.jobs(account_id);
CREATE INDEX IF NOT EXISTS idx_jobs_venture_id ON bruce_core.jobs(venture_id);
CREATE INDEX IF NOT EXISTS idx_jobs_module_name ON bruce_core.jobs(module_name);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON bruce_core.jobs(status);

-- Events table (audit log)
CREATE TABLE IF NOT EXISTS bruce_core.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_id UUID,
    module_name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_account_id ON bruce_core.events(account_id);
CREATE INDEX IF NOT EXISTS idx_events_module_name ON bruce_core.events(module_name);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON bruce_core.events(created_at);

-- Module config table
CREATE TABLE IF NOT EXISTS bruce_core.module_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    module_name TEXT NOT NULL,
    config_key TEXT NOT NULL,
    config_value JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(account_id, module_name, config_key)
);

CREATE INDEX IF NOT EXISTS idx_module_config_account_id ON bruce_core.module_config(account_id);
CREATE INDEX IF NOT EXISTS idx_module_config_module_name ON bruce_core.module_config(module_name);

-- =============================================================
-- SCHEMA: OPPORTUNITY
-- =============================================================
CREATE SCHEMA IF NOT EXISTS opportunity;

-- Opportunities table
CREATE TABLE IF NOT EXISTS opportunity.opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'open',
    estimated_impact TEXT,
    market_size_estimate TEXT,
    competitive_advantage TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    research_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_opportunities_account_id ON opportunity.opportunities(account_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_venture_id ON opportunity.opportunities(venture_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunity.opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON opportunity.opportunities(category);
CREATE INDEX IF NOT EXISTS idx_opportunities_tags ON opportunity.opportunities USING GIN(tags);

-- Opportunity analysis results
CREATE TABLE IF NOT EXISTS opportunity.analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    opportunity_id UUID NOT NULL REFERENCES opportunity.opportunities(id) ON DELETE CASCADE,
    analysis_type TEXT NOT NULL,
    findings JSONB,
    confidence_score NUMERIC(3,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analysis_results_account_id ON opportunity.analysis_results(account_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_opportunity_id ON opportunity.analysis_results(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_analysis_type ON opportunity.analysis_results(analysis_type);

-- =============================================================
-- SCHEMA: ADD_VENTURE
-- =============================================================
CREATE SCHEMA IF NOT EXISTS add_venture;

-- Venture dossiers
CREATE TABLE IF NOT EXISTS add_venture.venture_dossiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_id UUID,
    executive_summary TEXT,
    problem_statement TEXT,
    target_market JSONB,
    competitive_landscape JSONB,
    financial_projections JSONB,
    team_overview JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_venture_dossiers_account_id ON add_venture.venture_dossiers(account_id);
CREATE INDEX IF NOT EXISTS idx_venture_dossiers_venture_id ON add_venture.venture_dossiers(venture_id);

-- Business models
CREATE TABLE IF NOT EXISTS add_venture.business_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_id UUID,
    model_type TEXT,
    revenue_streams JSONB,
    cost_structure JSONB,
    unit_economics JSONB,
    sustainability_analysis TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_business_models_account_id ON add_venture.business_models(account_id);
CREATE INDEX IF NOT EXISTS idx_business_models_venture_id ON add_venture.business_models(venture_id);

-- Execution roadmaps
CREATE TABLE IF NOT EXISTS add_venture.execution_roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_id UUID,
    phase_name TEXT,
    phase_number INTEGER,
    goals JSONB,
    milestones JSONB,
    timeline_months INTEGER,
    resource_requirements JSONB,
    risk_mitigation JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_execution_roadmaps_account_id ON add_venture.execution_roadmaps(account_id);
CREATE INDEX IF NOT EXISTS idx_execution_roadmaps_venture_id ON add_venture.execution_roadmaps(venture_id);

-- =============================================================
-- SCHEMA: BRAND_AID
-- =============================================================
CREATE SCHEMA IF NOT EXISTS brand_aid;

-- Brand identities
CREATE TABLE IF NOT EXISTS brand_aid.brand_identities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_id UUID,
    brand_name TEXT NOT NULL,
    tagline TEXT,
    brand_voice_guidelines TEXT,
    visual_identity JSONB,
    core_values TEXT[],
    brand_promise TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_brand_identities_account_id ON brand_aid.brand_identities(account_id);
CREATE INDEX IF NOT EXISTS idx_brand_identities_venture_id ON brand_aid.brand_identities(venture_id);

-- Naming candidates
CREATE TABLE IF NOT EXISTS brand_aid.naming_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_id UUID,
    brand_identity_id UUID REFERENCES brand_aid.brand_identities(id) ON DELETE CASCADE,
    candidate_name TEXT NOT NULL,
    meaning_explanation TEXT,
    memorability_score NUMERIC(3,2),
    relevance_score NUMERIC(3,2),
    domain_availability BOOLEAN,
    trademark_status TEXT,
    cultural_sensitivity_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_naming_candidates_account_id ON brand_aid.naming_candidates(account_id);
CREATE INDEX IF NOT EXISTS idx_naming_candidates_venture_id ON brand_aid.naming_candidates(venture_id);
CREATE INDEX IF NOT EXISTS idx_naming_candidates_brand_identity_id ON brand_aid.naming_candidates(brand_identity_id);

-- Brand guidelines
CREATE TABLE IF NOT EXISTS brand_aid.brand_guidelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_id UUID,
    brand_identity_id UUID REFERENCES brand_aid.brand_identities(id) ON DELETE CASCADE,
    guideline_section TEXT,
    content JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_brand_guidelines_account_id ON brand_aid.brand_guidelines(account_id);
CREATE INDEX IF NOT EXISTS idx_brand_guidelines_venture_id ON brand_aid.brand_guidelines(venture_id);
CREATE INDEX IF NOT EXISTS idx_brand_guidelines_brand_identity_id ON brand_aid.brand_guidelines(brand_identity_id);

-- =============================================================
-- SCHEMA: BUILDER
-- =============================================================
CREATE SCHEMA IF NOT EXISTS builder;

-- MVP specifications
CREATE TABLE IF NOT EXISTS builder.mvp_specs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_id UUID,
    product_name TEXT NOT NULL,
    core_features TEXT[],
    user_stories JSONB,
    acceptance_criteria JSONB,
    success_metrics JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mvp_specs_account_id ON builder.mvp_specs(account_id);
CREATE INDEX IF NOT EXISTS idx_mvp_specs_venture_id ON builder.mvp_specs(venture_id);

-- Architecture documents
CREATE TABLE IF NOT EXISTS builder.architecture_docs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_id UUID,
    mvp_spec_id UUID REFERENCES builder.mvp_specs(id) ON DELETE CASCADE,
    architecture_type TEXT,
    technology_stack JSONB,
    system_components JSONB,
    data_flow_diagram TEXT,
    infrastructure_requirements JSONB,
    scalability_considerations TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_architecture_docs_account_id ON builder.architecture_docs(account_id);
CREATE INDEX IF NOT EXISTS idx_architecture_docs_venture_id ON builder.architecture_docs(venture_id);
CREATE INDEX IF NOT EXISTS idx_architecture_docs_mvp_spec_id ON builder.architecture_docs(mvp_spec_id);

-- Sprint plans
CREATE TABLE IF NOT EXISTS builder.sprint_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_id UUID,
    mvp_spec_id UUID REFERENCES builder.mvp_specs(id) ON DELETE CASCADE,
    sprint_number INTEGER,
    start_date DATE,
    end_date DATE,
    sprint_goals TEXT[],
    assigned_tasks JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sprint_plans_account_id ON builder.sprint_plans(account_id);
CREATE INDEX IF NOT EXISTS idx_sprint_plans_venture_id ON builder.sprint_plans(venture_id);
CREATE INDEX IF NOT EXISTS idx_sprint_plans_mvp_spec_id ON builder.sprint_plans(mvp_spec_id);

-- Feature backlogs
CREATE TABLE IF NOT EXISTS builder.feature_backlogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_id UUID,
    mvp_spec_id UUID REFERENCES builder.mvp_specs(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    description TEXT,
    priority INTEGER,
    story_points INTEGER,
    status TEXT DEFAULT 'backlog',
    assigned_sprint_id UUID REFERENCES builder.sprint_plans(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feature_backlogs_account_id ON builder.feature_backlogs(account_id);
CREATE INDEX IF NOT EXISTS idx_feature_backlogs_venture_id ON builder.feature_backlogs(venture_id);
CREATE INDEX IF NOT EXISTS idx_feature_backlogs_mvp_spec_id ON builder.feature_backlogs(mvp_spec_id);

-- =============================================================
-- SCHEMA: GTM
-- =============================================================
CREATE SCHEMA IF NOT EXISTS gtm;

-- Strategies
CREATE TABLE IF NOT EXISTS gtm.strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_id UUID,
    strategy_name TEXT NOT NULL,
    market_segment TEXT,
    target_customer_profile JSONB,
    positioning_statement TEXT,
    differentiation_strategy TEXT,
    pricing_strategy JSONB,
    distribution_channels JSONB,
    success_metrics JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gtm_strategies_account_id ON gtm.strategies(account_id);
CREATE INDEX IF NOT EXISTS idx_gtm_strategies_venture_id ON gtm.strategies(venture_id);

-- Campaigns
CREATE TABLE IF NOT EXISTS gtm.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_id UUID,
    strategy_id UUID REFERENCES gtm.strategies(id) ON DELETE CASCADE,
    campaign_name TEXT NOT NULL,
    channel TEXT,
    start_date DATE,
    end_date DATE,
    budget NUMERIC(12,2),
    content_pillars TEXT[],
    messaging JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gtm_campaigns_account_id ON gtm.campaigns(account_id);
CREATE INDEX IF NOT EXISTS idx_gtm_campaigns_venture_id ON gtm.campaigns(venture_id);
CREATE INDEX IF NOT EXISTS idx_gtm_campaigns_strategy_id ON gtm.campaigns(strategy_id);

-- Analytics snapshots
CREATE TABLE IF NOT EXISTS gtm.analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_id UUID,
    campaign_id UUID REFERENCES gtm.campaigns(id) ON DELETE CASCADE,
    metric_type TEXT,
    snapshot_date DATE,
    impressions INTEGER,
    clicks INTEGER,
    conversions INTEGER,
    cost_per_acquisition NUMERIC(10,2),
    revenue_attribution NUMERIC(12,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_account_id ON gtm.analytics_snapshots(account_id);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_venture_id ON gtm.analytics_snapshots(venture_id);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_campaign_id ON gtm.analytics_snapshots(campaign_id);

-- Experiments
CREATE TABLE IF NOT EXISTS gtm.experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_id UUID,
    campaign_id UUID REFERENCES gtm.campaigns(id) ON DELETE CASCADE,
    experiment_name TEXT NOT NULL,
    hypothesis TEXT,
    control_group TEXT,
    test_group TEXT,
    start_date DATE,
    end_date DATE,
    result_summary TEXT,
    statistical_significance NUMERIC(3,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gtm_experiments_account_id ON gtm.experiments(account_id);
CREATE INDEX IF NOT EXISTS idx_gtm_experiments_venture_id ON gtm.experiments(venture_id);
CREATE INDEX IF NOT EXISTS idx_gtm_experiments_campaign_id ON gtm.experiments(campaign_id);

-- =============================================================
-- SCHEMA: STARTUP_OPS
-- =============================================================
CREATE SCHEMA IF NOT EXISTS startup_ops;

-- Health scores
CREATE TABLE IF NOT EXISTS startup_ops.health_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_id UUID,
    score_date DATE,
    overall_health NUMERIC(3,2),
    financial_health NUMERIC(3,2),
    operational_health NUMERIC(3,2),
    team_health NUMERIC(3,2),
    product_health NUMERIC(3,2),
    market_health NUMERIC(3,2),
    assessment_details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_health_scores_account_id ON startup_ops.health_scores(account_id);
CREATE INDEX IF NOT EXISTS idx_health_scores_venture_id ON startup_ops.health_scores(venture_id);
CREATE INDEX IF NOT EXISTS idx_health_scores_score_date ON startup_ops.health_scores(score_date);

-- Anomaly events
CREATE TABLE IF NOT EXISTS startup_ops.anomaly_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_id UUID,
    health_score_id UUID REFERENCES startup_ops.health_scores(id) ON DELETE CASCADE,
    anomaly_type TEXT,
    severity TEXT,
    description TEXT,
    affected_area TEXT,
    recommended_actions TEXT[],
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_anomaly_events_account_id ON startup_ops.anomaly_events(account_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_events_venture_id ON startup_ops.anomaly_events(venture_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_events_health_score_id ON startup_ops.anomaly_events(health_score_id);

-- Operational recommendations
CREATE TABLE IF NOT EXISTS startup_ops.ops_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_id UUID,
    anomaly_event_id UUID REFERENCES startup_ops.anomaly_events(id) ON DELETE CASCADE,
    recommendation_text TEXT NOT NULL,
    priority TEXT,
    category TEXT,
    implementation_effort TEXT,
    expected_impact TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ops_recommendations_account_id ON startup_ops.ops_recommendations(account_id);
CREATE INDEX IF NOT EXISTS idx_ops_recommendations_venture_id ON startup_ops.ops_recommendations(venture_id);
CREATE INDEX IF NOT EXISTS idx_ops_recommendations_anomaly_event_id ON startup_ops.ops_recommendations(anomaly_event_id);

-- Weekly reports
CREATE TABLE IF NOT EXISTS startup_ops.weekly_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_id UUID,
    week_ending DATE NOT NULL,
    executive_summary TEXT,
    key_metrics JSONB,
    risks_and_issues JSONB,
    upcoming_priorities TEXT[],
    recommendations JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_weekly_reports_account_id ON startup_ops.weekly_reports(account_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_venture_id ON startup_ops.weekly_reports(venture_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_week_ending ON startup_ops.weekly_reports(week_ending);

-- =============================================================
-- SCHEMA: PORTFOLIO
-- =============================================================
CREATE SCHEMA IF NOT EXISTS portfolio;

-- Portfolio reviews
CREATE TABLE IF NOT EXISTS portfolio.portfolio_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    review_date DATE,
    total_ventures INTEGER,
    total_investments NUMERIC(15,2),
    portfolio_diversification JSONB,
    sector_allocation JSONB,
    stage_allocation JSONB,
    review_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_portfolio_reviews_account_id ON portfolio.portfolio_reviews(account_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_reviews_review_date ON portfolio.portfolio_reviews(review_date);

-- Governance decisions
CREATE TABLE IF NOT EXISTS portfolio.governance_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_id UUID,
    portfolio_review_id UUID REFERENCES portfolio.portfolio_reviews(id) ON DELETE CASCADE,
    decision_type TEXT,
    decision_description TEXT,
    decision_rationale TEXT,
    approval_required BOOLEAN DEFAULT false,
    approved_by TEXT,
    decision_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_governance_decisions_account_id ON portfolio.governance_decisions(account_id);
CREATE INDEX IF NOT EXISTS idx_governance_decisions_venture_id ON portfolio.governance_decisions(venture_id);
CREATE INDEX IF NOT EXISTS idx_governance_decisions_portfolio_review_id ON portfolio.governance_decisions(portfolio_review_id);

-- Allocations
CREATE TABLE IF NOT EXISTS portfolio.allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_id UUID,
    allocation_type TEXT,
    amount NUMERIC(15,2),
    allocation_date DATE,
    allocation_reason TEXT,
    governance_decision_id UUID REFERENCES portfolio.governance_decisions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_allocations_account_id ON portfolio.allocations(account_id);
CREATE INDEX IF NOT EXISTS idx_allocations_venture_id ON portfolio.allocations(venture_id);
CREATE INDEX IF NOT EXISTS idx_allocations_governance_decision_id ON portfolio.allocations(governance_decision_id);

-- =============================================================
-- SCHEMA: BRUCE_MEMORY
-- =============================================================
CREATE SCHEMA IF NOT EXISTS bruce_memory;

-- Learnings
CREATE TABLE IF NOT EXISTS bruce_memory.learnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_id UUID,
    learning_type TEXT,
    content TEXT NOT NULL,
    source_module TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    confidence_level NUMERIC(3,2),
    is_actionable BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_learnings_account_id ON bruce_memory.learnings(account_id);
CREATE INDEX IF NOT EXISTS idx_learnings_venture_id ON bruce_memory.learnings(venture_id);
CREATE INDEX IF NOT EXISTS idx_learnings_tags ON bruce_memory.learnings USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_learnings_source_module ON bruce_memory.learnings(source_module);

-- Patterns
CREATE TABLE IF NOT EXISTS bruce_memory.patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    pattern_name TEXT NOT NULL,
    pattern_description TEXT,
    frequency INTEGER,
    affected_ventures INTEGER,
    impact_assessment TEXT,
    pattern_category TEXT,
    related_learnings UUID[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patterns_account_id ON bruce_memory.patterns(account_id);
CREATE INDEX IF NOT EXISTS idx_patterns_pattern_category ON bruce_memory.patterns(pattern_category);

-- Intelligence syntheses
CREATE TABLE IF NOT EXISTS bruce_memory.intelligence_syntheses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    synthesis_type TEXT,
    synthesis_title TEXT NOT NULL,
    synthesis_content TEXT,
    supported_by_learnings UUID[],
    supported_by_patterns UUID[],
    strategic_implications TEXT,
    recommendations TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_intelligence_syntheses_account_id ON bruce_memory.intelligence_syntheses(account_id);
CREATE INDEX IF NOT EXISTS idx_intelligence_syntheses_synthesis_type ON bruce_memory.intelligence_syntheses(synthesis_type);

-- Query logs (for tracking memory access patterns)
CREATE TABLE IF NOT EXISTS bruce_memory.query_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL,
    venture_id UUID,
    query_text TEXT,
    query_type TEXT,
    results_count INTEGER,
    execution_time_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_query_logs_account_id ON bruce_memory.query_logs(account_id);
CREATE INDEX IF NOT EXISTS idx_query_logs_venture_id ON bruce_memory.query_logs(venture_id);
CREATE INDEX IF NOT EXISTS idx_query_logs_created_at ON bruce_memory.query_logs(created_at);

-- =============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================

-- Enable RLS on all tables
ALTER TABLE bruce_core.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bruce_core.ventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE bruce_core.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bruce_core.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bruce_core.module_config ENABLE ROW LEVEL SECURITY;

ALTER TABLE opportunity.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity.analysis_results ENABLE ROW LEVEL SECURITY;

ALTER TABLE add_venture.venture_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_venture.business_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_venture.execution_roadmaps ENABLE ROW LEVEL SECURITY;

ALTER TABLE brand_aid.brand_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_aid.naming_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_aid.brand_guidelines ENABLE ROW LEVEL SECURITY;

ALTER TABLE builder.mvp_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder.architecture_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder.sprint_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder.feature_backlogs ENABLE ROW LEVEL SECURITY;

ALTER TABLE gtm.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE gtm.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE gtm.analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE gtm.experiments ENABLE ROW LEVEL SECURITY;

ALTER TABLE startup_ops.health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_ops.anomaly_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_ops.ops_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_ops.weekly_reports ENABLE ROW LEVEL SECURITY;

ALTER TABLE portfolio.portfolio_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.governance_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.allocations ENABLE ROW LEVEL SECURITY;

ALTER TABLE bruce_memory.learnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bruce_memory.patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE bruce_memory.intelligence_syntheses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bruce_memory.query_logs ENABLE ROW LEVEL SECURITY;

-- Create a policy function for account-based access
CREATE OR REPLACE FUNCTION check_account_access(row_account_id UUID) RETURNS BOOLEAN AS $$
BEGIN
    -- In a real production setup, this would check against auth context
    -- For now, we allow all reads; authentication should be enforced at the application layer
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Apply RLS policies to bruce_core tables
CREATE POLICY bruce_core_accounts_policy ON bruce_core.accounts
    USING (check_account_access(account_id));

CREATE POLICY bruce_core_ventures_policy ON bruce_core.ventures
    USING (check_account_access(account_id));

CREATE POLICY bruce_core_jobs_policy ON bruce_core.jobs
    USING (check_account_access(account_id));

CREATE POLICY bruce_core_events_policy ON bruce_core.events
    USING (check_account_access(account_id));

CREATE POLICY bruce_core_module_config_policy ON bruce_core.module_config
    USING (check_account_access(account_id));

-- Apply RLS policies to opportunity tables
CREATE POLICY opportunity_opportunities_policy ON opportunity.opportunities
    USING (check_account_access(account_id));

CREATE POLICY opportunity_analysis_results_policy ON opportunity.analysis_results
    USING (check_account_access(account_id));

-- Apply RLS policies to add_venture tables
CREATE POLICY add_venture_dossiers_policy ON add_venture.venture_dossiers
    USING (check_account_access(account_id));

CREATE POLICY add_venture_business_models_policy ON add_venture.business_models
    USING (check_account_access(account_id));

CREATE POLICY add_venture_execution_roadmaps_policy ON add_venture.execution_roadmaps
    USING (check_account_access(account_id));

-- Apply RLS policies to brand_aid tables
CREATE POLICY brand_aid_brand_identities_policy ON brand_aid.brand_identities
    USING (check_account_access(account_id));

CREATE POLICY brand_aid_naming_candidates_policy ON brand_aid.naming_candidates
    USING (check_account_access(account_id));

CREATE POLICY brand_aid_brand_guidelines_policy ON brand_aid.brand_guidelines
    USING (check_account_access(account_id));

-- Apply RLS policies to builder tables
CREATE POLICY builder_mvp_specs_policy ON builder.mvp_specs
    USING (check_account_access(account_id));

CREATE POLICY builder_architecture_docs_policy ON builder.architecture_docs
    USING (check_account_access(account_id));

CREATE POLICY builder_sprint_plans_policy ON builder.sprint_plans
    USING (check_account_access(account_id));

CREATE POLICY builder_feature_backlogs_policy ON builder.feature_backlogs
    USING (check_account_access(account_id));

-- Apply RLS policies to gtm tables
CREATE POLICY gtm_strategies_policy ON gtm.strategies
    USING (check_account_access(account_id));

CREATE POLICY gtm_campaigns_policy ON gtm.campaigns
    USING (check_account_access(account_id));

CREATE POLICY gtm_analytics_snapshots_policy ON gtm.analytics_snapshots
    USING (check_account_access(account_id));

CREATE POLICY gtm_experiments_policy ON gtm.experiments
    USING (check_account_access(account_id));

-- Apply RLS policies to startup_ops tables
CREATE POLICY startup_ops_health_scores_policy ON startup_ops.health_scores
    USING (check_account_access(account_id));

CREATE POLICY startup_ops_anomaly_events_policy ON startup_ops.anomaly_events
    USING (check_account_access(account_id));

CREATE POLICY startup_ops_ops_recommendations_policy ON startup_ops.ops_recommendations
    USING (check_account_access(account_id));

CREATE POLICY startup_ops_weekly_reports_policy ON startup_ops.weekly_reports
    USING (check_account_access(account_id));

-- Apply RLS policies to portfolio tables
CREATE POLICY portfolio_portfolio_reviews_policy ON portfolio.portfolio_reviews
    USING (check_account_access(account_id));

CREATE POLICY portfolio_governance_decisions_policy ON portfolio.governance_decisions
    USING (check_account_access(account_id));

CREATE POLICY portfolio_allocations_policy ON portfolio.allocations
    USING (check_account_access(account_id));

-- Apply RLS policies to bruce_memory tables
CREATE POLICY bruce_memory_learnings_policy ON bruce_memory.learnings
    USING (check_account_access(account_id));

CREATE POLICY bruce_memory_patterns_policy ON bruce_memory.patterns
    USING (check_account_access(account_id));

CREATE POLICY bruce_memory_intelligence_syntheses_policy ON bruce_memory.intelligence_syntheses
    USING (check_account_access(account_id));

CREATE POLICY bruce_memory_query_logs_policy ON bruce_memory.query_logs
    USING (check_account_access(account_id));

-- =============================================================
-- PERFORMANCE INDEXES
-- =============================================================

-- Additional composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_opportunities_account_venture_status
    ON opportunity.opportunities(account_id, venture_id, status);

CREATE INDEX IF NOT EXISTS idx_health_scores_venture_date
    ON startup_ops.health_scores(venture_id, score_date DESC);

CREATE INDEX IF NOT EXISTS idx_campaigns_strategy_date
    ON gtm.campaigns(strategy_id, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_learnings_account_updated
    ON bruce_memory.learnings(account_id, updated_at DESC);

-- Full-text search indexes for text fields
CREATE INDEX IF NOT EXISTS idx_opportunities_search
    ON opportunity.opportunities USING GIN(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '')));

CREATE INDEX IF NOT EXISTS idx_learnings_search
    ON bruce_memory.learnings USING GIN(to_tsvector('english', content));

-- =============================================================
-- COMMENT ON TABLES AND SCHEMAS
-- =============================================================

COMMENT ON SCHEMA bruce_core IS 'Core BruceAI platform tables for accounts, ventures, jobs, and configuration';
COMMENT ON SCHEMA opportunity IS 'Opportunity identification and analysis module';
COMMENT ON SCHEMA add_venture IS 'Venture creation and planning module';
COMMENT ON SCHEMA brand_aid IS 'Brand development and naming module';
COMMENT ON SCHEMA builder IS 'Product development and technical planning module';
COMMENT ON SCHEMA gtm IS 'Go-to-market strategy and campaign management module';
COMMENT ON SCHEMA startup_ops IS 'Operational health and performance monitoring module';
COMMENT ON SCHEMA portfolio IS 'Portfolio management and governance module';
COMMENT ON SCHEMA bruce_memory IS 'Knowledge management and pattern recognition module';

-- Mark migration as complete
UPDATE migrations SET execution_time_ms = EXTRACT(MILLISECOND FROM (CURRENT_TIMESTAMP - (SELECT applied_at FROM migrations WHERE name = '001_init')))::INTEGER WHERE name = '001_init';
