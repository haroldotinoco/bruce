import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';
import { ToastContainerComponent } from '../shared/ui/toast-container.component';
import { DashboardPrefsService } from '../core/config/dashboard-prefs.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent, ToastContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shell" [class.shell--collapsed]="prefs.sidebarCollapsed()">
      <app-sidebar></app-sidebar>
      <div class="shell-main">
        <app-topbar></app-topbar>
        <main class="shell-content">
          <router-outlet></router-outlet>
        </main>
      </div>
      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [
    `
      .shell {
        display: grid;
        grid-template-columns: var(--sidebar-width, 248px) 1fr;
        min-height: 100vh;
        background: var(--bg-0);
      }
      .shell.shell--collapsed {
        --sidebar-width: 64px;
      }
      .shell-main {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .shell-content {
        flex: 1;
        padding: 0 32px 48px;
        max-width: 1440px;
        width: 100%;
        margin: 0 auto;
      }
      @media (max-width: 980px) {
        .shell:not(.shell--collapsed) {
          grid-template-columns: 72px 1fr;
        }
        .shell.shell--collapsed {
          --sidebar-width: 64px;
        }
        .shell-content {
          padding: 0 16px 32px;
        }
      }
    `,
  ],
})
export class ShellComponent {
  readonly prefs = inject(DashboardPrefsService);
}
