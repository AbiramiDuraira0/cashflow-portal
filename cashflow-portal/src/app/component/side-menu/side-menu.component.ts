import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatTooltipModule],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss'
})
export class SideMenuComponent {
  protected isMenuCollapsed = signal(true);
  protected isMenuHovered = signal(false);

  constructor(private router: Router) {}

  toggleMenu() {
    this.isMenuCollapsed.set(!this.isMenuCollapsed());
  }

  onMenuMouseEnter() {
    this.isMenuHovered.set(true);
  }

  onMenuMouseLeave() {
    this.isMenuHovered.set(false);
  }

  onMenuItemClick() {
    // Collapse menu when any menu item is clicked
    this.isMenuCollapsed.set(true);
  }

  navigateTo(route: string, event?: MouseEvent) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.router.navigate([route]);
    this.onMenuItemClick();
  }

  logout() {
    sessionStorage.removeItem('isAuthenticated');
    this.router.navigate(['/login']);
  }
}
