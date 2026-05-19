import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type { BrandPackage, IBrandAidDataSource } from './tokens';
import { BrandAidRealDataSource } from './brand-aid.real';
import { BrandAidMockDataSource } from '../../mocks/factories/modules-content.mock';
import { DataModeService } from './data-mode.service';

@Injectable({ providedIn: 'root' })
export class BrandAidDataSourceRouter implements IBrandAidDataSource {
  private readonly real = inject(BrandAidRealDataSource);
  private readonly mock = inject(BrandAidMockDataSource);
  private readonly mode = inject(DataModeService);

  private pick(): IBrandAidDataSource {
    return this.mode.isLive('brand-aid') ? this.real : this.mock;
  }

  listPackages(): Observable<BrandPackage[]> {
    return this.pick().listPackages();
  }

  getPackage(id: string): Observable<BrandPackage> {
    const source = this.pick();
    if (source.getPackage) return source.getPackage(id);
    return this.mock.getPackage(id);
  }
}
