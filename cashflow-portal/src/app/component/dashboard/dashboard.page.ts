import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConnectionTestService } from '../../services/connection-test.service';
import { IncomeService, IncomeEntry } from '../../services/income.service';
import { ExpenseService, ExpenseEntry } from '../../services/expense.service';
import { DebtService, DebtEntry } from '../../services/debt.service';
import { InvestmentService, InvestmentEntry, InvestmentStatus } from '../../services/investment.service';
import { CategoryService, Category } from '../../services/category.service';

type Widget = {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon: string;
  color: string;
  route?: string;
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

  // ============================================
  // Constants
  // ============================================
  protected readonly months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // ============================================
  // State Signals
  // ============================================
  loading = signal(true);
  
  // Test connection state
  protected showTestPopup = signal<boolean>(false);
  protected testResult = signal<{ success: boolean; message: string; } | null>(null);

  // Calendar state
  protected showCalendar = signal<boolean>(false);
  protected showYearDropdown = signal<boolean>(false);
  protected showMonthDropdown = signal<boolean>(false);
  protected calendarDate = signal<Date>(new Date());
  protected selectedDate = signal<Date>(new Date());

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

  // Calendar computed values
  protected calendarMonthYear = computed(() => {
    const date = this.calendarDate();
    return `${this.months[date.getMonth()]} ${date.getFullYear()}`;
  });

  protected calendarMonth = computed(() => {
    return this.calendarDate().getMonth();
  });

  protected calendarYear = computed(() => {
    return this.calendarDate().getFullYear();
  });

  protected calendarYearOptions = computed(() => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    // Show 50 years in the past and 10 years in the future
    for (let year = currentYear - 50; year <= currentYear + 10; year++) {
      years.push(year);
    }
    return years;
  });

  protected calendarDays = computed(() => {
    const date = this.calendarDate();
    const today = new Date();
    const selected = this.selectedDate();
    
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const startingDay = firstDay.getDay();
    
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    
    // Previous month's last days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    const days: { date: number; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean }[] = [];
    
    // Previous month days
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }
    
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const isToday = today.getDate() === i && 
                      today.getMonth() === month && 
                      today.getFullYear() === year;
      const isSelected = selected.getDate() === i && 
                         selected.getMonth() === month && 
                         selected.getFullYear() === year;
      days.push({
        date: i,
        isCurrentMonth: true,
        isToday,
        isSelected
      });
    }
    
    // Next month days to complete the grid (6 rows x 7 days = 42)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }
    
    return days;
  });

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
  // Calendar Methods
  // ============================================
  toggleCalendar(): void {
    const isOpening = !this.showCalendar();
    
    // Reset to current date every time calendar is opened
    if (isOpening) {
      const today = new Date();
      this.calendarDate.set(today);
      this.selectedDate.set(today);
      this.showMonthDropdown.set(false);
      this.showYearDropdown.set(false);
    }
    
    this.showCalendar.update(v => !v);
  }

  previousCalendarMonth(): void {
    this.calendarDate.update(date => {
      return new Date(date.getFullYear(), date.getMonth() - 1, 1);
    });
  }

  nextCalendarMonth(): void {
    this.calendarDate.update(date => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 1);
    });
  }

  onMonthSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const month = parseInt(select.value, 10);
    this.calendarDate.update(date => {
      return new Date(date.getFullYear(), month, 1);
    });
  }

  onYearSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const year = parseInt(select.value, 10);
    this.calendarDate.update(date => {
      return new Date(year, date.getMonth(), 1);
    });
  }

  toggleYearDropdown(event: Event): void {
    event.stopPropagation();
    this.showMonthDropdown.set(false); // Close month dropdown
    this.showYearDropdown.update(v => !v);
    
    // Scroll to current year when opening
    if (this.showYearDropdown()) {
      setTimeout(() => {
        const selectedOption = document.querySelector('.cal-year-option.selected');
        if (selectedOption) {
          selectedOption.scrollIntoView({ block: 'center', behavior: 'auto' });
        }
      }, 10);
    }
  }

  toggleMonthDropdown(event: Event): void {
    event.stopPropagation();
    this.showYearDropdown.set(false); // Close year dropdown
    this.showMonthDropdown.update(v => !v);
    
    // Scroll to current month when opening
    if (this.showMonthDropdown()) {
      setTimeout(() => {
        const selectedOption = document.querySelector('.cal-month-option.selected');
        if (selectedOption) {
          selectedOption.scrollIntoView({ block: 'center', behavior: 'auto' });
        }
      }, 10);
    }
  }

  selectYear(year: number): void {
    this.calendarDate.update(date => {
      return new Date(year, date.getMonth(), 1);
    });
    this.showYearDropdown.set(false);
  }

  selectMonth(month: number): void {
    this.calendarDate.update(date => {
      return new Date(date.getFullYear(), month, 1);
    });
    this.showMonthDropdown.set(false);
  }

  goToToday(): void {
    const today = new Date();
    this.calendarDate.set(today);
    this.selectedDate.set(today);
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

  // ============================================
  // Computed Values - Categories
  // ============================================
  protected activeCategoryCount = computed(() => {
    return this.categoryData().filter(c => c.is_active).length;
  });

  // ============================================
  // Computed Values - Spending by Parent Category
  // ============================================
  protected categorySpendingData = computed(() => {
    const expenses = this.expenseData().filter(e => !e.isDeleted);
    
    // Group by parent category (categoryName)
    const categoryMap = new Map<string, { 
      total: number; 
      icon: string; 
      color: string;
    }>();
    
    // Define colors for categories
    const categoryColors: Record<string, string> = {
      'Abi': '#ec4899',      // Pink
      'BB': '#3b82f6',       // Blue
      'CC': '#f59e0b',       // Amber
      'Home': '#22c55e',     // Green
      'Investment': '#8b5cf6', // Purple
      'Medical': '#ef4444',  // Red
      'Misc': '#6b7280',     // Gray
      'Monthly Needs': '#06b6d4', // Cyan
      'Savings': '#10b981',  // Emerald
      'Wifi': '#6366f1',     // Indigo
    };
    
    expenses.forEach(expense => {
      const categoryName = expense.categoryName;
      const existing = categoryMap.get(categoryName);
      
      if (existing) {
        existing.total += expense.amount;
      } else {
        categoryMap.set(categoryName, {
          total: expense.amount,
          icon: expense.categoryIcon || '📁',
          color: categoryColors[categoryName] || '#6b7280'
        });
      }
    });
    
    // Convert to array and sort by total (descending)
    return Array.from(categoryMap.entries())
      .map(([name, data]) => ({
        name,
        total: data.total,
        icon: data.icon,
        color: data.color
      }))
      .sort((a, b) => b.total - a.total);
  });

  // Get total spending for percentage calculation
  protected totalCategorySpending = computed(() => {
    return this.categorySpendingData().reduce((sum, cat) => sum + cat.total, 0);
  });

  // Get spending data with percentage for charts
  protected categorySpendingWithPercentage = computed(() => {
    const total = this.totalCategorySpending();
    return this.categorySpendingData().map(cat => ({
      ...cat,
      percentage: total > 0 ? Math.round((cat.total / total) * 100) : 0
    }));
  });

  // Helper method to calculate stroke offset for pie chart segments
  protected getStrokeOffset(index: number): number {
    const categories = this.categorySpendingWithPercentage();
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += categories[i].percentage * 5.024; // 502.4 / 100
    }
    return -offset + 125.6; // Start from top (90 degrees = 125.6)
  }

  // Helper method to get opacity based on percentage for heatmap
  protected getOpacity(percentage: number): string {
    // Scale opacity from 40% to 100% based on percentage
    const minOpacity = 0.4;
    const maxOpacity = 1;
    const opacity = minOpacity + (percentage / 100) * (maxOpacity - minOpacity);
    const hex = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return hex;
  }

  // ============================================
  // Computed Values - Widgets
  // ============================================
  protected widgets = computed<Widget[]>(() => {
    return [
      {
        id: '1',
        title: 'Total Income',
        value: this.formatCurrency(this.totalIncome()),
        icon: '💰',
        color: '#22c55e',
        route: '/income'
      },
      {
        id: '2',
        title: 'Total Expenses',
        value: this.formatCurrency(this.totalExpense()),
        icon: '💸',
        color: '#ef4444',
        route: '/expense'
      },
      {
        id: '3',
        title: 'Balance',
        value: this.formatCurrency(this.totalBalance()),
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
        icon: '🏦',
        color: '#f59e0b',
        route: '/debts'
      },
      {
        id: '6',
        title: 'Categories',
        value: this.activeCategoryCount(),
        icon: '📁',
        color: '#06b6d4',
        route: '/category'
      }
    ];
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
      await Promise.all([
        this.incomeService.loadIncomeData(),
        this.expenseService.loadExpenseData(),
        this.debtService.loadDebtData(),
        this.investmentService.loadInvestmentData(),
        this.categoryService.loadCategories()
      ]);

      this.incomeData.set(this.incomeService.getEntriesSignal()());
      this.expenseData.set(this.expenseService.getExpensesSignal()());
      this.debtData.set(this.debtService.getDebtsSignal()());
      this.investmentData.set(this.investmentService.investments());
      this.categoryData.set(this.categoryService.getCategoriesSignal()());
      
      console.log('📊 Dashboard data loaded:', {
        income: this.incomeData().length,
        expenses: this.expenseData().length,
        debts: this.debtData().length,
        investments: this.investmentData().length,
        categories: this.categoryData().length
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.loading.set(false);
    }
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
