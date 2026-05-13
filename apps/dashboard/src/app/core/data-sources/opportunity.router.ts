import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type {
  IOpportunityDataSource,
} from './tokens';
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
} from '../models';
import { OpportunityRealDataSource } from './opportunity.real';
import { OpportunityMockDataSource } from '../../mocks/factories/opportunity.mock';
import { DataModeService } from './data-mode.service';

@Injectable({ providedIn: 'root' })
export class OpportunityDataSourceRouter implements IOpportunityDataSource {
  private readonly real = inject(OpportunityRealDataSource);
  private readonly mock = inject(OpportunityMockDataSource);
  private readonly mode = inject(DataModeService);

  private pick(): IOpportunityDataSource {
    return this.mode.isLive('opportunity') ? this.real : this.mock;
  }

  listScans(params?: { limit?: number; status?: string }): Observable<Scan[]> {
    return this.pick().listScans(params);
  }
  getScan(id: string): Observable<ScanDetail> {
    return this.pick().getScan(id);
  }
  listOpportunities(scanId: string, minScore?: number): Observable<Opportunity[]> {
    return this.pick().listOpportunities(scanId, minScore);
  }
  listAllOpportunities(limit?: number): Observable<Opportunity[]> {
    return this.pick().listAllOpportunities(limit);
  }
  startScan(req: StartScanRequest): Observable<StartScanResponse> {
    return this.pick().startScan(req);
  }
  pollJob(workflowId: string): Observable<JobStatus> {
    return this.pick().pollJob(workflowId);
  }
  getJob(workflowId: string): Observable<JobStatus> {
    return this.pick().getJob(workflowId);
  }
  getUsage(): Observable<Usage> {
    return this.pick().getUsage();
  }
  restartDownstreamScan(scanId: string, body: RestartDownstreamRequest): Observable<RestartDownstreamResponse> {
    return this.pick().restartDownstreamScan(scanId, body);
  }
  health(): Observable<{ status: string }> {
    return this.pick().health();
  }
}
