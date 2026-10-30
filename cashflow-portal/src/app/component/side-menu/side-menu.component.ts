import { afterNextRender, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss'
})
export class SideMenuComponent {
  @Input() mobileOpen = false;
  @Output() mobileMenuClosed = new EventEmitter<void>();
  protected isMenuCollapsed = signal(false);
  protected isMenuHovered = signal(false);

  constructor(private router: Router) {
    afterNextRender(() => {
      if (window.innerWidth < 768) {
        this.isMenuCollapsed.set(false);
      }
    });
  }

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
    this.mobileMenuClosed.emit();
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
    this.mobileMenuClosed.emit();
    this.router.navigate(['/login']);
  }
}
