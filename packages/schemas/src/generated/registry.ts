/* eslint-disable */
// auto-generated from modules/*/agents/*/{input,output}.schema.json; run pnpm --filter @bruce/schemas generate

import type { z } from 'zod';
import { BriefingInterpreterInputSchema as AddVentureBriefingInterpreterInputSchema } from './agents/add-venture/briefing-interpreter/input.js';
import { BriefingInterpreterOutputSchema as AddVentureBriefingInterpreterOutputSchema } from './agents/add-venture/briefing-interpreter/output.js';
import { BusinessModelModelerInputSchema as AddVentureBusinessModelModelerInputSchema } from './agents/add-venture/business-model-modeler/input.js';
import { BusinessModelModelerOutputSchema as AddVentureBusinessModelModelerOutputSchema } from './agents/add-venture/business-model-modeler/output.js';
import { CustomerMarketArchitectInputSchema as AddVentureCustomerMarketArchitectInputSchema } from './agents/add-venture/customer-market-architect/input.js';
import { CustomerMarketArchitectOutputSchema as AddVentureCustomerMarketArchitectOutputSchema } from './agents/add-venture/customer-market-architect/output.js';
import { DossierComposerInputSchema as AddVentureDossierComposerInputSchema } from './agents/add-venture/dossier-composer/input.js';
import { DossierComposerOutputSchema as AddVentureDossierComposerOutputSchema } from './agents/add-venture/dossier-composer/output.js';
import { ExecutionRoadmapPlannerInputSchema as AddVentureExecutionRoadmapPlannerInputSchema } from './agents/add-venture/execution-roadmap-planner/input.js';
import { ExecutionRoadmapPlannerOutputSchema as AddVentureExecutionRoadmapPlannerOutputSchema } from './agents/add-venture/execution-roadmap-planner/output.js';
import { GtmPlannerInputSchema as AddVentureGtmPlannerInputSchema } from './agents/add-venture/gtm-planner/input.js';
import { GtmPlannerOutputSchema as AddVentureGtmPlannerOutputSchema } from './agents/add-venture/gtm-planner/output.js';
import { NarrativeStrategistInputSchema as AddVentureNarrativeStrategistInputSchema } from './agents/add-venture/narrative-strategist/input.js';
import { NarrativeStrategistOutputSchema as AddVentureNarrativeStrategistOutputSchema } from './agents/add-venture/narrative-strategist/output.js';
import { OpportunityAnalystVol1InputSchema as AddVentureOpportunityAnalystVol1InputSchema } from './agents/add-venture/opportunity-analyst-vol1/input.js';
import { OpportunityAnalystVol1OutputSchema as AddVentureOpportunityAnalystVol1OutputSchema } from './agents/add-venture/opportunity-analyst-vol1/output.js';
import { RiskValidationAnalystInputSchema as AddVentureRiskValidationAnalystInputSchema } from './agents/add-venture/risk-validation-analyst/input.js';
import { RiskValidationAnalystOutputSchema as AddVentureRiskValidationAnalystOutputSchema } from './agents/add-venture/risk-validation-analyst/output.js';
import { ValuePropositionDesignerInputSchema as AddVentureValuePropositionDesignerInputSchema } from './agents/add-venture/value-proposition-designer/input.js';
import { ValuePropositionDesignerOutputSchema as AddVentureValuePropositionDesignerOutputSchema } from './agents/add-venture/value-proposition-designer/output.js';
import { VentureCriticInputSchema as AddVentureVentureCriticInputSchema } from './agents/add-venture/venture-critic/input.js';
import { VentureCriticOutputSchema as AddVentureVentureCriticOutputSchema } from './agents/add-venture/venture-critic/output.js';
import { HandoffSynthesizerInputSchema as BootstrapHandoffSynthesizerInputSchema } from './agents/bootstrap/handoff-synthesizer/input.js';
import { HandoffSynthesizerOutputSchema as BootstrapHandoffSynthesizerOutputSchema } from './agents/bootstrap/handoff-synthesizer/output.js';
import { BrandBookComposerInputSchema as BrandAidBrandBookComposerInputSchema } from './agents/brand-aid/brand-book-composer/input.js';
import { BrandBookComposerOutputSchema as BrandAidBrandBookComposerOutputSchema } from './agents/brand-aid/brand-book-composer/output.js';
import { BrandCriticInputSchema as BrandAidBrandCriticInputSchema } from './agents/brand-aid/brand-critic/input.js';
import { BrandCriticOutputSchema as BrandAidBrandCriticOutputSchema } from './agents/brand-aid/brand-critic/output.js';
import { BrandStrategistInputSchema as BrandAidBrandStrategistInputSchema } from './agents/brand-aid/brand-strategist/input.js';
import { BrandStrategistOutputSchema as BrandAidBrandStrategistOutputSchema } from './agents/brand-aid/brand-strategist/output.js';
import { CreativeDirectorInputSchema as BrandAidCreativeDirectorInputSchema } from './agents/brand-aid/creative-director/input.js';
import { CreativeDirectorOutputSchema as BrandAidCreativeDirectorOutputSchema } from './agents/brand-aid/creative-director/output.js';
import { LogoDesignerInputSchema as BrandAidLogoDesignerInputSchema } from './agents/brand-aid/logo-designer/input.js';
import { LogoDesignerOutputSchema as BrandAidLogoDesignerOutputSchema } from './agents/brand-aid/logo-designer/output.js';
import { MarketAnalystInputSchema as BrandAidMarketAnalystInputSchema } from './agents/brand-aid/market-analyst/input.js';
import { MarketAnalystOutputSchema as BrandAidMarketAnalystOutputSchema } from './agents/brand-aid/market-analyst/output.js';
import { NamingAgentInputSchema as BrandAidNamingAgentInputSchema } from './agents/brand-aid/naming-agent/input.js';
import { NamingAgentOutputSchema as BrandAidNamingAgentOutputSchema } from './agents/brand-aid/naming-agent/output.js';
import { VisualSystemDesignerInputSchema as BrandAidVisualSystemDesignerInputSchema } from './agents/brand-aid/visual-system-designer/input.js';
import { VisualSystemDesignerOutputSchema as BrandAidVisualSystemDesignerOutputSchema } from './agents/brand-aid/visual-system-designer/output.js';
import { GateEnforcerInputSchema as BruceCoreGateEnforcerInputSchema } from './agents/bruce-core/gate-enforcer/input.js';
import { GateEnforcerOutputSchema as BruceCoreGateEnforcerOutputSchema } from './agents/bruce-core/gate-enforcer/output.js';
import { GovernanceAgentInputSchema as BruceCoreGovernanceAgentInputSchema } from './agents/bruce-core/governance-agent/input.js';
import { GovernanceAgentOutputSchema as BruceCoreGovernanceAgentOutputSchema } from './agents/bruce-core/governance-agent/output.js';
import { ModuleDispatcherInputSchema as BruceCoreModuleDispatcherInputSchema } from './agents/bruce-core/module-dispatcher/input.js';
import { ModuleDispatcherOutputSchema as BruceCoreModuleDispatcherOutputSchema } from './agents/bruce-core/module-dispatcher/output.js';
import { VentureLifecycleManagerInputSchema as BruceCoreVentureLifecycleManagerInputSchema } from './agents/bruce-core/venture-lifecycle-manager/input.js';
import { VentureLifecycleManagerOutputSchema as BruceCoreVentureLifecycleManagerOutputSchema } from './agents/bruce-core/venture-lifecycle-manager/output.js';
import { CrossVentureAnalystInputSchema as BruceMemoryCrossVentureAnalystInputSchema } from './agents/bruce-memory/cross-venture-analyst/input.js';
import { CrossVentureAnalystOutputSchema as BruceMemoryCrossVentureAnalystOutputSchema } from './agents/bruce-memory/cross-venture-analyst/output.js';
import { IntelligenceSynthesizerInputSchema as BruceMemoryIntelligenceSynthesizerInputSchema } from './agents/bruce-memory/intelligence-synthesizer/input.js';
import { IntelligenceSynthesizerOutputSchema as BruceMemoryIntelligenceSynthesizerOutputSchema } from './agents/bruce-memory/intelligence-synthesizer/output.js';
import { LearningIngestionAgentInputSchema as BruceMemoryLearningIngestionAgentInputSchema } from './agents/bruce-memory/learning-ingestion-agent/input.js';
import { LearningIngestionAgentOutputSchema as BruceMemoryLearningIngestionAgentOutputSchema } from './agents/bruce-memory/learning-ingestion-agent/output.js';
import { PatternExtractorInputSchema as BruceMemoryPatternExtractorInputSchema } from './agents/bruce-memory/pattern-extractor/input.js';
import { PatternExtractorOutputSchema as BruceMemoryPatternExtractorOutputSchema } from './agents/bruce-memory/pattern-extractor/output.js';
import { QueryAgentInputSchema as BruceMemoryQueryAgentInputSchema } from './agents/bruce-memory/query-agent/input.js';
import { QueryAgentOutputSchema as BruceMemoryQueryAgentOutputSchema } from './agents/bruce-memory/query-agent/output.js';
import { BackendAgentInputSchema as BuilderBackendAgentInputSchema } from './agents/builder/backend-agent/input.js';
import { BackendAgentOutputSchema as BuilderBackendAgentOutputSchema } from './agents/builder/backend-agent/output.js';
import { FrontendAgentInputSchema as BuilderFrontendAgentInputSchema } from './agents/builder/frontend-agent/input.js';
import { FrontendAgentOutputSchema as BuilderFrontendAgentOutputSchema } from './agents/builder/frontend-agent/output.js';
import { GovernanceAgentInputSchema as BuilderGovernanceAgentInputSchema } from './agents/builder/governance-agent/input.js';
import { GovernanceAgentOutputSchema as BuilderGovernanceAgentOutputSchema } from './agents/builder/governance-agent/output.js';
import { IntegrationAgentInputSchema as BuilderIntegrationAgentInputSchema } from './agents/builder/integration-agent/input.js';
import { IntegrationAgentOutputSchema as BuilderIntegrationAgentOutputSchema } from './agents/builder/integration-agent/output.js';
import { ProductValidatorInputSchema as BuilderProductValidatorInputSchema } from './agents/builder/product-validator/input.js';
import { ProductValidatorOutputSchema as BuilderProductValidatorOutputSchema } from './agents/builder/product-validator/output.js';
import { QaAgentInputSchema as BuilderQaAgentInputSchema } from './agents/builder/qa-agent/input.js';
import { QaAgentOutputSchema as BuilderQaAgentOutputSchema } from './agents/builder/qa-agent/output.js';
import { SecurityAgentInputSchema as BuilderSecurityAgentInputSchema } from './agents/builder/security-agent/input.js';
import { SecurityAgentOutputSchema as BuilderSecurityAgentOutputSchema } from './agents/builder/security-agent/output.js';
import { SolutionArchitectInputSchema as BuilderSolutionArchitectInputSchema } from './agents/builder/solution-architect/input.js';
import { SolutionArchitectOutputSchema as BuilderSolutionArchitectOutputSchema } from './agents/builder/solution-architect/output.js';
import { UxBddAgentInputSchema as BuilderUxBddAgentInputSchema } from './agents/builder/ux-bdd-agent/input.js';
import { UxBddAgentOutputSchema as BuilderUxBddAgentOutputSchema } from './agents/builder/ux-bdd-agent/output.js';
import { AnalyticsAgentInputSchema as GtmAnalyticsAgentInputSchema } from './agents/gtm/analytics-agent/input.js';
import { AnalyticsAgentOutputSchema as GtmAnalyticsAgentOutputSchema } from './agents/gtm/analytics-agent/output.js';
import { CampaignManagerInputSchema as GtmCampaignManagerInputSchema } from './agents/gtm/campaign-manager/input.js';
import { CampaignManagerOutputSchema as GtmCampaignManagerOutputSchema } from './agents/gtm/campaign-manager/output.js';
import { ChannelStrategistInputSchema as GtmChannelStrategistInputSchema } from './agents/gtm/channel-strategist/input.js';
import { ChannelStrategistOutputSchema as GtmChannelStrategistOutputSchema } from './agents/gtm/channel-strategist/output.js';
import { ContentSystemAgentInputSchema as GtmContentSystemAgentInputSchema } from './agents/gtm/content-system-agent/input.js';
import { ContentSystemAgentOutputSchema as GtmContentSystemAgentOutputSchema } from './agents/gtm/content-system-agent/output.js';
import { GrowthExperimenterInputSchema as GtmGrowthExperimenterInputSchema } from './agents/gtm/growth-experimenter/input.js';
import { GrowthExperimenterOutputSchema as GtmGrowthExperimenterOutputSchema } from './agents/gtm/growth-experimenter/output.js';
import { WeeklyGovernanceAgentInputSchema as GtmWeeklyGovernanceAgentInputSchema } from './agents/gtm/weekly-governance-agent/input.js';
import { WeeklyGovernanceAgentOutputSchema as GtmWeeklyGovernanceAgentOutputSchema } from './agents/gtm/weekly-governance-agent/output.js';
import { MarketScannerInputSchema as OpportunityMarketScannerInputSchema } from './agents/opportunity/market-scanner/input.js';
import { MarketScannerOutputSchema as OpportunityMarketScannerOutputSchema } from './agents/opportunity/market-scanner/output.js';
import { OpportunityAnalystInputSchema as OpportunityOpportunityAnalystInputSchema } from './agents/opportunity/opportunity-analyst/input.js';
import { OpportunityAnalystOutputSchema as OpportunityOpportunityAnalystOutputSchema } from './agents/opportunity/opportunity-analyst/output.js';
import { PrioritizationAgentInputSchema as OpportunityPrioritizationAgentInputSchema } from './agents/opportunity/prioritization-agent/input.js';
import { PrioritizationAgentOutputSchema as OpportunityPrioritizationAgentOutputSchema } from './agents/opportunity/prioritization-agent/output.js';
import { ScoringAgentInputSchema as OpportunityScoringAgentInputSchema } from './agents/opportunity/scoring-agent/input.js';
import { ScoringAgentOutputSchema as OpportunityScoringAgentOutputSchema } from './agents/opportunity/scoring-agent/output.js';
import { AllocationAgentInputSchema as PortfolioAllocationAgentInputSchema } from './agents/portfolio/allocation-agent/input.js';
import { AllocationAgentOutputSchema as PortfolioAllocationAgentOutputSchema } from './agents/portfolio/allocation-agent/output.js';
import { GovernanceDecisionAgentInputSchema as PortfolioGovernanceDecisionAgentInputSchema } from './agents/portfolio/governance-decision-agent/input.js';
import { GovernanceDecisionAgentOutputSchema as PortfolioGovernanceDecisionAgentOutputSchema } from './agents/portfolio/governance-decision-agent/output.js';
import { PortfolioAnalystInputSchema as PortfolioPortfolioAnalystInputSchema } from './agents/portfolio/portfolio-analyst/input.js';
import { PortfolioAnalystOutputSchema as PortfolioPortfolioAnalystOutputSchema } from './agents/portfolio/portfolio-analyst/output.js';
import { PortfolioReporterInputSchema as PortfolioPortfolioReporterInputSchema } from './agents/portfolio/portfolio-reporter/input.js';
import { PortfolioReporterOutputSchema as PortfolioPortfolioReporterOutputSchema } from './agents/portfolio/portfolio-reporter/output.js';
import { RiskMonitorInputSchema as PortfolioRiskMonitorInputSchema } from './agents/portfolio/risk-monitor/input.js';
import { RiskMonitorOutputSchema as PortfolioRiskMonitorOutputSchema } from './agents/portfolio/risk-monitor/output.js';
import { AnomalyDetectorInputSchema as StartupOpsAnomalyDetectorInputSchema } from './agents/startup-ops/anomaly-detector/input.js';
import { AnomalyDetectorOutputSchema as StartupOpsAnomalyDetectorOutputSchema } from './agents/startup-ops/anomaly-detector/output.js';
import { HealthScoringAgentInputSchema as StartupOpsHealthScoringAgentInputSchema } from './agents/startup-ops/health-scoring-agent/input.js';
import { HealthScoringAgentOutputSchema as StartupOpsHealthScoringAgentOutputSchema } from './agents/startup-ops/health-scoring-agent/output.js';
import { MetricsIngestionAgentInputSchema as StartupOpsMetricsIngestionAgentInputSchema } from './agents/startup-ops/metrics-ingestion-agent/input.js';
import { MetricsIngestionAgentOutputSchema as StartupOpsMetricsIngestionAgentOutputSchema } from './agents/startup-ops/metrics-ingestion-agent/output.js';
import { OpsAdvisorInputSchema as StartupOpsOpsAdvisorInputSchema } from './agents/startup-ops/ops-advisor/input.js';
import { OpsAdvisorOutputSchema as StartupOpsOpsAdvisorOutputSchema } from './agents/startup-ops/ops-advisor/output.js';
import { WeeklyOpsReporterInputSchema as StartupOpsWeeklyOpsReporterInputSchema } from './agents/startup-ops/weekly-ops-reporter/input.js';
import { WeeklyOpsReporterOutputSchema as StartupOpsWeeklyOpsReporterOutputSchema } from './agents/startup-ops/weekly-ops-reporter/output.js';

