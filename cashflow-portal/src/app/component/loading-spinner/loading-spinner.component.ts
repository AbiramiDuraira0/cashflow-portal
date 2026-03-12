import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isLoading) {
      <div class="loading-overlay">
        <div class="spinner-container">
          <div class="spinner"></div>
          <p class="loading-text">Loading dashboard...</p>
        </div>
      </div>
    }
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(4px);
      animation: fadeIn 0.2s ease-in;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .spinner-container {
      text-align: center;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .spinner {
      width: 60px;
      height: 60px;
      border: 4px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .loading-text {
      color: #3b82f6;
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.6;
      }
    }
  `]
})
export class LoadingSpinnerComponent implements OnInit {
  isLoading = false;

  constructor(
    private router: Router,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    // Only subscribe to the loading service
    // Remove automatic route interception to avoid conflicts
    this.loadingService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });
  }
}
