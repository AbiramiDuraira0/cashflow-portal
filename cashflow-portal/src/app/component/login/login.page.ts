import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPage {
  passcode: string = '';
  showError: boolean = false;
  isShaking: boolean = false;
  isLoading: boolean = false;

  constructor(private router: Router) {}

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

      // Hide error message after 3 seconds
      setTimeout(() => {
        this.showError = false;
      }, 3000);
    }
  }

  onPasscodeChange() {
    this.showError = false;
  }
}
