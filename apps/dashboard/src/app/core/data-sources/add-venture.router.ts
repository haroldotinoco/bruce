import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type { AddVentureDossier, IAddVentureDataSource } from './tokens';
import { AddVentureRealDataSource } from './add-venture.real';
import { AddVentureMockDataSource } from '../../mocks/factories/modules-content.mock';
import { DataModeService } from './data-mode.service';

@Injectable({ providedIn: 'root' })
export class AddVentureDataSourceRouter implements IAddVentureDataSource {
  private readonly real = inject(AddVentureRealDataSource);
  private readonly mock = inject(AddVentureMockDataSource);
  private readonly mode = inject(DataModeService);

  private pick(): IAddVentureDataSource {
    return this.mode.isLive('add-venture') ? this.real : this.mock;
  }

  listDossiers(ventureId?: string): Observable<AddVentureDossier[]> {
    return this.pick().listDossiers(ventureId);
  }

  getDossier(id: string): Observable<AddVentureDossier> {
    return this.pick().getDossier(id);
  }
}
