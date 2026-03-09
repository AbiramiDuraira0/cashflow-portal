import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'cashflow-portal';
  protected isMenuCollapsed = true;
  protected isMenuHovered = false;

  toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  onMenuMouseEnter() {
    this.isMenuHovered = true;
  }

  onMenuMouseLeave() {
    this.isMenuHovered = false;
  }
}
