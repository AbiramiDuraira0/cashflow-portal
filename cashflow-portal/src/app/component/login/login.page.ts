import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OtpService } from '../../services/otp.service';
import { environment } from '../../../environments/environment';

type LoginStep = 'passcode' | 'otp';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPage implements OnDestroy {
  // Passcode step
  passcode: string = '';
  showError: boolean = false;
  isShaking: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = 'Incorrect passcode. Please try again.';

  // OTP step
  currentStep: LoginStep = 'passcode';
  otp: string = '';
  otpDigits: string[] = ['', '', '', ''];
  showOtpError: boolean = false;
  otpErrorMessage: string = '';
  isSendingOtp: boolean = false;
  isVerifyingOtp: boolean = false;
  otpSent: boolean = false;
  remainingTime: number = 180;
  private timerInterval: any = null;
  private otpExpiryTime: number = 0;

  // 2FA configuration
  is2FAEnabled: boolean = false;
  recipientEmail: string = '';

  constructor(
    private router: Router,
    private otpService: OtpService,
    private cdr: ChangeDetectorRef
  ) {
    this.is2FAEnabled = this.otpService.is2FARequired();
    this.recipientEmail = environment.otpConfig.recipientEmail;
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  onSubmit() {
    if (this.passcode === 'login') {
      // Show loading state
      this.isLoading = true;
      
      // Store authentication state
      sessionStorage.setItem('isAuthenticated', 'true');
      
      // Navigate to dashboard
      this.router.navigate(['/dashboard']).then(() => {
        // Reset loading state after navigation
        this.isLoading = false;
      });
    } else {
      this.showError = true;
      this.isShaking = true;
      
      // Reset shake animation
      setTimeout(() => {
        this.isShaking = false;
      }, 500);

    setTimeout(() => {
      this.showError = false;
    }, 3000);
  }

  private showOtpErrorMessage(message: string) {
    this.otpErrorMessage = message;
    this.showOtpError = true;
    this.isShaking = true;
    
    setTimeout(() => {
      this.isShaking = false;
    }, 500);

    setTimeout(() => {
      this.showOtpError = false;
    }, 3000);
  }

  private clearOtpInputs() {
    // Reset array
    this.otpDigits = ['', '', '', ''];
    this.otp = '';
    
    // Clear ALL input elements and focus first
    setTimeout(() => {
      for (let i = 0; i < 4; i++) {
        const input = document.getElementById(`otp-${i}`) as HTMLInputElement;
        if (input) {
          input.value = '';
        }
      }
      // Focus first input
      const firstInput = document.getElementById('otp-0') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }
    }, 50);
  }

  private startTimer() {
    // Clear any existing timer first
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    
    // Set expiry time to 3 minutes from now
    this.otpExpiryTime = Date.now() + (3 * 60 * 1000);
    this.remainingTime = 180;
    
    // Force initial UI update
    this.cdr.detectChanges();
    
    // Store reference to this for closure
    const self = this;
    
    // Start interval with change detection
    this.timerInterval = window.setInterval(function() {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((self.otpExpiryTime - now) / 1000));
      self.remainingTime = remaining;
      self.cdr.detectChanges(); // Force UI update
      
      if (remaining <= 0) {
        self.clearTimer();
      }
    }, 1000);
  }

  private clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  getFormattedTime(): string {
    const minutes = Math.floor(this.remainingTime / 60);
    const seconds = this.remainingTime % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  onPasscodeChange() {
    this.showError = false;
  }

  getMaskedEmail(): string {
    const email = this.recipientEmail;
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) {
      return `${localPart[0]}***@${domain}`;
    }
    return `${localPart.substring(0, 2)}***@${domain}`;
  }

  isOtpComplete(): boolean {
    return this.otpDigits.every(digit => digit !== '');
  }
}
