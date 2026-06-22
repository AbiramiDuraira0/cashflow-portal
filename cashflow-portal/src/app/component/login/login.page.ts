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

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 4).split('');
    
    // Fill the OTP digits array
    for (let i = 0; i < 4; i++) {
      this.otpDigits[i] = digits[i] || '';
      const input = document.getElementById(`otp-${i}`) as HTMLInputElement;
      if (input) {
        input.value = this.otpDigits[i];
      }
    }
    
    // Update the combined OTP value
    this.otp = this.otpDigits.join('');
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = this.otpDigits.findIndex(d => d === '');
    const focusIndex = nextEmptyIndex === -1 ? 3 : nextEmptyIndex;
    const nextInput = document.getElementById(`otp-${focusIndex}`) as HTMLInputElement;
    if (nextInput) {
      nextInput.focus();
    }
  }

  onOtpDigitInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(0, 1);
    
    // Update the digit
    this.otpDigits[index] = value;
    input.value = value;
    
    // Update the combined OTP value
    this.otp = this.otpDigits.join('');
    
    // Move to next input if a digit was entered
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  onOtpKeyDown(index: number, event: KeyboardEvent): void {
    // Handle backspace
    if (event.key === 'Backspace') {
      if (!this.otpDigits[index] && index > 0) {
        // If current field is empty, move to previous and clear it
        const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
        if (prevInput) {
          this.otpDigits[index - 1] = '';
          prevInput.value = '';
          prevInput.focus();
        }
      } else {
        // Clear current field
        this.otpDigits[index] = '';
      }
      this.otp = this.otpDigits.join('');
    }
    
    // Handle arrow keys
    if (event.key === 'ArrowLeft' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
    if (event.key === 'ArrowRight' && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  async verifyOtp(): Promise<void> {
    if (!this.isOtpComplete()) {
      return;
    }

    this.isVerifyingOtp = true;
    this.showOtpError = false;

    try {
      const result = this.otpService.verifyOtp(this.otp);
      
      if (result.valid) {
        // OTP verified successfully
        sessionStorage.setItem('isAuthenticated', 'true');
        await this.router.navigate(['/dashboard']);
      } else {
        this.showOtpErrorMessage(result.message || 'Invalid OTP. Please try again.');
        this.clearOtpInputs();
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      this.showOtpErrorMessage('Verification failed. Please try again.');
      this.clearOtpInputs();
    } finally {
      this.isVerifyingOtp = false;
    }
  }

  async resendOtp(): Promise<void> {
    if (this.isSendingOtp || this.remainingTime > 0) {
      return;
    }

    this.isSendingOtp = true;
    this.showOtpError = false;

    try {
      const result = await this.otpService.sendOtpViaEmail({
        email: this.recipientEmail,
        userName: 'User'
      });
      
      if (result.success) {
        this.otpSent = true;
        this.clearOtpInputs();
        this.startTimer();
      } else {
        this.showOtpErrorMessage(result.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      this.showOtpErrorMessage('Failed to send OTP. Please try again.');
    } finally {
      this.isSendingOtp = false;
    }
  }

  goBackToPasscode(): void {
    this.currentStep = 'passcode';
    this.clearTimer();
    this.clearOtpInputs();
    this.showOtpError = false;
    this.otpErrorMessage = '';
    this.passcode = '';
    this.showError = false;
  }
}
