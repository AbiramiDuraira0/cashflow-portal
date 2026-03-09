import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-container">
      <header class="page-header">
        <h1>Reports</h1>
        <p class="subtitle">View financial reports and analytics</p>
      </header>
      <div class="coming-soon">
        <div class="icon">📊</div>
        <h2>Reports & Analytics</h2>
        <p>Coming soon...</p>
      </div>
    </section>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      color: #e5e7eb;
    }
    .page-header h1 {
      margin: 0 0 8px;
      font-size: 28px;
    }
    .page-header .subtitle {
      margin: 0;
      color: #94a3b8;
      font-size: 14px;
    }
    .coming-soon {
      margin-top: 60px;
      text-align: center;
      padding: 60px 20px;
      background: radial-gradient(120% 120% at 10% 10%, rgba(255,255,255,.04), transparent 60%), #121935;
      border: 1px solid #1f274a;
      border-radius: 14px;
    }
    .coming-soon .icon {
      font-size: 64px;
      margin-bottom: 16px;
    }
    .coming-soon h2 {
      margin: 0 0 8px;
      font-size: 24px;
    }
    .coming-soon p {
      color: #94a3b8;
      margin: 0;
    }
  `]
})
export class ReportPage {}
