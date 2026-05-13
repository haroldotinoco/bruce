import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from './skeleton.component';
import { EmptyStateComponent } from './empty-state.component';

export interface DataTableColumn<T> {
  key: keyof T | string;
  label: string;
  align?: 'left' | 'right' | 'center';
  width?: string;
  template?: TemplateRef<unknown>;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, SkeletonComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dt-wrap">
      <table class="dt">
        <thead>
          <tr>
            <th
              *ngFor="let col of columns"
              [class.right]="col.align === 'right'"
              [class.center]="col.align === 'center'"
              [style.width]="col.width"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody *ngIf="loading">
          <tr *ngFor="let _ of skeletonRows">
            <td *ngFor="let c of columns"><app-skeleton height="10px" width="60%"></app-skeleton></td>
          </tr>
        </tbody>
        <tbody *ngIf="!loading">
          <tr *ngFor="let row of rows" (click)="onRowClick(row)" [class.clickable]="clickable">
            <td
              *ngFor="let col of columns"
              [class.right]="col.align === 'right'"
              [class.center]="col.align === 'center'"
            >
              <ng-container
                *ngIf="col.template; else plain"
                [ngTemplateOutlet]="col.template"
                [ngTemplateOutletContext]="{ $implicit: row, row: row, value: getValue(row, col.key) }"
              ></ng-container>
              <ng-template #plain>{{ getValue(row, col.key) }}</ng-template>
            </td>
          </tr>
        </tbody>
      </table>
      <app-empty-state
        *ngIf="!loading && rows.length === 0"
        [icon]="emptyIcon"
        [title]="emptyTitle"
        [subtitle]="emptySubtitle"
      ></app-empty-state>
    </div>
  `,
  styles: [
    `
      .dt-wrap {
        width: 100%;
        overflow-x: auto;
      }
      .dt {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        font-size: 13px;
      }
      .dt th {
        text-align: left;
        font-weight: 500;
        color: var(--fg-2);
        font-size: 11px;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        padding: 10px 14px;
        border-bottom: 1px solid var(--border);
        background: transparent;
      }
      .dt th.right,
      .dt td.right {
        text-align: right;
      }
      .dt th.center,
      .dt td.center {
        text-align: center;
      }
      .dt td {
        padding: 14px;
        border-bottom: 1px solid var(--border);
        color: var(--fg-0);
      }
      .dt tbody tr:last-child td {
        border-bottom: 0;
      }
      .dt tbody tr.clickable {
        cursor: pointer;
      }
      .dt tbody tr.clickable:hover td {
        background: rgba(255, 255, 255, 0.025);
      }
    `,
  ],
})
export class DataTableComponent<T> {
  @Input() columns: DataTableColumn<T>[] = [];
  @Input() rows: T[] = [];
  @Input() loading = false;
  @Input() emptyIcon = 'inbox';
  @Input() emptyTitle = 'No data';
  @Input() emptySubtitle?: string;
  @Input() clickable = false;
  @Output() rowClick = new EventEmitter<T>();

  skeletonRows = Array.from({ length: 6 });

  onRowClick(row: T) {
    if (this.clickable) this.rowClick.emit(row);
  }

  getValue(row: T, key: keyof T | string): unknown {
    return (row as any)[key as any];
  }
}
