import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'cashflow-portal';
  protected isMenuCollapsed = true; // Start with menu collapsed
  protected isMenuHovered = false;
  protected showMenu = false; // Hide menu on login page

  constructor(private router: Router) {
    // Set initial value based on current URL
    this.showMenu = !this.router.url.includes('/login');
    
    // Check if we're on login page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showMenu = !event.url.includes('/login');
    });
  }

  toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  onMenuMouseEnter() {
    this.isMenuHovered = true;
  }

  onMenuMouseLeave() {
    this.isMenuHovered = false;
  }

  onMenuItemClick() {
    // Collapse menu when any menu item is clicked
    this.isMenuCollapsed = true;
  }

  logout() {
    sessionStorage.removeItem('isAuthenticated');
    this.router.navigate(['/login']);
  }
}
