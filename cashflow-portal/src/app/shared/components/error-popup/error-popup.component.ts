import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Error Popup Component
 * Reusable modal for displaying user-friendly error messages
 * Replaces browser alert() with a custom UI component
 */

export type ErrorType = 'error' | 'warning' | 'info' | 'success';

export interface ErrorPopupData {
  title: string;
  message: string;
  details?: string;
  type: ErrorType;
}

@Component({
  selector: 'app-error-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-popup.component.html',
  styleUrls: ['./error-popup.component.scss']
})
export class ErrorPopupComponent {
  // Inputs
  isOpen = input<boolean>(false);
  title = input<string>('');
  message = input<string>('');
  details = input<string>('');
  type = input<ErrorType>('error');
  showDetails = input<boolean>(false);
  
  // Outputs
  closed = output<void>();
  
  // Computed
  icon = computed(() => {
    switch (this.type()) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  });
  
  modalClass = computed(() => {
    return `error-popup-modal error-popup-${this.type()}`;
  });
  
  /**
   * Close the modal
   */
  close(): void {
    this.closed.emit();
  }
  
  /**
   * Handle backdrop click
   */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
  
  /**
   * Handle escape key
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    }
  }
}
