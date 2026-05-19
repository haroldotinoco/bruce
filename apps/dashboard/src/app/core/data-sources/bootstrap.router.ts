import { Injectable, inject } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import type { ModuleId } from '../config/env.types';
import type { StartFromPromptRequest, StartFromPromptResponse } from '../models';
import { ApiService } from '../http/api.service';
import { DataModeService } from './data-mode.service';

@Injectable({ providedIn: 'root' })
export class BootstrapDataSourceRouter {
  private readonly api = inject(ApiService);
  private readonly mode = inject(DataModeService);

  startFromPrompt(
    moduleId: Extract<ModuleId, 'add-venture' | 'brand-aid'>,
    body: StartFromPromptRequest,
  ): Observable<StartFromPromptResponse> {
    if (!this.mode.isLive(moduleId)) {
      return of({
        venture_id: body.venture_id ?? '00000000-0000-4000-8000-000000000001',
        correlation_id: 'mock-correlation',
        workflow_id: `mock-${moduleId}-${Date.now()}`,
        poll_url: '/jobs/mock',
        synthetic: {
          opportunity_scan_id: 'mock-scan',
          opportunity_observability_run_id: 'mock-obs-opp',
          add_venture_pipeline_run_id: moduleId === 'brand-aid' ? 'mock-pipeline' : null,
          add_venture_observability_run_id:
            moduleId === 'brand-aid' ? 'mock-obs-av' : undefined,
        },
      }).pipe(delay(800));
    }
    return this.api.post<StartFromPromptResponse>(
      moduleId,
      '/bootstrap/start-from-prompt',
      body,
    );
  }
}
