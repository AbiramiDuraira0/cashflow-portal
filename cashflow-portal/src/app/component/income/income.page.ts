import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-container">
      <header class="page-header">
        <h1>Income</h1>
        <p class="subtitle">Track and manage your income sources</p>
      </header>
      <div class="coming-soon">
        <div class="icon">💰</div>
        <h2>Income Management</h2>
        <p>Coming soon...</p>
      </div>
    </section>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      color: #1f2937;

      @media (max-width: 768px) {
        padding: 16px;
      }
    }
    .page-header h1 {
      margin: 0 0 8px;
      font-size: 28px;

      @media (max-width: 768px) {
        font-size: 24px;
      }
    }
    .page-header .subtitle {
      margin: 0;
      color: #6b7280;
      font-size: 14px;

      @media (max-width: 768px) {
        font-size: 13px;
      }
    }
    .coming-soon {
      margin-top: 60px;
      text-align: center;
      padding: 60px 20px;
      background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      @media (max-width: 768px) {
        margin-top: 40px;
        padding: 40px 16px;
        border-radius: 12px;
      }
    }
    .coming-soon .icon {
      font-size: 64px;
      margin-bottom: 16px;

      @media (max-width: 768px) {
        font-size: 48px;
      }
    }
    .coming-soon h2 {
      margin: 0 0 8px;
      font-size: 24px;
      color: #1f2937;

      @media (max-width: 768px) {
        font-size: 20px;
      }
    }
    .coming-soon p {
      color: #6b7280;
      margin: 0;
      font-size: 14px;

      @media (max-width: 768px) {
        font-size: 13px;
      }
    }
  `]
})
export class IncomePage {}
