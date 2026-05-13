import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import type {
  Scan,
  ScanDetail,
  Opportunity,
  StartScanRequest,
  StartScanResponse,
  JobStatus,
  Usage,
  RestartDownstreamRequest,
  RestartDownstreamResponse,
  Venture,
  ModuleHealth,
  LiveEvent,
  TemporalRun,
  AgentCapability,
  ActiveWorkflow,
} from '../models';
import type { ModuleId } from '../config/env.types';

export interface IOpportunityDataSource {
  listScans(params?: { limit?: number; status?: string }): Observable<Scan[]>;
  getScan(id: string): Observable<ScanDetail>;
  listOpportunities(scanId: string, minScore?: number): Observable<Opportunity[]>;
  listAllOpportunities(limit?: number): Observable<Opportunity[]>;
  startScan(req: StartScanRequest): Observable<StartScanResponse>;
  pollJob(workflowId: string): Observable<JobStatus>;
  getJob(workflowId: string): Observable<JobStatus>;
  getUsage(): Observable<Usage>;
  health(): Observable<{ status: string }>;
  restartDownstreamScan(
    scanId: string,
    body: RestartDownstreamRequest,
  ): Observable<RestartDownstreamResponse>;
}

export const OPPORTUNITY_DS = new InjectionToken<IOpportunityDataSource>('OPPORTUNITY_DS');

export interface IBruceCoreDataSource {
  listVentures(): Observable<Venture[]>;
  getVenture(id: string): Observable<Venture>;
  createVenture(input: { name: string; stage?: string }): Observable<Venture>;
  startAnalysis(ventureId: string): Observable<{ job_id: string }>;
  listGovernanceEvents(): Observable<{ at: string; type: string; message: string }[]>;
}

export const BRUCE_CORE_DS = new InjectionToken<IBruceCoreDataSource>('BRUCE_CORE_DS');

export interface IAddVentureDataSource {
  listDossiers(ventureId?: string): Observable<AddVentureDossier[]>;
  getDossier(id: string): Observable<AddVentureDossier>;
}

export interface AddVentureDossier {
  id: string;
  venture_id: string;
  venture_name: string;
  status: 'draft' | 'composed' | 'validated';
  updated_at: string;
  business_model: { segments: string[]; value_props: string[]; channels: string[] };
  narrative: string;
  roadmap: { quarter: string; goal: string; owner: string }[];
  critic_score: number;
}
export const ADD_VENTURE_DS = new InjectionToken<IAddVentureDataSource>('ADD_VENTURE_DS');

export interface IBrandAidDataSource {
  listPackages(): Observable<BrandPackage[]>;
}
export interface BrandPackage {
  id: string;
  venture_name: string;
  status: 'generating' | 'ready' | 'archived';
  updated_at: string;
  names: string[];
  palette: string[];
  moodboard: { label: string; color: string }[];
  logos: number;
  score: number;
}
export const BRAND_AID_DS = new InjectionToken<IBrandAidDataSource>('BRAND_AID_DS');

export interface IBuilderDataSource {
  listProjects(): Observable<BuilderProject[]>;
}
export interface BuilderProject {
  id: string;
  venture_name: string;
  status: 'planning' | 'scaffolding' | 'testing' | 'deployed';
  updated_at: string;
  components: number;
  bdd_scenarios: number;
  qa_pass_rate: number;
  agents: { name: string; status: 'idle' | 'running' | 'done'; last: string }[];
}
export const BUILDER_DS = new InjectionToken<IBuilderDataSource>('BUILDER_DS');

export interface IGtmDataSource {
  listExperiments(): Observable<GtmExperiment[]>;
}
export interface GtmExperiment {
  id: string;
  venture_name: string;
  channel: string;
  hypothesis: string;
  status: 'backlog' | 'running' | 'won' | 'lost';
  metric: string;
  target: number;
  observed: number;
  updated_at: string;
}
export const GTM_DS = new InjectionToken<IGtmDataSource>('GTM_DS');

export interface IStartupOpsDataSource {
  listChecklists(): Observable<OpsChecklist[]>;
}
export interface OpsChecklist {
  id: string;
  venture_name: string;
  category: 'legal' | 'finance' | 'hr' | 'compliance' | 'vendors';
  progress: number;
  open_items: number;
  updated_at: string;
}
export const STARTUP_OPS_DS = new InjectionToken<IStartupOpsDataSource>('STARTUP_OPS_DS');

export interface IPortfolioDataSource {
  listVenturesMatrix(): Observable<PortfolioEntry[]>;
}
export interface PortfolioEntry {
  id: string;
  name: string;
  stage: string;
  score: number;
  revenue_est: number;
  risk: 'low' | 'medium' | 'high';
  tags: string[];
}
export const PORTFOLIO_DS = new InjectionToken<IPortfolioDataSource>('PORTFOLIO_DS');

export interface IBruceMemoryDataSource {
  listPatterns(): Observable<MemoryPattern[]>;
  search(q: string): Observable<MemoryDocument[]>;
}
export interface MemoryPattern {
  id: string;
  title: string;
  ventures_matched: number;
  insight: string;
  confidence: number;
  updated_at: string;
}
export interface MemoryDocument {
  id: string;
  title: string;
  venture: string;
  snippet: string;
  score: number;
}
export const BRUCE_MEMORY_DS = new InjectionToken<IBruceMemoryDataSource>('BRUCE_MEMORY_DS');

export interface IRunsDataSource {
  listRuns(): Observable<TemporalRun[]>;
  streamRuns(): Observable<TemporalRun[]>;
  getRun(id: string): Observable<TemporalRun>;
}
export const RUNS_DS = new InjectionToken<IRunsDataSource>('RUNS_DS');

export interface IMetricsDataSource {
  globalKpis(): Observable<GlobalKpis>;
  moduleHealth(): Observable<ModuleHealth[]>;
  activityHeatmap(): Observable<number[][]>;
  costSparkline(): Observable<number[]>;
  liveFeed(): Observable<LiveEvent[]>;
  liveFeedStream(): Observable<LiveEvent>;
}
export interface GlobalKpis {
  active_ventures: number;
  active_ventures_delta: number;
  workflows_running: number;
  workflows_running_delta: number;
  opportunities_7d: number;
  opportunities_7d_delta: number;
  /** Estimated USD from OpenRouter usage (current month). */
  llm_cost_usd_month: number;
  llm_cost_usd_month_delta: number;
  venture_funnel: Record<'concept' | 'scoping' | 'building' | 'live', number>;
}
export const METRICS_DS = new InjectionToken<IMetricsDataSource>('METRICS_DS');

export interface IAgentsDataSource {
  listAgents(): Observable<AgentCapability[]>;
}
export const AGENTS_DS = new InjectionToken<IAgentsDataSource>('AGENTS_DS');

export interface IWorkflowDataSource {
  activeForModule(moduleId: ModuleId): Observable<ActiveWorkflow[]>;
  get(workflowId: string, moduleHint?: ModuleId): Observable<ActiveWorkflow | null>;
}
export const WORKFLOW_DS = new InjectionToken<IWorkflowDataSource>('WORKFLOW_DS');
