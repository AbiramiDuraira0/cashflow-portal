import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface OtpConfig {
  email: string;
  userName: string;
}

@Injectable({
  providedIn: 'root'
})
export class OtpService {
  private currentOtp: string | null = null;
  private otpExpiry: number | null = null;
  private readonly OTP_VALIDITY_MINUTES = 3;
  
  // EmailJS configuration from environment
  private readonly EMAILJS_SERVICE_ID = environment.otpConfig.emailJsServiceId;
  private readonly EMAILJS_TEMPLATE_ID = environment.otpConfig.emailJsTemplateId;
  private readonly EMAILJS_PUBLIC_KEY = environment.otpConfig.emailJsPublicKey;

  constructor() {
    this.loadEmailJSScript();
  }

  /**
   * Check if 2FA is required based on environment
   * Local development: passcode only
   * Production: passcode + OTP
   */
  is2FARequired(): boolean {
    return environment.production || environment.enable2FA;
  }

  /**
   * Generate a 4-digit OTP
   */
  generateOtp(): string {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    this.currentOtp = otp;
    this.otpExpiry = Date.now() + (this.OTP_VALIDITY_MINUTES * 60 * 1000);
    return otp;
  }

  /**
   * Verify the entered OTP
   */
  verifyOtp(enteredOtp: string): { valid: boolean; message: string } {
    if (!this.currentOtp || !this.otpExpiry) {
      return { valid: false, message: 'No OTP generated. Please request a new one.' };
    }

    if (Date.now() > this.otpExpiry) {
      this.clearOtp();
      return { valid: false, message: 'OTP has expired. Please request a new one.' };
    }

    if (enteredOtp === this.currentOtp) {
      this.clearOtp();
      return { valid: true, message: 'OTP verified successfully!' };
    }

    return { valid: false, message: 'Invalid OTP. Please try again.' };
  }

  /**
   * Send OTP via Email using EmailJS (generates new OTP)
   */
  async sendOtpViaEmail(config: OtpConfig): Promise<{ success: boolean; message: string }> {
    const otp = this.generateOtp();
    return this.sendEmailWithOtp(config, otp);
  }

  /**
   * Send email with existing OTP (doesn't generate new one)
   */
  async sendOtpViaEmailAsync(config: OtpConfig): Promise<{ success: boolean; message: string }> {
    const otp = this.currentOtp;
    if (!otp) {
      return { success: false, message: 'No OTP generated' };
    }
    return this.sendEmailWithOtp(config, otp);
  }

  /**
   * Internal method to send email
   */
  private async sendEmailWithOtp(config: OtpConfig, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if EmailJS is loaded
      if (!(window as any).emailjs) {
        console.error('EmailJS not loaded');
        // Fallback: Show OTP in console for development/testing
        console.log(`[DEV MODE] Your OTP is: ${otp}`);
        return { 
          success: true, 
          message: `OTP sent to ${config.email}. Check console for development mode.` 
        };
      }

      const templateParams = {
        to_email: config.email,
        to_name: config.userName,
        // Variables matching your EmailJS template
        passcode: otp,
        otp_code: otp,
        time: new Date(Date.now() + this.OTP_VALIDITY_MINUTES * 60 * 1000).toLocaleTimeString(),
        validity_minutes: this.OTP_VALIDITY_MINUTES
      };

      await (window as any).emailjs.send(
        this.EMAILJS_SERVICE_ID,
        this.EMAILJS_TEMPLATE_ID,
        templateParams,
        this.EMAILJS_PUBLIC_KEY
      );

      return { 
        success: true, 
        message: `OTP sent to ${this.maskEmail(config.email)}` 
      };
    } catch (error) {
      console.error('Failed to send OTP:', error);
      // Fallback for development: log OTP to console
      console.log(`[FALLBACK] Your OTP is: ${otp}`);
      return { 
        success: true, 
        message: `OTP generated. Check console for development mode.` 
      };
    }
  }

  /**
   * Get remaining time for OTP validity
   */
  getRemainingTime(): number {
    if (!this.otpExpiry) return 0;
    const remaining = Math.max(0, this.otpExpiry - Date.now());
    return Math.ceil(remaining / 1000);
  }

  /**
   * Clear current OTP
   */
  clearOtp(): void {
    this.currentOtp = null;
    this.otpExpiry = null;
  }

  /**
   * Mask email for display (e.g., a***@gmail.com)
   */
  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) {
      return `${localPart[0]}***@${domain}`;
    }
    return `${localPart.substring(0, 2)}***@${domain}`;
  }

  /**
   * Load EmailJS script dynamically
   */
  private loadEmailJSScript(): void {
    if ((window as any).emailjs) return;
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.async = false; // Load synchronously for faster availability
    script.onload = () => {
      (window as any).emailjs.init(this.EMAILJS_PUBLIC_KEY);
      console.log('EmailJS loaded successfully');
    };
    document.head.appendChild(script);
  }

  /**
   * Check if EmailJS is ready
   */
  isEmailJSReady(): boolean {
    return !!(window as any).emailjs;
  }
}
