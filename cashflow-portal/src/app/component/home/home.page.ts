import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConnectionTestService } from '../../services/connection-test.service';

type Widget = {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number; // percentage change
  icon: string;
  color: string;
  route?: string;
};

type RecentTransaction = {
  id: string;
  category: string;
  amount: number;
  date: Date;
  type: 'income' | 'expense';
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTooltipModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  private connectionTest = inject(ConnectionTestService);
  
  // Set loading to false immediately since data is pre-initialized
  loading = signal(false);
  
  // Test connection state
  protected showTestPopup = signal<boolean>(false);
  protected testResult = signal<{ success: boolean; message: string; } | null>(null);

  // Dashboard widgets - Pre-initialized for instant display
  widgets: Widget[] = [
    {
      id: '1',
      title: 'Total Income',
      value: '₹45,000',
      subtitle: 'This month',
      trend: 12,
      icon: '💰',
      color: '#22c55e',
      route: '/income'
    },
    {
      id: '2',
      title: 'Total Expenses',
      value: '₹32,850',
      subtitle: 'This month',
      trend: -8,
      icon: '💸',
      color: '#ef4444',
      route: '/expense'
    },
    {
      id: '3',
      title: 'Balance',
      value: '₹12,150',
      subtitle: 'Available',
      trend: 15,
      icon: '💵',
      color: '#3b82f6',
      route: '/'
    },
    {
      id: '4',
      title: 'Investments',
      value: '₹1,85,000',
      subtitle: 'Portfolio value',
      trend: 23,
      icon: '📈',
      color: '#8b5cf6',
      route: '/investment'
    },
    {
      id: '5',
      title: 'Active Debts',
      value: '₹48,500',
      subtitle: '3 active loans',
      trend: -5,
      icon: '🏦',
      color: '#f59e0b',
      route: '/debts'
    },
    {
      id: '6',
      title: 'Categories',
      value: '12',
      subtitle: 'Active categories',
      icon: '📁',
      color: '#06b6d4',
      route: '/category'
    }
  ];

  // Recent transactions
  recentTransactions: RecentTransaction[] = [
    { id: '1', category: 'Salary', amount: 45000, date: new Date('2026-03-01'), type: 'income' },
    { id: '2', category: 'Groceries', amount: -3500, date: new Date('2026-03-08'), type: 'expense' },
    { id: '3', category: 'Restaurant', amount: -1200, date: new Date('2026-03-07'), type: 'expense' },
    { id: '4', category: 'Transport', amount: -800, date: new Date('2026-03-06'), type: 'expense' },
    { id: '5', category: 'Freelance', amount: 8000, date: new Date('2026-03-05'), type: 'income' }
  ];

  // Budget overview
  budgetCategories = [
    { name: 'Food', spent: 5200, budget: 8000, color: '#f97316' },
    { name: 'Bills', spent: 4100, budget: 6000, color: '#06b6d4' },
    { name: 'Transport', spent: 2800, budget: 3000, color: '#8b5cf6' },
    { name: 'Shopping', spent: 1800, budget: 5000, color: '#ef4444' }
  ];

  ngOnInit(): void {
    // Data is pre-initialized, no loading delay needed
    // When you integrate real API calls, use:
    // this.loading.set(true);
    // await this.fetchData();
    // this.loading.set(false);
  }

  getPercentage(spent: number, budget: number): number {
    return Math.min(100, Math.round((spent / budget) * 100));
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  }

  // ============================================
  // TEST DATABASE CONNECTION
  // ============================================
  
  protected async testConnection(): Promise<void> {
    console.log('🔌 Testing database connection...');
    const result = await this.connectionTest.testConnection();
    
    this.testResult.set({
      success: result.success,
      message: result.message
    });
    this.showTestPopup.set(true);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.showTestPopup.set(false);
    }, 5000);
  }

  protected closeTestPopup(): void {
    this.showTestPopup.set(false);
  }
}
