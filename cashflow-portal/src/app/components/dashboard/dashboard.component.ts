import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  // Properties to hold income and expenses data
  totalIncome: number = 0;
  totalExpenses: number = 0;

  constructor() {
    // Initialize the component with default values or fetch data
  }

  // Method to calculate the total balance
  getBalance(): number {
    return this.totalIncome - this.totalExpenses;
  }

  // Additional methods to update income and expenses can be added here
}