export interface AgentSchemaRegistryEntry {
  module: string;
  agentId: string;
  inputSchema: z.ZodTypeAny;
  outputSchema: z.ZodTypeAny;
  skillPath: string;
  constraintsPath: string;
  capabilitiesPath: string;
  toolsPath: string;
}

export const agentSchemaRegistry = [
  {
    module: "add-venture",
    agentId: "briefing-interpreter",
    inputSchema: AddVentureBriefingInterpreterInputSchema,
    outputSchema: AddVentureBriefingInterpreterOutputSchema,
    skillPath: "add-venture/agents/briefing-interpreter/SKILL.md",
    constraintsPath: "add-venture/agents/briefing-interpreter/constraints.md",
    capabilitiesPath: "add-venture/agents/briefing-interpreter/capabilities.json",
    toolsPath: "add-venture/agents/briefing-interpreter/tools.json",
  },
  {
    module: "add-venture",
    agentId: "business-model-modeler",
    inputSchema: AddVentureBusinessModelModelerInputSchema,
    outputSchema: AddVentureBusinessModelModelerOutputSchema,
    skillPath: "add-venture/agents/business-model-modeler/SKILL.md",
    constraintsPath: "add-venture/agents/business-model-modeler/constraints.md",
    capabilitiesPath: "add-venture/agents/business-model-modeler/capabilities.json",
    toolsPath: "add-venture/agents/business-model-modeler/tools.json",
  },
  {
    module: "add-venture",
    agentId: "customer-market-architect",
    inputSchema: AddVentureCustomerMarketArchitectInputSchema,
    outputSchema: AddVentureCustomerMarketArchitectOutputSchema,
    skillPath: "add-venture/agents/customer-market-architect/SKILL.md",
    constraintsPath: "add-venture/agents/customer-market-architect/constraints.md",
    capabilitiesPath: "add-venture/agents/customer-market-architect/capabilities.json",
    toolsPath: "add-venture/agents/customer-market-architect/tools.json",
  },
  {
    module: "add-venture",
    agentId: "dossier-composer",
    inputSchema: AddVentureDossierComposerInputSchema,
    outputSchema: AddVentureDossierComposerOutputSchema,
    skillPath: "add-venture/agents/dossier-composer/SKILL.md",
    constraintsPath: "add-venture/agents/dossier-composer/constraints.md",
    capabilitiesPath: "add-venture/agents/dossier-composer/capabilities.json",
    toolsPath: "add-venture/agents/dossier-composer/tools.json",
  },
  {
    module: "add-venture",
    agentId: "execution-roadmap-planner",
    inputSchema: AddVentureExecutionRoadmapPlannerInputSchema,
    outputSchema: AddVentureExecutionRoadmapPlannerOutputSchema,
    skillPath: "add-venture/agents/execution-roadmap-planner/SKILL.md",
    constraintsPath: "add-venture/agents/execution-roadmap-planner/constraints.md",
    capabilitiesPath: "add-venture/agents/execution-roadmap-planner/capabilities.json",
    toolsPath: "add-venture/agents/execution-roadmap-planner/tools.json",
  },
  {
    module: "add-venture",
    agentId: "gtm-planner",
    inputSchema: AddVentureGtmPlannerInputSchema,
    outputSchema: AddVentureGtmPlannerOutputSchema,
    skillPath: "add-venture/agents/gtm-planner/SKILL.md",
    constraintsPath: "add-venture/agents/gtm-planner/constraints.md",
    capabilitiesPath: "add-venture/agents/gtm-planner/capabilities.json",
    toolsPath: "add-venture/agents/gtm-planner/tools.json",
  },
  {
    module: "add-venture",
    agentId: "narrative-strategist",
    inputSchema: AddVentureNarrativeStrategistInputSchema,
    outputSchema: AddVentureNarrativeStrategistOutputSchema,
    skillPath: "add-venture/agents/narrative-strategist/SKILL.md",
    constraintsPath: "add-venture/agents/narrative-strategist/constraints.md",
    capabilitiesPath: "add-venture/agents/narrative-strategist/capabilities.json",
    toolsPath: "add-venture/agents/narrative-strategist/tools.json",
  },
  {
    module: "add-venture",
    agentId: "opportunity-analyst-vol1",
    inputSchema: AddVentureOpportunityAnalystVol1InputSchema,
    outputSchema: AddVentureOpportunityAnalystVol1OutputSchema,
    skillPath: "add-venture/agents/opportunity-analyst-vol1/SKILL.md",
    constraintsPath: "add-venture/agents/opportunity-analyst-vol1/constraints.md",
    capabilitiesPath: "add-venture/agents/opportunity-analyst-vol1/capabilities.json",
    toolsPath: "add-venture/agents/opportunity-analyst-vol1/tools.json",
  },
  {
    module: "add-venture",
    agentId: "risk-validation-analyst",
    inputSchema: AddVentureRiskValidationAnalystInputSchema,
    outputSchema: AddVentureRiskValidationAnalystOutputSchema,
    skillPath: "add-venture/agents/risk-validation-analyst/SKILL.md",
    constraintsPath: "add-venture/agents/risk-validation-analyst/constraints.md",
    capabilitiesPath: "add-venture/agents/risk-validation-analyst/capabilities.json",
    toolsPath: "add-venture/agents/risk-validation-analyst/tools.json",
  },
  {
    module: "add-venture",
    agentId: "value-proposition-designer",
    inputSchema: AddVentureValuePropositionDesignerInputSchema,
    outputSchema: AddVentureValuePropositionDesignerOutputSchema,
    skillPath: "add-venture/agents/value-proposition-designer/SKILL.md",
    constraintsPath: "add-venture/agents/value-proposition-designer/constraints.md",
    capabilitiesPath: "add-venture/agents/value-proposition-designer/capabilities.json",
    toolsPath: "add-venture/agents/value-proposition-designer/tools.json",
  },
  {
    module: "add-venture",
    agentId: "venture-critic",
    inputSchema: AddVentureVentureCriticInputSchema,
    outputSchema: AddVentureVentureCriticOutputSchema,
    skillPath: "add-venture/agents/venture-critic/SKILL.md",
    constraintsPath: "add-venture/agents/venture-critic/constraints.md",
    capabilitiesPath: "add-venture/agents/venture-critic/capabilities.json",
    toolsPath: "add-venture/agents/venture-critic/tools.json",
  },
  {
    module: "bootstrap",
    agentId: "handoff-synthesizer",
    inputSchema: BootstrapHandoffSynthesizerInputSchema,
    outputSchema: BootstrapHandoffSynthesizerOutputSchema,
    skillPath: "bootstrap/agents/handoff-synthesizer/SKILL.md",
    constraintsPath: "bootstrap/agents/handoff-synthesizer/constraints.md",
    capabilitiesPath: "bootstrap/agents/handoff-synthesizer/capabilities.json",
    toolsPath: "bootstrap/agents/handoff-synthesizer/tools.json",
  },
  {
    module: "brand-aid",
    agentId: "brand-book-composer",
    inputSchema: BrandAidBrandBookComposerInputSchema,
    outputSchema: BrandAidBrandBookComposerOutputSchema,
    skillPath: "brand-aid/agents/brand-book-composer/SKILL.md",
    constraintsPath: "brand-aid/agents/brand-book-composer/constraints.md",
    capabilitiesPath: "brand-aid/agents/brand-book-composer/capabilities.json",
    toolsPath: "brand-aid/agents/brand-book-composer/tools.json",
  },
  {
    module: "brand-aid",
    agentId: "brand-critic",
    inputSchema: BrandAidBrandCriticInputSchema,
    outputSchema: BrandAidBrandCriticOutputSchema,
    skillPath: "brand-aid/agents/brand-critic/SKILL.md",
    constraintsPath: "brand-aid/agents/brand-critic/constraints.md",
    capabilitiesPath: "brand-aid/agents/brand-critic/capabilities.json",
    toolsPath: "brand-aid/agents/brand-critic/tools.json",
  },
  {
    module: "brand-aid",
    agentId: "brand-strategist",
    inputSchema: BrandAidBrandStrategistInputSchema,
    outputSchema: BrandAidBrandStrategistOutputSchema,
    skillPath: "brand-aid/agents/brand-strategist/SKILL.md",
    constraintsPath: "brand-aid/agents/brand-strategist/constraints.md",
    capabilitiesPath: "brand-aid/agents/brand-strategist/capabilities.json",
    toolsPath: "brand-aid/agents/brand-strategist/tools.json",
  },
  {
    module: "brand-aid",
    agentId: "creative-director",
    inputSchema: BrandAidCreativeDirectorInputSchema,
    outputSchema: BrandAidCreativeDirectorOutputSchema,
    skillPath: "brand-aid/agents/creative-director/SKILL.md",
    constraintsPath: "brand-aid/agents/creative-director/constraints.md",
    capabilitiesPath: "brand-aid/agents/creative-director/capabilities.json",
    toolsPath: "brand-aid/agents/creative-director/tools.json",
  },
  {
    module: "brand-aid",
    agentId: "logo-designer",
    inputSchema: BrandAidLogoDesignerInputSchema,
    outputSchema: BrandAidLogoDesignerOutputSchema,
    skillPath: "brand-aid/agents/logo-designer/SKILL.md",
    constraintsPath: "brand-aid/agents/logo-designer/constraints.md",
    capabilitiesPath: "brand-aid/agents/logo-designer/capabilities.json",
    toolsPath: "brand-aid/agents/logo-designer/tools.json",
  },
  {
    module: "brand-aid",
    agentId: "market-analyst",
    inputSchema: BrandAidMarketAnalystInputSchema,
    outputSchema: BrandAidMarketAnalystOutputSchema,
    skillPath: "brand-aid/agents/market-analyst/SKILL.md",
    constraintsPath: "brand-aid/agents/market-analyst/constraints.md",
    capabilitiesPath: "brand-aid/agents/market-analyst/capabilities.json",
    toolsPath: "brand-aid/agents/market-analyst/tools.json",
  },
  {
    module: "brand-aid",
    agentId: "naming-agent",
    inputSchema: BrandAidNamingAgentInputSchema,
    outputSchema: BrandAidNamingAgentOutputSchema,
    skillPath: "brand-aid/agents/naming-agent/SKILL.md",
    constraintsPath: "brand-aid/agents/naming-agent/constraints.md",
    capabilitiesPath: "brand-aid/agents/naming-agent/capabilities.json",
    toolsPath: "brand-aid/agents/naming-agent/tools.json",
  },
  {
    module: "brand-aid",
    agentId: "visual-system-designer",
    inputSchema: BrandAidVisualSystemDesignerInputSchema,
    outputSchema: BrandAidVisualSystemDesignerOutputSchema,
    skillPath: "brand-aid/agents/visual-system-designer/SKILL.md",
    constraintsPath: "brand-aid/agents/visual-system-designer/constraints.md",
    capabilitiesPath: "brand-aid/agents/visual-system-designer/capabilities.json",
    toolsPath: "brand-aid/agents/visual-system-designer/tools.json",
  },
  {
    module: "bruce-core",
    agentId: "gate-enforcer",
    inputSchema: BruceCoreGateEnforcerInputSchema,
    outputSchema: BruceCoreGateEnforcerOutputSchema,
    skillPath: "bruce-core/agents/gate-enforcer/SKILL.md",
    constraintsPath: "bruce-core/agents/gate-enforcer/constraints.md",
    capabilitiesPath: "bruce-core/agents/gate-enforcer/capabilities.json",
    toolsPath: "bruce-core/agents/gate-enforcer/tools.json",
  },
  {
    module: "bruce-core",
    agentId: "governance-agent",
    inputSchema: BruceCoreGovernanceAgentInputSchema,
    outputSchema: BruceCoreGovernanceAgentOutputSchema,
    skillPath: "bruce-core/agents/governance-agent/SKILL.md",
    constraintsPath: "bruce-core/agents/governance-agent/constraints.md",
    capabilitiesPath: "bruce-core/agents/governance-agent/capabilities.json",
    toolsPath: "bruce-core/agents/governance-agent/tools.json",
  },
  {
    module: "bruce-core",
    agentId: "module-dispatcher",
    inputSchema: BruceCoreModuleDispatcherInputSchema,
    outputSchema: BruceCoreModuleDispatcherOutputSchema,
    skillPath: "bruce-core/agents/module-dispatcher/SKILL.md",
    constraintsPath: "bruce-core/agents/module-dispatcher/constraints.md",
    capabilitiesPath: "bruce-core/agents/module-dispatcher/capabilities.json",
    toolsPath: "bruce-core/agents/module-dispatcher/tools.json",
  },
  {
    module: "bruce-core",
    agentId: "venture-lifecycle-manager",
    inputSchema: BruceCoreVentureLifecycleManagerInputSchema,
    outputSchema: BruceCoreVentureLifecycleManagerOutputSchema,
    skillPath: "bruce-core/agents/venture-lifecycle-manager/SKILL.md",
    constraintsPath: "bruce-core/agents/venture-lifecycle-manager/constraints.md",
    capabilitiesPath: "bruce-core/agents/venture-lifecycle-manager/capabilities.json",
    toolsPath: "bruce-core/agents/venture-lifecycle-manager/tools.json",
  },
  {
    module: "bruce-memory",
    agentId: "cross-venture-analyst",
    inputSchema: BruceMemoryCrossVentureAnalystInputSchema,
    outputSchema: BruceMemoryCrossVentureAnalystOutputSchema,
    skillPath: "bruce-memory/agents/cross-venture-analyst/SKILL.md",
    constraintsPath: "bruce-memory/agents/cross-venture-analyst/constraints.md",
    capabilitiesPath: "bruce-memory/agents/cross-venture-analyst/capabilities.json",
    toolsPath: "bruce-memory/agents/cross-venture-analyst/tools.json",
  },
  {
    module: "bruce-memory",
    agentId: "intelligence-synthesizer",
    inputSchema: BruceMemoryIntelligenceSynthesizerInputSchema,
    outputSchema: BruceMemoryIntelligenceSynthesizerOutputSchema,
    skillPath: "bruce-memory/agents/intelligence-synthesizer/SKILL.md",
    constraintsPath: "bruce-memory/agents/intelligence-synthesizer/constraints.md",
    capabilitiesPath: "bruce-memory/agents/intelligence-synthesizer/capabilities.json",
    toolsPath: "bruce-memory/agents/intelligence-synthesizer/tools.json",
  },
  {
    module: "bruce-memory",
    agentId: "learning-ingestion-agent",
    inputSchema: BruceMemoryLearningIngestionAgentInputSchema,
    outputSchema: BruceMemoryLearningIngestionAgentOutputSchema,
    skillPath: "bruce-memory/agents/learning-ingestion-agent/SKILL.md",
    constraintsPath: "bruce-memory/agents/learning-ingestion-agent/constraints.md",
    capabilitiesPath: "bruce-memory/agents/learning-ingestion-agent/capabilities.json",
    toolsPath: "bruce-memory/agents/learning-ingestion-agent/tools.json",
  },
  {
    module: "bruce-memory",
    agentId: "pattern-extractor",
    inputSchema: BruceMemoryPatternExtractorInputSchema,
    outputSchema: BruceMemoryPatternExtractorOutputSchema,
    skillPath: "bruce-memory/agents/pattern-extractor/SKILL.md",
    constraintsPath: "bruce-memory/agents/pattern-extractor/constraints.md",
    capabilitiesPath: "bruce-memory/agents/pattern-extractor/capabilities.json",
    toolsPath: "bruce-memory/agents/pattern-extractor/tools.json",
  },
  {
    module: "bruce-memory",
    agentId: "query-agent",
    inputSchema: BruceMemoryQueryAgentInputSchema,
    outputSchema: BruceMemoryQueryAgentOutputSchema,
    skillPath: "bruce-memory/agents/query-agent/SKILL.md",
    constraintsPath: "bruce-memory/agents/query-agent/constraints.md",
    capabilitiesPath: "bruce-memory/agents/query-agent/capabilities.json",
    toolsPath: "bruce-memory/agents/query-agent/tools.json",
  },
  {
    module: "builder",
    agentId: "backend-agent",
    inputSchema: BuilderBackendAgentInputSchema,
    outputSchema: BuilderBackendAgentOutputSchema,
    skillPath: "builder/agents/backend-agent/SKILL.md",
    constraintsPath: "builder/agents/backend-agent/constraints.md",
    capabilitiesPath: "builder/agents/backend-agent/capabilities.json",
    toolsPath: "builder/agents/backend-agent/tools.json",
  },
  {
    module: "builder",
    agentId: "frontend-agent",
    inputSchema: BuilderFrontendAgentInputSchema,
    outputSchema: BuilderFrontendAgentOutputSchema,
    skillPath: "builder/agents/frontend-agent/SKILL.md",
    constraintsPath: "builder/agents/frontend-agent/constraints.md",
    capabilitiesPath: "builder/agents/frontend-agent/capabilities.json",
    toolsPath: "builder/agents/frontend-agent/tools.json",
  },
  {
    module: "builder",
    agentId: "governance-agent",
    inputSchema: BuilderGovernanceAgentInputSchema,
    outputSchema: BuilderGovernanceAgentOutputSchema,
    skillPath: "builder/agents/governance-agent/SKILL.md",
    constraintsPath: "builder/agents/governance-agent/constraints.md",
    capabilitiesPath: "builder/agents/governance-agent/capabilities.json",
    toolsPath: "builder/agents/governance-agent/tools.json",
  },
  {
    module: "builder",
    agentId: "integration-agent",
    inputSchema: BuilderIntegrationAgentInputSchema,
    outputSchema: BuilderIntegrationAgentOutputSchema,
    skillPath: "builder/agents/integration-agent/SKILL.md",
    constraintsPath: "builder/agents/integration-agent/constraints.md",
    capabilitiesPath: "builder/agents/integration-agent/capabilities.json",
    toolsPath: "builder/agents/integration-agent/tools.json",
  },
  {
    module: "builder",
    agentId: "product-validator",
    inputSchema: BuilderProductValidatorInputSchema,
    outputSchema: BuilderProductValidatorOutputSchema,
    skillPath: "builder/agents/product-validator/SKILL.md",
    constraintsPath: "builder/agents/product-validator/constraints.md",
    capabilitiesPath: "builder/agents/product-validator/capabilities.json",
    toolsPath: "builder/agents/product-validator/tools.json",
  },
  {
    module: "builder",
    agentId: "qa-agent",
    inputSchema: BuilderQaAgentInputSchema,
    outputSchema: BuilderQaAgentOutputSchema,
    skillPath: "builder/agents/qa-agent/SKILL.md",
    constraintsPath: "builder/agents/qa-agent/constraints.md",
    capabilitiesPath: "builder/agents/qa-agent/capabilities.json",
    toolsPath: "builder/agents/qa-agent/tools.json",
  },
  {
    module: "builder",
    agentId: "security-agent",
    inputSchema: BuilderSecurityAgentInputSchema,
    outputSchema: BuilderSecurityAgentOutputSchema,
    skillPath: "builder/agents/security-agent/SKILL.md",
    constraintsPath: "builder/agents/security-agent/constraints.md",
    capabilitiesPath: "builder/agents/security-agent/capabilities.json",
    toolsPath: "builder/agents/security-agent/tools.json",
  },
  {
    module: "builder",
    agentId: "solution-architect",
    inputSchema: BuilderSolutionArchitectInputSchema,
    outputSchema: BuilderSolutionArchitectOutputSchema,
    skillPath: "builder/agents/solution-architect/SKILL.md",
    constraintsPath: "builder/agents/solution-architect/constraints.md",
    capabilitiesPath: "builder/agents/solution-architect/capabilities.json",
    toolsPath: "builder/agents/solution-architect/tools.json",
  },
  {
    module: "builder",
    agentId: "ux-bdd-agent",
    inputSchema: BuilderUxBddAgentInputSchema,
    outputSchema: BuilderUxBddAgentOutputSchema,
    skillPath: "builder/agents/ux-bdd-agent/SKILL.md",
    constraintsPath: "builder/agents/ux-bdd-agent/constraints.md",
    capabilitiesPath: "builder/agents/ux-bdd-agent/capabilities.json",
    toolsPath: "builder/agents/ux-bdd-agent/tools.json",
  },
  {
    module: "gtm",
    agentId: "analytics-agent",
    inputSchema: GtmAnalyticsAgentInputSchema,
    outputSchema: GtmAnalyticsAgentOutputSchema,
    skillPath: "gtm/agents/analytics-agent/SKILL.md",
    constraintsPath: "gtm/agents/analytics-agent/constraints.md",
    capabilitiesPath: "gtm/agents/analytics-agent/capabilities.json",
    toolsPath: "gtm/agents/analytics-agent/tools.json",
  },
  {
    module: "gtm",
    agentId: "campaign-manager",
    inputSchema: GtmCampaignManagerInputSchema,
    outputSchema: GtmCampaignManagerOutputSchema,
    skillPath: "gtm/agents/campaign-manager/SKILL.md",
    constraintsPath: "gtm/agents/campaign-manager/constraints.md",
    capabilitiesPath: "gtm/agents/campaign-manager/capabilities.json",
    toolsPath: "gtm/agents/campaign-manager/tools.json",
  },
  {
    module: "gtm",
    agentId: "channel-strategist",
    inputSchema: GtmChannelStrategistInputSchema,
    outputSchema: GtmChannelStrategistOutputSchema,
    skillPath: "gtm/agents/channel-strategist/SKILL.md",
    constraintsPath: "gtm/agents/channel-strategist/constraints.md",
    capabilitiesPath: "gtm/agents/channel-strategist/capabilities.json",
    toolsPath: "gtm/agents/channel-strategist/tools.json",
  },
  {
    module: "gtm",
    agentId: "content-system-agent",
    inputSchema: GtmContentSystemAgentInputSchema,
    outputSchema: GtmContentSystemAgentOutputSchema,
    skillPath: "gtm/agents/content-system-agent/SKILL.md",
    constraintsPath: "gtm/agents/content-system-agent/constraints.md",
    capabilitiesPath: "gtm/agents/content-system-agent/capabilities.json",
    toolsPath: "gtm/agents/content-system-agent/tools.json",
  },
  {
    module: "gtm",
    agentId: "growth-experimenter",
    inputSchema: GtmGrowthExperimenterInputSchema,
    outputSchema: GtmGrowthExperimenterOutputSchema,
    skillPath: "gtm/agents/growth-experimenter/SKILL.md",
    constraintsPath: "gtm/agents/growth-experimenter/constraints.md",
    capabilitiesPath: "gtm/agents/growth-experimenter/capabilities.json",
    toolsPath: "gtm/agents/growth-experimenter/tools.json",
  },
  {
    module: "gtm",
    agentId: "weekly-governance-agent",
    inputSchema: GtmWeeklyGovernanceAgentInputSchema,
    outputSchema: GtmWeeklyGovernanceAgentOutputSchema,
    skillPath: "gtm/agents/weekly-governance-agent/SKILL.md",
    constraintsPath: "gtm/agents/weekly-governance-agent/constraints.md",
    capabilitiesPath: "gtm/agents/weekly-governance-agent/capabilities.json",
    toolsPath: "gtm/agents/weekly-governance-agent/tools.json",
  },
  {
    module: "opportunity",
    agentId: "market-scanner",
    inputSchema: OpportunityMarketScannerInputSchema,
    outputSchema: OpportunityMarketScannerOutputSchema,
    skillPath: "opportunity/agents/market-scanner/SKILL.md",
    constraintsPath: "opportunity/agents/market-scanner/constraints.md",
    capabilitiesPath: "opportunity/agents/market-scanner/capabilities.json",
    toolsPath: "opportunity/agents/market-scanner/tools.json",
  },
  {
    module: "opportunity",
    agentId: "opportunity-analyst",
    inputSchema: OpportunityOpportunityAnalystInputSchema,
    outputSchema: OpportunityOpportunityAnalystOutputSchema,
    skillPath: "opportunity/agents/opportunity-analyst/SKILL.md",
    constraintsPath: "opportunity/agents/opportunity-analyst/constraints.md",
    capabilitiesPath: "opportunity/agents/opportunity-analyst/capabilities.json",
    toolsPath: "opportunity/agents/opportunity-analyst/tools.json",
  },
  {
    module: "opportunity",
    agentId: "prioritization-agent",
    inputSchema: OpportunityPrioritizationAgentInputSchema,
    outputSchema: OpportunityPrioritizationAgentOutputSchema,
    skillPath: "opportunity/agents/prioritization-agent/SKILL.md",
    constraintsPath: "opportunity/agents/prioritization-agent/constraints.md",
    capabilitiesPath: "opportunity/agents/prioritization-agent/capabilities.json",
    toolsPath: "opportunity/agents/prioritization-agent/tools.json",
  },
  {
    module: "opportunity",
    agentId: "scoring-agent",
    inputSchema: OpportunityScoringAgentInputSchema,
    outputSchema: OpportunityScoringAgentOutputSchema,
    skillPath: "opportunity/agents/scoring-agent/SKILL.md",
    constraintsPath: "opportunity/agents/scoring-agent/constraints.md",
    capabilitiesPath: "opportunity/agents/scoring-agent/capabilities.json",
    toolsPath: "opportunity/agents/scoring-agent/tools.json",
  },
  {
    module: "portfolio",
    agentId: "allocation-agent",
    inputSchema: PortfolioAllocationAgentInputSchema,
    outputSchema: PortfolioAllocationAgentOutputSchema,
    skillPath: "portfolio/agents/allocation-agent/SKILL.md",
    constraintsPath: "portfolio/agents/allocation-agent/constraints.md",
    capabilitiesPath: "portfolio/agents/allocation-agent/capabilities.json",
    toolsPath: "portfolio/agents/allocation-agent/tools.json",
  },
  {
    module: "portfolio",
    agentId: "governance-decision-agent",
    inputSchema: PortfolioGovernanceDecisionAgentInputSchema,
    outputSchema: PortfolioGovernanceDecisionAgentOutputSchema,
    skillPath: "portfolio/agents/governance-decision-agent/SKILL.md",
    constraintsPath: "portfolio/agents/governance-decision-agent/constraints.md",
    capabilitiesPath: "portfolio/agents/governance-decision-agent/capabilities.json",
    toolsPath: "portfolio/agents/governance-decision-agent/tools.json",
  },
  {
    module: "portfolio",
    agentId: "portfolio-analyst",
    inputSchema: PortfolioPortfolioAnalystInputSchema,
    outputSchema: PortfolioPortfolioAnalystOutputSchema,
    skillPath: "portfolio/agents/portfolio-analyst/SKILL.md",
    constraintsPath: "portfolio/agents/portfolio-analyst/constraints.md",
    capabilitiesPath: "portfolio/agents/portfolio-analyst/capabilities.json",
    toolsPath: "portfolio/agents/portfolio-analyst/tools.json",
  },
  {
    module: "portfolio",
    agentId: "portfolio-reporter",
    inputSchema: PortfolioPortfolioReporterInputSchema,
    outputSchema: PortfolioPortfolioReporterOutputSchema,
    skillPath: "portfolio/agents/portfolio-reporter/SKILL.md",
    constraintsPath: "portfolio/agents/portfolio-reporter/constraints.md",
    capabilitiesPath: "portfolio/agents/portfolio-reporter/capabilities.json",
    toolsPath: "portfolio/agents/portfolio-reporter/tools.json",
  },
  {
    module: "portfolio",
    agentId: "risk-monitor",
    inputSchema: PortfolioRiskMonitorInputSchema,
    outputSchema: PortfolioRiskMonitorOutputSchema,
    skillPath: "portfolio/agents/risk-monitor/SKILL.md",
    constraintsPath: "portfolio/agents/risk-monitor/constraints.md",
    capabilitiesPath: "portfolio/agents/risk-monitor/capabilities.json",
    toolsPath: "portfolio/agents/risk-monitor/tools.json",
  },
  {
    module: "startup-ops",
    agentId: "anomaly-detector",
    inputSchema: StartupOpsAnomalyDetectorInputSchema,
    outputSchema: StartupOpsAnomalyDetectorOutputSchema,
    skillPath: "startup-ops/agents/anomaly-detector/SKILL.md",
    constraintsPath: "startup-ops/agents/anomaly-detector/constraints.md",
    capabilitiesPath: "startup-ops/agents/anomaly-detector/capabilities.json",
    toolsPath: "startup-ops/agents/anomaly-detector/tools.json",
  },
  {
    module: "startup-ops",
    agentId: "health-scoring-agent",
    inputSchema: StartupOpsHealthScoringAgentInputSchema,
    outputSchema: StartupOpsHealthScoringAgentOutputSchema,
    skillPath: "startup-ops/agents/health-scoring-agent/SKILL.md",
    constraintsPath: "startup-ops/agents/health-scoring-agent/constraints.md",
    capabilitiesPath: "startup-ops/agents/health-scoring-agent/capabilities.json",
    toolsPath: "startup-ops/agents/health-scoring-agent/tools.json",
  },
  {
    module: "startup-ops",
    agentId: "metrics-ingestion-agent",
    inputSchema: StartupOpsMetricsIngestionAgentInputSchema,
    outputSchema: StartupOpsMetricsIngestionAgentOutputSchema,
    skillPath: "startup-ops/agents/metrics-ingestion-agent/SKILL.md",
    constraintsPath: "startup-ops/agents/metrics-ingestion-agent/constraints.md",
    capabilitiesPath: "startup-ops/agents/metrics-ingestion-agent/capabilities.json",
    toolsPath: "startup-ops/agents/metrics-ingestion-agent/tools.json",
  },
  {
    module: "startup-ops",
    agentId: "ops-advisor",
    inputSchema: StartupOpsOpsAdvisorInputSchema,
    outputSchema: StartupOpsOpsAdvisorOutputSchema,
    skillPath: "startup-ops/agents/ops-advisor/SKILL.md",
    constraintsPath: "startup-ops/agents/ops-advisor/constraints.md",
    capabilitiesPath: "startup-ops/agents/ops-advisor/capabilities.json",
    toolsPath: "startup-ops/agents/ops-advisor/tools.json",
  },
  {
    module: "startup-ops",
    agentId: "weekly-ops-reporter",
    inputSchema: StartupOpsWeeklyOpsReporterInputSchema,
    outputSchema: StartupOpsWeeklyOpsReporterOutputSchema,
    skillPath: "startup-ops/agents/weekly-ops-reporter/SKILL.md",
    constraintsPath: "startup-ops/agents/weekly-ops-reporter/constraints.md",
    capabilitiesPath: "startup-ops/agents/weekly-ops-reporter/capabilities.json",
    toolsPath: "startup-ops/agents/weekly-ops-reporter/tools.json",
  }
] satisfies AgentSchemaRegistryEntry[];

export function getAgentSchemaEntry(module: string, agentId: string): AgentSchemaRegistryEntry | undefined {
  return agentSchemaRegistry.find((entry) => entry.module === module && entry.agentId === agentId);
}
