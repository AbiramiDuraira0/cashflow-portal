import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { LoadingSpinnerComponent } from './component/loading-spinner/loading-spinner.component';
import { SideMenuComponent } from './component/side-menu/side-menu.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, LoadingSpinnerComponent, SideMenuComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected title = 'cashflow-portal';
  // Use null initially to distinguish "not set yet" from "explicitly false"
  protected showMenu = signal<boolean | null>(null);
  protected isMobileMenuOpen = signal(false);
  private router = inject(Router);

  constructor() {
    // Listen to navigation events
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const isLoginPage = event.url === '/' || event.url.includes('/login');
      this.showMenu.set(!isLoginPage);
      this.isMobileMenuOpen.set(false);
    });
  }

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(isOpen => !isOpen);
  }

  protected closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  ngOnInit(): void {
    // Small delay to ensure router has fully initialized
    setTimeout(() => {
      const currentUrl = this.router.url;
      const isLoginPage = currentUrl === '/' || currentUrl.includes('/login') || currentUrl === '';
      this.showMenu.set(!isLoginPage);
    }, 0);
  }
}
/**code deploy for QA */