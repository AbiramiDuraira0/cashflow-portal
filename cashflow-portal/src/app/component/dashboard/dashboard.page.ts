import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConnectionTestService } from '../../services/connection-test.service';
import { IncomeService, IncomeEntry } from '../../services/income.service';
import { ExpenseService, ExpenseEntry } from '../../services/expense.service';
import { DebtService, DebtEntry } from '../../services/debt.service';
import { InvestmentService, InvestmentEntry, InvestmentStatus } from '../../services/investment.service';
import { CategoryService, Category } from '../../services/category.service';
import { TaxService, TaxEntry } from '../../services/tax.service';

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
  categoryIcon?: string;
  amount: number;
  date: Date;
  type: 'income' | 'expense';
};

type BudgetCategory = {
  name: string;
  icon: string;
  spent: number;
  percentage: number;
  color: string;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage implements OnInit {
  private connectionTest = inject(ConnectionTestService);
  private incomeService = inject(IncomeService);
  private expenseService = inject(ExpenseService);
  private debtService = inject(DebtService);
  private investmentService = inject(InvestmentService);
  private categoryService = inject(CategoryService);
  private taxService = inject(TaxService);

  // ============================================
  // Constants
  // ============================================
  protected readonly months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  protected readonly categoryColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'
  ];

  // ============================================
  // State Signals
  // ============================================
  loading = signal(true);
  
  // Test connection state
  protected showTestPopup = signal<boolean>(false);
  protected testResult = signal<{ success: boolean; message: string; } | null>(null);

  // Current date info
  protected currentDate: string;
  protected currentMonth: string;
  protected currentYear: number;
  protected previousMonth: string;
  protected previousYear: number;

  // Data signals
  protected incomeData = signal<IncomeEntry[]>([]);
  protected expenseData = signal<ExpenseEntry[]>([]);
  protected debtData = signal<DebtEntry[]>([]);
  protected investmentData = signal<InvestmentEntry[]>([]);
  protected categoryData = signal<Category[]>([]);
  protected taxData = signal<TaxEntry[]>([]);

  constructor() {
    // Format current date
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    this.currentDate = now.toLocaleDateString('en-US', options);
    this.currentMonth = this.months[now.getMonth()];
    this.currentYear = now.getFullYear();
    
    // Calculate previous month
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    this.previousMonth = this.months[prevMonthDate.getMonth()];
    this.previousYear = prevMonthDate.getFullYear();
  }

  // ============================================
  // Computed Values - All Time Totals
  // ============================================
  protected totalIncome = computed(() => {
    return this.incomeData()
      .reduce((sum, i) => sum + i.amount, 0);
  });

  protected totalExpense = computed(() => {
    return this.expenseData()
      .filter(e => !e.isDeleted)
      .reduce((sum, e) => sum + e.amount, 0);
  });

  protected totalBalance = computed(() => {
    return this.totalIncome() - this.totalExpense();
  });

  // Current Year Data (for trends)
  protected currentYearIncome = computed(() => {
    return this.incomeData()
      .filter(i => i.year === this.currentYear)
      .reduce((sum, i) => sum + i.amount, 0);
  });

  protected previousYearIncome = computed(() => {
    return this.incomeData()
      .filter(i => i.year === this.currentYear - 1)
      .reduce((sum, i) => sum + i.amount, 0);
  });

  protected currentYearExpense = computed(() => {
    return this.expenseData()
      .filter(e => e.year === this.currentYear && !e.isDeleted)
      .reduce((sum, e) => sum + e.amount, 0);
  });

  protected previousYearExpense = computed(() => {
    return this.expenseData()
      .filter(e => e.year === this.currentYear - 1 && !e.isDeleted)
      .reduce((sum, e) => sum + e.amount, 0);
  });

  protected currentYearBalance = computed(() => {
    return this.currentYearIncome() - this.currentYearExpense();
  });

  protected previousYearBalance = computed(() => {
    return this.previousYearIncome() - this.previousYearExpense();
  });

  // Current month data (for trends)
  protected currentMonthIncome = computed(() => {
    return this.incomeData()
      .filter(i => i.month === this.currentMonth && i.year === this.currentYear)
      .reduce((sum, i) => sum + i.amount, 0);
  });

  protected previousMonthIncome = computed(() => {
    return this.incomeData()
      .filter(i => i.month === this.previousMonth && i.year === this.previousYear)
      .reduce((sum, i) => sum + i.amount, 0);
  });

  protected currentMonthExpense = computed(() => {
    return this.expenseData()
      .filter(e => e.month === this.currentMonth && e.year === this.currentYear && !e.isDeleted)
      .reduce((sum, e) => sum + e.amount, 0);
  });

  protected previousMonthExpense = computed(() => {
    return this.expenseData()
      .filter(e => e.month === this.previousMonth && e.year === this.previousYear && !e.isDeleted)
      .reduce((sum, e) => sum + e.amount, 0);
  });

  protected currentBalance = computed(() => {
    return this.currentMonthIncome() - this.currentMonthExpense();
  });

  protected previousBalance = computed(() => {
    return this.previousMonthIncome() - this.previousMonthExpense();
  });

  // ============================================
  // Computed Values - Investments
  // ============================================
  protected totalInvestments = computed(() => {
    return this.investmentData()
      .filter(inv => inv.status === InvestmentStatus.ACTIVE && !inv.is_deleted)
      .reduce((sum, inv) => sum + inv.invested_amount + (inv.interest_earned || 0), 0);
  });

  protected totalInvestmentReturns = computed(() => {
    return this.investmentData()
      .filter(inv => inv.status === InvestmentStatus.ACTIVE && !inv.is_deleted)
      .reduce((sum, inv) => sum + (inv.interest_earned || 0), 0);
  });

  // ============================================
  // Computed Values - Debts
  // ============================================
  protected totalOutstandingDebts = computed(() => {
    return this.debtData()
      .filter(d => d.type === 'debt' && d.status === 'open' && !d.isDeleted)
      .reduce((sum, d) => sum + d.outstandingAmount, 0);
  });

  protected activeDebtCount = computed(() => {
    return this.debtData()
      .filter(d => d.type === 'debt' && d.status === 'open' && !d.isDeleted)
      .length;
  });

  // ============================================
  // Computed Values - Categories
  // ============================================
  protected activeCategoryCount = computed(() => {
    return this.categoryData().filter(c => c.is_active).length;
  });

  // ============================================
  // Computed Values - Tax
  // ============================================
  protected currentYearTax = computed(() => {
    return this.taxData()
      .filter(t => t.year === this.currentYear && !t.is_deleted)
      .reduce((sum, t) => sum + t.tax_paid, 0);
  });

  // ============================================
  // Computed Values - Trend Calculations (YTD vs Previous Year)
  // ============================================
  protected incomeTrend = computed(() => {
    const current = this.currentYearIncome();
    const previous = this.previousYearIncome();
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  });

  protected expenseTrend = computed(() => {
    const current = this.currentYearExpense();
    const previous = this.previousYearExpense();
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  });

  protected balanceTrend = computed(() => {
    const current = this.currentYearBalance();
    const previous = this.previousYearBalance();
    if (previous === 0) return current > 0 ? 100 : (current < 0 ? -100 : 0);
    return Math.round(((current - previous) / Math.abs(previous)) * 100);
  });

  // ============================================
  // Computed Values - Widgets
  // ============================================
  protected widgets = computed<Widget[]>(() => {
    return [
      {
        id: '1',
        title: 'Total Income',
        value: this.formatCurrency(this.totalIncome()),
        subtitle: 'All Time',
        trend: this.incomeTrend(),
        icon: '💰',
        color: '#22c55e',
        route: '/income'
      },
      {
        id: '2',
        title: 'Total Expenses',
        value: this.formatCurrency(this.totalExpense()),
        subtitle: 'All Time',
        trend: this.expenseTrend() * -1, // Negative trend is good for expenses
        icon: '💸',
        color: '#ef4444',
        route: '/expense'
      },
      {
        id: '3',
        title: 'Balance',
        value: this.formatCurrency(this.totalBalance()),
        subtitle: 'All Time',
        trend: this.balanceTrend(),
        icon: '💵',
        color: '#3b82f6',
        route: '/report'
      },
      {
        id: '4',
        title: 'Investments',
        value: this.formatCurrency(this.totalInvestments()),
        subtitle: `+${this.formatCurrency(this.totalInvestmentReturns())} returns`,
        icon: '📈',
        color: '#8b5cf6',
        route: '/investment'
      },
      {
        id: '5',
        title: 'Active Debts',
        value: this.formatCurrency(this.totalOutstandingDebts()),
        subtitle: `${this.activeDebtCount()} active loans`,
        icon: '🏦',
        color: '#f59e0b',
        route: '/debts'
      },
      {
        id: '6',
        title: 'Categories',
        value: this.activeCategoryCount(),
        subtitle: 'Active categories',
        icon: '📁',
        color: '#06b6d4',
        route: '/category'
      }
    ];
  });

  // ============================================
  // Computed Values - Recent Transactions
  // ============================================
  protected recentTransactions = computed<RecentTransaction[]>(() => {
    const transactions: RecentTransaction[] = [];

    // Add recent income entries
    this.incomeData()
      .filter(i => i.year === this.currentYear)
      .slice(0, 10)
      .forEach(income => {
        transactions.push({
          id: `income-${income.id}`,
          category: income.source,
          categoryIcon: '💰',
          amount: income.amount,
          date: new Date(income.date),
          type: 'income'
        });
      });

    // Add recent expense entries
    this.expenseData()
      .filter(e => e.year === this.currentYear && !e.isDeleted)
      .slice(0, 10)
      .forEach(expense => {
        transactions.push({
          id: `expense-${expense.id}`,
          category: expense.categoryName,
          categoryIcon: expense.categoryIcon || '💸',
          amount: -expense.amount,
          date: new Date(expense.createdAt),
          type: 'expense'
        });
      });

    // Sort by date descending and take top 5
    return transactions
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  });

  // ============================================
  // Computed Values - Expense Category Breakdown
  // ============================================
  protected expenseCategoryBreakdown = computed<BudgetCategory[]>(() => {
    const expenses = this.expenseData()
      .filter(e => e.month === this.currentMonth && e.year === this.currentYear && !e.isDeleted);

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const categoryMap = new Map<string, { icon: string; amount: number }>();

    expenses.forEach(expense => {
      const existing = categoryMap.get(expense.categoryName);
      if (existing) {
        existing.amount += expense.amount;
      } else {
        categoryMap.set(expense.categoryName, {
          icon: expense.categoryIcon || '📁',
          amount: expense.amount
        });
      }
    });

    return Array.from(categoryMap.entries())
      .map(([name, data], index) => ({
        name,
        icon: data.icon,
        spent: data.amount,
        percentage: totalExpense > 0 ? Math.round((data.amount / totalExpense) * 100) : 0,
        color: this.categoryColors[index % this.categoryColors.length]
      }))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);
  });

  // ============================================
  // Lifecycle
  // ============================================
  async ngOnInit(): Promise<void> {
    await this.loadAllData();
  }

  // ============================================
  // Data Loading
  // ============================================
  private async loadAllData(): Promise<void> {
    this.loading.set(true);
    
    try {
      // Trigger data reload from all services and wait for completion
      await Promise.all([
        this.incomeService.loadIncomeData(),
        this.expenseService.loadExpenseData(),
        this.debtService.loadDebtData(),
        this.investmentService.loadInvestmentData(),
        this.categoryService.loadCategories(),
        this.taxService.loadTaxEntries()
      ]);

      // Now get the data from signals after services have loaded
      this.incomeData.set(this.incomeService.getEntriesSignal()());
      this.expenseData.set(this.expenseService.getExpensesSignal()());
      this.debtData.set(this.debtService.getDebtsSignal()());
      this.investmentData.set(this.investmentService.investments());
      this.categoryData.set(this.categoryService.getCategoriesSignal()());
      this.taxData.set(this.taxService.getTaxEntriesSignal()());
      
      console.log('📊 Dashboard data loaded:', {
        income: this.incomeData().length,
        expenses: this.expenseData().length,
        debts: this.debtData().length,
        investments: this.investmentData().length,
        categories: this.categoryData().length,
        tax: this.taxData().length
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadIncomeData(): Promise<void> {
    await this.incomeService.loadIncomeData();
    this.incomeData.set(this.incomeService.getEntriesSignal()());
  }

  private async loadExpenseData(): Promise<void> {
    await this.expenseService.loadExpenseData();
    this.expenseData.set(this.expenseService.getExpensesSignal()());
  }

  private async loadDebtData(): Promise<void> {
    await this.debtService.loadDebtData();
    this.debtData.set(this.debtService.getDebtsSignal()());
  }

  private async loadInvestmentData(): Promise<void> {
    await this.investmentService.loadInvestmentData();
    this.investmentData.set(this.investmentService.investments());
  }

  private async loadCategoryData(): Promise<void> {
    await this.categoryService.loadCategories();
    this.categoryData.set(this.categoryService.getCategoriesSignal()());
  }

  private async loadTaxData(): Promise<void> {
    await this.taxService.loadTaxEntries();
    this.taxData.set(this.taxService.getTaxEntriesSignal()());
  }

  // ============================================
  // Helper Methods
  // ============================================
  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
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

  protected async refreshData(): Promise<void> {
    await this.loadAllData();
  }
}
