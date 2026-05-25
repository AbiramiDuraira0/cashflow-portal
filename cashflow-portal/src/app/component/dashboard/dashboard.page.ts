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

  // Donut chart hover state
  protected hoveredCategory = signal<{ name: string; icon: string; total: number; percentage: number; color: string; index?: number } | null>(null);

  // Get tooltip position based on segment index
  protected getTooltipPosition = computed(() => {
    const hovered = this.hoveredCategory();
    if (!hovered || hovered.index === undefined) {
      return { top: '-80px', left: '50%', transform: 'translateX(-50%)' };
    }
    
    const categories = this.categorySpendingWithPercentage();
    const index = hovered.index;
    
    // Calculate the middle angle of the segment
    let startAngle = -90; // Start from top
    for (let i = 0; i < index; i++) {
      startAngle += categories[i].percentage * 3.6;
    }
    const midAngle = startAngle + (hovered.percentage * 3.6) / 2;
    
    // Convert to radians
    const midRad = (midAngle * Math.PI) / 180;
    
    // Position tooltip at the outer edge of the donut (radius ~100px from center for 180px donut)
    const radius = 110; // Distance from center to tooltip
    const x = Math.cos(midRad) * radius;
    const y = Math.sin(midRad) * radius;
    
    // Convert to CSS position (center is at 90px, 90px for 180px container)
    const centerX = 90;
    const centerY = 90;
    
    // Adjust transform based on position to prevent tooltip from hiding on edges
    // Left side of donut (x < 0): anchor tooltip from the right side
    // Right side of donut (x > 0): anchor tooltip from the left side
    let transform = 'translate(-50%, -50%)';
    let leftPos = centerX + x;
    
    if (x < -30) {
      // Segment is on the left side - position tooltip to the right of the anchor point
      transform = 'translate(0%, -50%)';
      leftPos = centerX + x + 20; // Shift right a bit
    } else if (x > 30) {
      // Segment is on the right side - position tooltip to the left of the anchor point
      transform = 'translate(-100%, -50%)';
      leftPos = centerX + x - 20; // Shift left a bit
    }
    
    return {
      top: `${centerY + y}px`,
      left: `${leftPos}px`,
      transform: transform
    };
  });

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
      'Abi': '#a78bfa',      // Light Violet
      'BB': '#60a5fa',       // Light Blue
      'CC': '#fbbf24',       // Light Amber
      'Home': '#fef08a',     // Pale Yellow
      'Investment': '#4ade80', // Light Green
      'Medical': '#f87171',  // Light Red
      'Misc': '#9ca3af',     // Light Gray
      'Monthly Needs': '#22d3ee', // Light Cyan
      'Savings': '#34d399',  // Light Emerald
      'Wifi': '#f87171',     // Light Red
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
    const data = this.categorySpendingData();
    
    // Calculate raw percentages
    const rawPercentages = data.map(cat => ({
      ...cat,
      rawPercentage: total > 0 ? (cat.total / total) * 100 : 0
    }));
    
    // Round percentages and adjust to ensure they sum to 100
    let roundedTotal = 0;
    const result = rawPercentages.map((cat, index) => {
      let percentage = Math.round(cat.rawPercentage);
      roundedTotal += percentage;
      return { ...cat, percentage };
    });
    
    // Adjust the largest item to make sure total is 100%
    if (result.length > 0 && roundedTotal !== 100) {
      const diff = 100 - roundedTotal;
      result[0].percentage += diff;
    }
    
    return result;
  });

  // ============================================
  // Computed Values - Subcategory Statistics by Category
  // ============================================
  protected subcategoryStats = computed(() => {
    const expenses = this.expenseData().filter(e => !e.isDeleted);
    const totalSpending = this.totalCategorySpending();
    
    // Group by category, then by subcategory
    const categoryMap = new Map<string, {
      categoryName: string;
      categoryIcon: string;
      categoryTotal: number;
      categoryColor: string;
      subcategories: {
        name: string;
        icon: string;
        total: number;
        percentage: number; // percentage within category
        globalPercentage: number; // percentage of total spending
      }[];
    }>();

    // Define colors for categories (same as categorySpendingData)
    const categoryColors: Record<string, string> = {
      'Abi': '#a78bfa',
      'BB': '#60a5fa',
      'CC': '#fbbf24',
      'Home': '#fef08a',
      'Investment': '#4ade80',
      'Medical': '#f87171',
      'Misc': '#9ca3af',
      'Monthly Needs': '#22d3ee',
      'Savings': '#34d399',
      'Wifi': '#f87171',
    };

    expenses.forEach(expense => {
      const categoryName = expense.categoryName;
      const subcategoryName = expense.subcategory || 'Uncategorized';
      
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          categoryName,
          categoryIcon: expense.categoryIcon || '📁',
          categoryTotal: 0,
          categoryColor: categoryColors[categoryName] || '#6b7280',
          subcategories: []
        });
      }
      
      const category = categoryMap.get(categoryName)!;
      category.categoryTotal += expense.amount;
      
      // Find or create subcategory
      let subcategory = category.subcategories.find(s => s.name === subcategoryName);
      if (!subcategory) {
        subcategory = {
          name: subcategoryName,
          icon: expense.subcategoryIcon || '📎',
          total: 0,
          percentage: 0,
          globalPercentage: 0
        };
        category.subcategories.push(subcategory);
      }
      subcategory.total += expense.amount;
    });

    // Calculate percentages and sort
    const result = Array.from(categoryMap.values())
      .map(cat => {
        // Calculate percentages for subcategories
        cat.subcategories = cat.subcategories
          .map(sub => ({
            ...sub,
            percentage: cat.categoryTotal > 0 ? Math.round((sub.total / cat.categoryTotal) * 100) : 0,
            globalPercentage: totalSpending > 0 ? Math.round((sub.total / totalSpending) * 100) : 0
          }))
          .sort((a, b) => b.total - a.total);
        return cat;
      })
      .sort((a, b) => b.categoryTotal - a.categoryTotal);

    return result;
  });

  // Computed Values - Abi Subcategory Heatmap Data
  protected abiSubcategoryHeatmap = computed(() => {
    const abiCategory = this.subcategoryStats().find(cat => cat.categoryName === 'Abi');
    if (!abiCategory) return [];
    
    // Define row-based colors for Abi subcategories (shades of purple - darker/more vibrant)
    // Row 1 (highest spending): Darkest purple
    // Gradual transition to lighter but still vibrant purples
    const rowColors = [
      '#5b21b6',  // Row 1 - Darkest purple
      '#6d28d9',  // Row 2 - Dark purple
      '#7c3aed',  // Row 3 - Medium dark purple
      '#8b5cf6',  // Row 4 - Medium purple
      '#a78bfa',  // Row 5 - Medium light purple
      '#b197fc',  // Row 6+ - Light purple (still vibrant)
    ];
    
    // Consolidated category names
    const consolidatedCategories = new Set(['Shopping', 'Subscriptions', 'Food', 'Trips', 'Temple & God', 'Miscellaneous']);
    
    // Pattern to identify shopping subcategories (online shopping + regular shopping)
    const shoppingPattern = /^online\s*-?\s*|shopping/i;
    
    // Pattern to identify food-related subcategories
    const foodPattern = /^food\s*|snacks?$/i;
    
    // Pattern to identify subscription services (Jio, Google, Netflix)
    const subscriptionPattern = /^(netflix|jio|google|youtube|prime|hotstar|spotify|subscription)/i;
    
    // Pattern to identify trips
    const tripsPattern = /trip/i;
    
    // Pattern to identify temple/god related
    const templePattern = /^(god|temple|pooja|puja)/i;
    
    // Pattern to identify miscellaneous and relatives
    const miscPattern = /^(miscellaneous|misc|relatives?)/i;
    
    // Pattern to identify contact lenz
    const specsPattern = /^contact\s*lenz/i;
    
    // Combine subcategories
    const combinedMap = new Map<string, { name: string; icon: string; total: number }>();
    let shoppingTotal = 0;
    let shoppingIcon = '🛒';
    let foodTotal = 0;
    let foodIcon = '🍽️';
    let subscriptionTotal = 0;
    let subscriptionIcon = '📺';
    let tripsTotal = 0;
    let tripsIcon = '✈️';
    let templeTotal = 0;
    let templeIcon = '🛕';
    let miscTotal = 0;
    let miscIcon = '📦';
    
    abiCategory.subcategories.forEach(sub => {
      const subNameLower = sub.name.toLowerCase();
      
      if (shoppingPattern.test(sub.name)) {
        // Combine into Shopping
        shoppingTotal += sub.total;
        if (shoppingIcon === '🛒' && sub.icon !== '📎') {
          shoppingIcon = sub.icon;
        }
      } else if (foodPattern.test(sub.name)) {
        // Combine into Food
        foodTotal += sub.total;
        if (foodIcon === '🍽️' && sub.icon !== '📎') {
          foodIcon = sub.icon;
        }
      } else if (subscriptionPattern.test(sub.name)) {
        // Combine into Subscriptions
        subscriptionTotal += sub.total;
        if (subscriptionIcon === '📺' && sub.icon !== '📎') {
          subscriptionIcon = sub.icon;
        }
      } else if (tripsPattern.test(sub.name)) {
        // Combine into Trips
        tripsTotal += sub.total;
        if (tripsIcon === '✈️' && sub.icon !== '📎') {
          tripsIcon = sub.icon;
        }
      } else if (templePattern.test(sub.name)) {
        // Combine into Temple & God
        templeTotal += sub.total;
        if (templeIcon === '🛕' && sub.icon !== '📎') {
          templeIcon = sub.icon;
        }
      } else if (miscPattern.test(sub.name)) {
        // Combine into Miscellaneous
        miscTotal += sub.total;
        if (miscIcon === '📦' && sub.icon !== '📎') {
          miscIcon = sub.icon;
        }
      } else if (specsPattern.test(sub.name)) {
        // Rename Contact Lenz to Specs & Lenz
        combinedMap.set('Specs & Lenz', {
          name: 'Specs & Lenz',
          icon: sub.icon || '👓',
          total: sub.total
        });
      } else {
        // Keep as separate subcategory
        combinedMap.set(sub.name, {
          name: sub.name,
          icon: sub.icon,
          total: sub.total
        });
      }
    });
    
    // Add combined shopping if there are any
    if (shoppingTotal > 0) {
      combinedMap.set('Shopping', {
        name: 'Shopping',
        icon: shoppingIcon,
        total: shoppingTotal
      });
    }
    
    // Add combined food if there are any
    if (foodTotal > 0) {
      combinedMap.set('Food', {
        name: 'Food',
        icon: foodIcon,
        total: foodTotal
      });
    }
    
    // Add combined subscriptions if there are any
    if (subscriptionTotal > 0) {
      combinedMap.set('Subscriptions', {
        name: 'Subscriptions',
        icon: subscriptionIcon,
        total: subscriptionTotal
      });
    }
    
    // Add combined trips if there are any
    if (tripsTotal > 0) {
      combinedMap.set('Trips', {
        name: 'Trips',
        icon: tripsIcon,
        total: tripsTotal
      });
    }
    
    // Add combined temple & god if there are any
    if (templeTotal > 0) {
      combinedMap.set('Temple & God', {
        name: 'Temple & God',
        icon: templeIcon,
        total: templeTotal
      });
    }
    
    // Add combined miscellaneous if there are any
    if (miscTotal > 0) {
      combinedMap.set('Miscellaneous', {
        name: 'Miscellaneous',
        icon: miscIcon,
        total: miscTotal
      });
    }
    
    // Calculate percentages based on Abi total
    const abiTotal = abiCategory.categoryTotal;
    
    // Sort by total first, then assign colors based on position
    const sortedItems = Array.from(combinedMap.values())
      .map(sub => ({
        name: sub.name,
        icon: sub.icon,
        total: sub.total,
        percentage: abiTotal > 0 ? Math.round((sub.total / abiTotal) * 100) : 0,
        isConsolidated: consolidatedCategories.has(sub.name)
      }))
      .sort((a, b) => b.total - a.total);
    
    // Assign colors based on row position (index)
    return sortedItems.map((item, index) => ({
      ...item,
      color: rowColors[Math.min(index, rowColors.length - 1)]
    }));
  });

  // Get total Abi spending
  protected abiTotalSpending = computed(() => {
    const abiCategory = this.subcategoryStats().find(cat => cat.categoryName === 'Abi');
    return abiCategory?.categoryTotal || 0;
  });

  // Computed Values - BB Subcategory Heatmap Data
  protected bbSubcategoryHeatmap = computed(() => {
    const bbCategory = this.subcategoryStats().find(cat => cat.categoryName === 'BB');
    if (!bbCategory) return [];
    
    // Define row-based colors for BB subcategories (shades of blue)
    // Row 1 (highest spending): Dark blue
    // Row 2: Light blue
    // Row 3+: Lighter blue
    const rowColors = [
      '#1d4ed8',  // Row 1 - Dark blue
      '#2563eb',  // Row 2 - Medium dark blue
      '#3b82f6',  // Row 3 - Medium blue
      '#60a5fa',  // Row 4 - Light blue
      '#93c5fd',  // Row 5 - Lighter blue
      '#dbeafe',  // Row 6+ - Lightest blue
    ];
    
    // Consolidated category names
    const consolidatedCategories = new Set(['EMI - Debts', 'Others', 'Shopping', 'Food', 'Subscriptions']);
    
    // Pattern to identify shopping subcategories
    const shoppingPattern = /^online\s*-?\s*|shopping/i;
    
    // Pattern to identify food-related subcategories
    const foodPattern = /^food\s*|snacks?$/i;
    
    // Pattern to identify subscription services
    const subscriptionPattern = /^(netflix|jio|google|youtube|prime|hotstar|spotify|subscription)/i;
    
    // Pattern to identify EMI/Debts (Emi, Kadan - debt, hault)
    const emiDebtsPattern = /^(emi|kadan|hault)/i;
    
    // Pattern to identify Others (other, astrologer, transport, phone recharge)
    const othersPattern = /^(other|astrologer|transport|phone\s*recharge)/i;
    
    // Combine subcategories
    const combinedMap = new Map<string, { name: string; icon: string; total: number }>();
    let shoppingTotal = 0;
    let shoppingIcon = '🛒';
    let foodTotal = 0;
    let foodIcon = '🍽️';
    let subscriptionTotal = 0;
    let subscriptionIcon = '📺';
    let emiDebtsTotal = 0;
    let emiDebtsIcon = '💳';
    let othersTotal = 0;
    let othersIcon = '📦';
    
    bbCategory.subcategories.forEach(sub => {
      if (shoppingPattern.test(sub.name)) {
        shoppingTotal += sub.total;
        if (shoppingIcon === '🛒' && sub.icon !== '📎') shoppingIcon = sub.icon;
      } else if (foodPattern.test(sub.name)) {
        foodTotal += sub.total;
        if (foodIcon === '🍽️' && sub.icon !== '📎') foodIcon = sub.icon;
      } else if (subscriptionPattern.test(sub.name)) {
        subscriptionTotal += sub.total;
        if (subscriptionIcon === '📺' && sub.icon !== '📎') subscriptionIcon = sub.icon;
      } else if (emiDebtsPattern.test(sub.name)) {
        emiDebtsTotal += sub.total;
        if (emiDebtsIcon === '💳' && sub.icon !== '📎') emiDebtsIcon = sub.icon;
      } else if (othersPattern.test(sub.name)) {
        othersTotal += sub.total;
        if (othersIcon === '📦' && sub.icon !== '📎') othersIcon = sub.icon;
      } else {
        combinedMap.set(sub.name, {
          name: sub.name,
          icon: sub.icon,
          total: sub.total
        });
      }
    });
    
    if (shoppingTotal > 0) {
      combinedMap.set('Shopping', { name: 'Shopping', icon: shoppingIcon, total: shoppingTotal });
    }
    if (foodTotal > 0) {
      combinedMap.set('Food', { name: 'Food', icon: foodIcon, total: foodTotal });
    }
    if (subscriptionTotal > 0) {
      combinedMap.set('Subscriptions', { name: 'Subscriptions', icon: subscriptionIcon, total: subscriptionTotal });
    }
    if (emiDebtsTotal > 0) {
      combinedMap.set('EMI - Debts', { name: 'EMI - Debts', icon: emiDebtsIcon, total: emiDebtsTotal });
    }
    if (othersTotal > 0) {
      combinedMap.set('Others', { name: 'Others', icon: othersIcon, total: othersTotal });
    }
    
    const bbTotal = bbCategory.categoryTotal;
    
    // Sort by total first, then assign colors based on position
    const sortedItems = Array.from(combinedMap.values())
      .map(sub => ({
        name: sub.name,
        icon: sub.icon,
        total: sub.total,
        percentage: bbTotal > 0 ? Math.round((sub.total / bbTotal) * 100) : 0,
        isConsolidated: consolidatedCategories.has(sub.name)
      }))
      .sort((a, b) => b.total - a.total);
    
    // Assign colors based on row position (index)
    return sortedItems.map((item, index) => ({
      ...item,
      color: rowColors[Math.min(index, rowColors.length - 1)]
    }));
  });

  // Get total BB spending
  protected bbTotalSpending = computed(() => {
    const bbCategory = this.subcategoryStats().find(cat => cat.categoryName === 'BB');
    return bbCategory?.categoryTotal || 0;
  });

  // Computed Values - Home Subcategory Heatmap Data
  protected homeSubcategoryHeatmap = computed(() => {
    const homeCategory = this.subcategoryStats().find(cat => cat.categoryName === 'Home');
    if (!homeCategory) return [];
    
    // Define row-based colors for Home subcategories (shades of yellow)
    // Row 1 (highest spending): Dark yellow
    // Row 2: Light yellow  
    // Row 3+: Lighter yellow
    const rowColors = [
      '#ca8a04',  // Row 1 - Dark yellow
      '#eab308',  // Row 2 - Light yellow
      '#facc15',  // Row 3 - Lighter yellow
      '#fde047',  // Row 4 - Even lighter
      '#fef08a',  // Row 5 - Very light
      '#fef9c3',  // Row 6+ - Lightest
    ];
    
    // Consolidated category names
    const consolidatedCategories = new Set(['Groceries', 'Furniture', 'Subscriptions', 'Others']);
    
    // Pattern to identify groceries/provisions subcategories (consolidated)
    const groceriesPattern = /groceries?|provisions?|instamart|blinkit/i;
    
    // Pattern for "Others" - shopping, decor, recharge, food
    const othersPattern = /^(online\s*-?\s*|shopping|decor|recharge|food\s*|snacks?$)/i;
    
    // Pattern for "Furniture" - sofa cupboard, AC, dress plast
    const furniturePattern = /^(sofa\s*cupboard|ac|dress\s*plast)/i;
    
    // Pattern to identify subscription services
    const subscriptionPattern = /^(netflix|jio|google|youtube|prime|hotstar|spotify|subscription)/i;
    
    // Combine subcategories
    const combinedMap = new Map<string, { name: string; icon: string; total: number }>();
    let groceriesTotal = 0;
    let groceriesIcon = '🛒';
    let othersTotal = 0;
    let othersIcon = '📦';
    let furnitureTotal = 0;
    let furnitureIcon = '🪑';
    let subscriptionTotal = 0;
    let subscriptionIcon = '📺';
    
    homeCategory.subcategories.forEach(sub => {
      if (groceriesPattern.test(sub.name)) {
        groceriesTotal += sub.total;
        if (groceriesIcon === '🛒' && sub.icon !== '📎') groceriesIcon = sub.icon;
      } else if (furniturePattern.test(sub.name)) {
        furnitureTotal += sub.total;
        if (furnitureIcon === '🪑' && sub.icon !== '📎') furnitureIcon = sub.icon;
      } else if (othersPattern.test(sub.name)) {
        othersTotal += sub.total;
        if (othersIcon === '📦' && sub.icon !== '📎') othersIcon = sub.icon;
      } else if (subscriptionPattern.test(sub.name)) {
        subscriptionTotal += sub.total;
        if (subscriptionIcon === '📺' && sub.icon !== '📎') subscriptionIcon = sub.icon;
      } else {
        combinedMap.set(sub.name, {
          name: sub.name,
          icon: sub.icon,
          total: sub.total
        });
      }
    });
    
    if (groceriesTotal > 0) {
      combinedMap.set('Groceries', { name: 'Groceries', icon: groceriesIcon, total: groceriesTotal });
    }
    if (furnitureTotal > 0) {
      combinedMap.set('Furniture', { name: 'Furniture', icon: furnitureIcon, total: furnitureTotal });
    }
    if (othersTotal > 0) {
      combinedMap.set('Others', { name: 'Others', icon: othersIcon, total: othersTotal });
    }
    if (subscriptionTotal > 0) {
      combinedMap.set('Subscriptions', { name: 'Subscriptions', icon: subscriptionIcon, total: subscriptionTotal });
    }
    
    const homeTotal = homeCategory.categoryTotal;
    
    // Sort by total first, then assign colors based on position
    const sortedItems = Array.from(combinedMap.values())
      .map(sub => ({
        name: sub.name,
        icon: sub.icon,
        total: sub.total,
        percentage: homeTotal > 0 ? Math.round((sub.total / homeTotal) * 100) : 0,
        isConsolidated: consolidatedCategories.has(sub.name)
      }))
      .sort((a, b) => b.total - a.total);
    
    // Assign colors based on row position (index)
    return sortedItems.map((item, index) => ({
      ...item,
      color: rowColors[Math.min(index, rowColors.length - 1)]
    }));
  });

  // Get total Home spending
  protected homeTotalSpending = computed(() => {
    const homeCategory = this.subcategoryStats().find(cat => cat.categoryName === 'Home');
    return homeCategory?.categoryTotal || 0;
  });

  // ============================================
  // Computed Values - Investment Breakdown Heatmap (from Expense table)
  // ============================================
  protected investmentBreakdownHeatmap = computed(() => {
    // Filter expenses for Investment category only
    const investmentExpenses = this.expenseData()
      .filter(exp => !exp.isDeleted && exp.categoryName === 'Investment');
    
    if (investmentExpenses.length === 0) return [];
    
    // Define row-based colors for Investment types (shades of green)
    const rowColors = [
      '#15803d',  // Row 1 - Dark green
      '#16a34a',  // Row 2 - Medium dark green
      '#22c55e',  // Row 3 - Medium green
      '#4ade80',  // Row 4 - Light green
      '#86efac',  // Row 5 - Lighter green
      '#bbf7d0',  // Row 6+ - Lightest green
    ];
    
    // Investment type icons mapping
    const investmentIcons: Record<string, string> = {
      'Physical Gold': '🥇',
      'MF - SIP': '📊',
      'Stocks': '📈',
      'PPF': '🏦',
      'PF': '💼',
      'NPS': '🏛️',
      'RD': '💰',
      'Land': '🏞️',
      'House': '🏠',
      'Gold': '🥇',
      'Mutual Fund': '📊',
      'SIP': '📊',
      'Fixed Deposit': '🏦',
      'FD': '🏦'
    };
    
    // Group expenses by subcategory (investment type)
    const investmentMap = new Map<string, { 
      name: string; 
      icon: string; 
      total: number; 
      count: number 
    }>();
    
    investmentExpenses.forEach(exp => {
      const investmentType = exp.subcategory || 'Other Investment';
      const existing = investmentMap.get(investmentType);
      const amount = exp.amount || 0;
      
      if (existing) {
        existing.total += amount;
        existing.count += 1;
      } else {
        investmentMap.set(investmentType, {
          name: investmentType,
          icon: exp.subcategoryIcon || investmentIcons[investmentType] || '�',
          total: amount,
          count: 1
        });
      }
    });
    
    // Calculate total investment
    const totalInvestment = Array.from(investmentMap.values())
      .reduce((sum, item) => sum + item.total, 0);
    
    // Sort by total invested and assign colors
    const sortedItems = Array.from(investmentMap.values())
      .map(item => ({
        name: item.name,
        icon: item.icon,
        total: item.total,
        count: item.count,
        percentage: totalInvestment > 0 ? Math.round((item.total / totalInvestment) * 100) : 0,
        isConsolidated: false
      }))
      .sort((a, b) => b.total - a.total);
    
    return sortedItems.map((item, index) => ({
      ...item,
      color: rowColors[Math.min(index, rowColors.length - 1)]
    }));
  });

  // Get total investment value from expense data
  protected investmentTotalValue = computed(() => {
    return this.investmentBreakdownHeatmap()
      .reduce((sum, item) => sum + item.total, 0);
  });

  // State for Investment breakdown popup
  protected selectedInvestmentBreakdown = signal<{
    type: string;
    icon: string;
    total: number;
    color: string;
    investments: { year: number; month: string; notes?: string; amount: number }[];
  } | null>(null);

  // Open Investment breakdown popup
  protected openInvestmentBreakdownPopup(investmentType: string): void {
    // Filter expenses for Investment category and the specific subcategory (investment type)
    const expenses = this.expenseData()
      .filter(exp => !exp.isDeleted && exp.categoryName === 'Investment' && (exp.subcategory === investmentType || (!exp.subcategory && investmentType === 'Other Investment')));
    
    // Get the heatmap item for color and icon
    const heatmapItem = this.investmentBreakdownHeatmap().find(item => item.name === investmentType);
    
    const matchingExpenses = expenses.map(exp => ({
      year: exp.year,
      month: exp.month,
      notes: exp.notes,
      amount: exp.amount || 0
    }));
    
    // Sort by year desc, then by amount desc
    matchingExpenses.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return b.amount - a.amount;
    });

    this.selectedInvestmentBreakdown.set({
      type: investmentType,
      icon: heatmapItem?.icon || '💵',
      total: heatmapItem?.total || 0,
      color: heatmapItem?.color || '#22c55e',
      investments: matchingExpenses
    });
  }

  // Close Investment breakdown popup
  protected closeInvestmentBreakdownPopup(): void {
    this.selectedInvestmentBreakdown.set(null);
  }

  // State for Category Distribution popup
  protected showDistributionPopup = signal<boolean>(false);

  // Open Category Distribution popup
  protected openDistributionPopup(): void {
    this.showDistributionPopup.set(true);
  }

  // Close Category Distribution popup
  protected closeDistributionPopup(): void {
    this.showDistributionPopup.set(false);
  }

  // State for Abi breakdown popup
  protected selectedAbiBreakdown = signal<{
    name: string;
    icon: string;
    total: number;
    color: string;
    isConsolidated: boolean;
    showAllColumns: boolean; // For showing Month, Year, Subcategory, Notes, Amount
    expenses: { month: string; year: number; amount: number; notes?: string; subcategory?: string }[];
  } | null>(null);

  // Open Abi breakdown popup - shows actual expense entries with year/month
  protected openAbiBreakdownPopup(subcategoryName: string): void {
    const expenses = this.expenseData();
    
    // Define patterns for combined categories
    const patterns: Record<string, RegExp> = {
      'Shopping': /^online\s*-?\s*|shopping/i,
      'Food': /^food\s*|snacks?$/i,
      'Subscriptions': /^(netflix|jio|google|youtube|prime|hotstar|spotify|subscription)/i,
      'Trips': /trip/i,
      'Temple & God': /^(god|temple|pooja|puja)/i,
      'Miscellaneous': /^(miscellaneous|misc|relatives?)/i,
      'Specs & Lenz': /^contact\s*lenz/i,
    };
    
    const isConsolidated = !!patterns[subcategoryName];
    
    // Categories that should show Subcategory/Notes columns instead of Year/Month
    // This includes consolidated categories AND specific single subcategories
    const showNotesColumns = new Set(['Shopping', 'Subscriptions', 'Food', 'Trips', 'Temple & God', 'Amma', 'Appa', 'Dhanush', 'Household']);
    const useNotesFormat = showNotesColumns.has(subcategoryName);
    
    // Categories that should show ALL columns: Month, Year, Subcategory, Notes, Amount
    const showAllColumnsSet = new Set(['miscellaneous', 'gifts', 'mis', 'others']);
    const showAllColumns = showAllColumnsSet.has(subcategoryName.toLowerCase());

    // Get the heatmap item for color and icon
    const heatmapItem = this.abiSubcategoryHeatmap().find(item => item.name === subcategoryName);
    
    // Filter expenses for Abi category
    const abiExpenses = expenses.filter(exp => exp.categoryName === 'Abi');
    
    let matchingExpenses: { month: string; year: number; amount: number; notes?: string; subcategory?: string }[] = [];
    
    if (isConsolidated) {
      // This is a combined category - find all matching expenses
      matchingExpenses = abiExpenses
        .filter(exp => exp.subcategory && patterns[subcategoryName].test(exp.subcategory))
        .map(exp => ({
          month: exp.month,
          year: exp.year,
          amount: exp.amount,
          notes: exp.notes,
          subcategory: exp.subcategory
        }));
    } else {
      // This is a single subcategory - exact match or renamed
      let searchName = subcategoryName;
      if (subcategoryName === 'Specs & Lenz') {
        searchName = 'Contact Lenz';
      }
      matchingExpenses = abiExpenses
        .filter(exp => exp.subcategory?.toLowerCase() === searchName.toLowerCase())
        .map(exp => ({
          month: exp.month,
          year: exp.year,
          amount: exp.amount,
          notes: exp.notes,
          subcategory: exp.subcategory
        }));
    }
    
    // Sort by year desc, then by month
    const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    matchingExpenses.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month);
    });

    this.selectedAbiBreakdown.set({
      name: subcategoryName,
      icon: heatmapItem?.icon || '📦',
      total: heatmapItem?.total || 0,
      color: heatmapItem?.color || '#a78bfa',
      isConsolidated: useNotesFormat || showAllColumns, // Use notes format for consolidated + special subcategories
      showAllColumns, // For showing all 5 columns
      expenses: matchingExpenses
    });
  }

  // Close Abi breakdown popup
  protected closeAbiBreakdownPopup(): void {
    this.selectedAbiBreakdown.set(null);
  }

  // State for BB breakdown popup
  protected selectedBbBreakdown = signal<{
    name: string;
    icon: string;
    total: number;
    color: string;
    isConsolidated: boolean;
    showAllColumns: boolean; // For EMI-Debts: show Month, Year, Subcategory, Notes
    expenses: { month: string; year: number; amount: number; notes?: string; subcategory?: string }[];
  } | null>(null);

  // Open BB breakdown popup - shows actual expense entries with year/month
  protected openBbBreakdownPopup(subcategoryName: string): void {
    const expenses = this.expenseData();
    
    // Define patterns for combined categories (matching bbSubcategoryHeatmap)
    const patterns: Record<string, RegExp> = {
      'Shopping': /^online\s*-?\s*|shopping/i,
      'Food': /^food\s*|snacks?$/i,
      'Subscriptions': /^(netflix|jio|google|youtube|prime|hotstar|spotify|subscription)/i,
      'EMI - Debts': /^(emi|kadan|hault)/i,
      'Others': /^(other|astrologer|transport|phone\s*recharge)/i,
    };
    
    const isConsolidated = !!patterns[subcategoryName];
    
    // Categories that should show Subcategory/Notes columns instead of Year/Month
    // This includes consolidated categories AND specific single subcategories
    const showNotesColumns = new Set(['Shopping', 'Food', 'Subscriptions', 'Amma', 'Appa', 'Dhanush', 'Household']);
    const useNotesFormat = showNotesColumns.has(subcategoryName);
    
    // Categories that should show ALL columns: Month, Year, Subcategory, Notes, Amount
    const showAllColumnsSet = new Set(['emi - debts', 'others', 'gifts', 'mis', 'miscellaneous']);
    const showAllColumns = showAllColumnsSet.has(subcategoryName.toLowerCase());

    // Get the heatmap item for color and icon
    const heatmapItem = this.bbSubcategoryHeatmap().find(item => item.name === subcategoryName);
    
    // Filter expenses for BB category
    const bbExpenses = expenses.filter(exp => exp.categoryName === 'BB');
    
    let matchingExpenses: { month: string; year: number; amount: number; notes?: string; subcategory?: string }[] = [];
    
    if (isConsolidated) {
      // This is a combined category - find all matching expenses
      matchingExpenses = bbExpenses
        .filter(exp => exp.subcategory && patterns[subcategoryName].test(exp.subcategory))
        .map(exp => ({
          month: exp.month,
          year: exp.year,
          amount: exp.amount,
          notes: exp.notes,
          subcategory: exp.subcategory
        }));
    } else {
      // This is a single subcategory - exact match
      matchingExpenses = bbExpenses
        .filter(exp => exp.subcategory?.toLowerCase() === subcategoryName.toLowerCase())
        .map(exp => ({
          month: exp.month,
          year: exp.year,
          amount: exp.amount,
          notes: exp.notes,
          subcategory: exp.subcategory
        }));
    }
    
    // Sort by year desc, then by month
    const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    matchingExpenses.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month);
    });

    this.selectedBbBreakdown.set({
      name: subcategoryName,
      icon: heatmapItem?.icon || '📦',
      total: heatmapItem?.total || 0,
      color: heatmapItem?.color || '#60a5fa',
      isConsolidated: useNotesFormat || showAllColumns, // Use notes format for consolidated + special subcategories
      showAllColumns, // For EMI-Debts: show all columns
      expenses: matchingExpenses
    });
  }

  // Close BB breakdown popup
  protected closeBbBreakdownPopup(): void {
    this.selectedBbBreakdown.set(null);
  }

  // State for Home breakdown popup
  protected selectedHomeBreakdown = signal<{
    name: string;
    icon: string;
    total: number;
    color: string;
    isConsolidated: boolean;
    showAllColumns: boolean; // For showing Month, Year, Subcategory, Notes, Amount
    expenses: { month: string; year: number; amount: number; notes?: string; subcategory?: string }[];
  } | null>(null);

  // Open Home breakdown popup - shows actual expense entries with year/month
  protected openHomeBreakdownPopup(subcategoryName: string): void {
    const expenses = this.expenseData();
    
    // Define patterns for combined categories (matching homeSubcategoryHeatmap)
    const patterns: Record<string, RegExp> = {
      'Groceries': /groceries?|provisions?|instamart|blinkit/i,
      'Others': /^(online\s*-?\s*|shopping|decor|recharge|food\s*|snacks?$)/i,
      'Furniture': /^(sofa\s*cupboard|ac|dress\s*plast)/i,
      'Subscriptions': /^(netflix|jio|google|youtube|prime|hotstar|spotify|subscription)/i,
    };
    
    const isConsolidated = !!patterns[subcategoryName];
    
    // Categories that should show Subcategory/Notes columns instead of Year/Month
    // This includes consolidated categories AND specific single subcategories
    const showNotesColumns = new Set(['Groceries', 'Furniture', 'Subscriptions', 'Amma', 'Appa', 'Dhanush', 'Household']);
    const useNotesFormat = showNotesColumns.has(subcategoryName);
    
    // Categories that should show ALL columns: Month, Year, Subcategory, Notes, Amount
    const showAllColumnsSet = new Set(['others', 'gifts', 'mis', 'miscellaneous']);
    const showAllColumns = showAllColumnsSet.has(subcategoryName.toLowerCase());

    // Get the heatmap item for color and icon
    const heatmapItem = this.homeSubcategoryHeatmap().find(item => item.name === subcategoryName);
    
    // Filter expenses for Home category
    const homeExpenses = expenses.filter(exp => exp.categoryName === 'Home');
    
    let matchingExpenses: { month: string; year: number; amount: number; notes?: string; subcategory?: string }[] = [];
    
    if (isConsolidated) {
      // This is a combined category - find all matching expenses
      matchingExpenses = homeExpenses
        .filter(exp => exp.subcategory && patterns[subcategoryName].test(exp.subcategory))
        .map(exp => ({
          month: exp.month,
          year: exp.year,
          amount: exp.amount,
          notes: exp.notes,
          subcategory: exp.subcategory
        }));
    } else {
      // This is a single subcategory - exact match
      matchingExpenses = homeExpenses
        .filter(exp => exp.subcategory?.toLowerCase() === subcategoryName.toLowerCase())
        .map(exp => ({
          month: exp.month,
          year: exp.year,
          amount: exp.amount,
          notes: exp.notes,
          subcategory: exp.subcategory
        }));
    }
    
    // Sort by year desc, then by month
    const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    matchingExpenses.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month);
    });

    this.selectedHomeBreakdown.set({
      name: subcategoryName,
      icon: heatmapItem?.icon || '📦',
      total: heatmapItem?.total || 0,
      color: heatmapItem?.color || '#fef08a',
      isConsolidated: useNotesFormat || showAllColumns, // Use notes format for consolidated + special subcategories
      showAllColumns, // For showing all 5 columns
      expenses: matchingExpenses
    });
  }

  // Close Home breakdown popup
  protected closeHomeBreakdownPopup(): void {
    this.selectedHomeBreakdown.set(null);
  }

  // State for expanded categories in stats widget
  protected expandedCategories = signal<Set<string>>(new Set());

  // State for category popup
  protected selectedCategoryData = signal<{
    categoryName: string;
    categoryIcon: string;
    categoryTotal: number;
    categoryColor: string;
    subcategories: {
      name: string;
      icon: string;
      total: number;
      percentage: number;
      globalPercentage: number;
    }[];
  } | null>(null);

  // Open category popup with subcategory details
  protected openCategoryPopup(categoryName: string): void {
    const categoryData = this.subcategoryStats().find(c => c.categoryName === categoryName);
    if (categoryData) {
      this.selectedCategoryData.set(categoryData);
    }
  }

  // Close category popup
  protected closeCategoryPopup(): void {
    this.selectedCategoryData.set(null);
  }

  // Get category percentage of total spending
  protected getCategoryPercentage(categoryName: string): number {
    const category = this.categorySpendingWithPercentage().find(c => c.name === categoryName);
    return category?.percentage || 0;
  }

  // Toggle category expansion
  protected toggleCategoryExpansion(categoryName: string): void {
    const current = this.expandedCategories();
    const newSet = new Set(current);
    if (newSet.has(categoryName)) {
      newSet.delete(categoryName);
    } else {
      newSet.add(categoryName);
    }
    this.expandedCategories.set(newSet);
  }

  // Check if category is expanded
  protected isCategoryExpanded(categoryName: string): boolean {
    return this.expandedCategories().has(categoryName);
  }

  // Helper method to generate conic-gradient for donut chart
  protected getConicGradient(): string {
    const categories = this.categorySpendingWithPercentage();
    if (categories.length === 0) return 'conic-gradient(#e5e7eb 0deg 360deg)';
    
    let gradientStops: string[] = [];
    let currentAngle = 0;
    
    categories.forEach((cat, index) => {
      const startAngle = currentAngle;
      const endAngle = currentAngle + (cat.percentage * 3.6); // 360 / 100 = 3.6
      gradientStops.push(`${cat.color} ${startAngle}deg ${endAngle}deg`);
      currentAngle = endAngle;
    });
    
    return `conic-gradient(from 0deg, ${gradientStops.join(', ')})`;
  }

  // Helper method to get rotation for each donut segment (for hover tooltips)
  protected getSegmentRotation(index: number): number {
    const categories = this.categorySpendingWithPercentage();
    let rotation = 0;
    for (let i = 0; i < index; i++) {
      rotation += categories[i].percentage * 3.6; // 360 / 100 = 3.6
    }
    return rotation;
  }

  // Generate SVG path for a donut segment (for hover detection)
  protected getSegmentPath(index: number): string {
    const categories = this.categorySpendingWithPercentage();
    if (index >= categories.length) return '';
    
    const category = categories[index];
    const percentage = category.percentage;
    
    // Calculate start and end angles (in radians, starting from top = -90 degrees)
    let startAngle = -90; // Start from top
    for (let i = 0; i < index; i++) {
      startAngle += categories[i].percentage * 3.6;
    }
    const endAngle = startAngle + percentage * 3.6;
    
    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    // Center and radii (outer radius = 50, inner radius for donut = 28)
    const cx = 50, cy = 50;
    const outerR = 50;
    const innerR = 28;
    
    // Calculate points
    const x1 = cx + outerR * Math.cos(startRad);
    const y1 = cy + outerR * Math.sin(startRad);
    const x2 = cx + outerR * Math.cos(endRad);
    const y2 = cy + outerR * Math.sin(endRad);
    const x3 = cx + innerR * Math.cos(endRad);
    const y3 = cy + innerR * Math.sin(endRad);
    const x4 = cx + innerR * Math.cos(startRad);
    const y4 = cy + innerR * Math.sin(startRad);
    
    // Large arc flag (1 if angle > 180 degrees)
    const largeArc = percentage > 50 ? 1 : 0;
    
    // Create path: outer arc, line to inner, inner arc (reverse), close
    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  }

  // Donut chart hover handlers
  protected onSegmentHover(category: { name: string; icon: string; total: number; percentage: number; color: string }, index?: number): void {
    this.hoveredCategory.set({ ...category, index });
  }

  protected onSegmentLeave(): void {
    this.hoveredCategory.set(null);
  }

  // Helper method to calculate stroke offset for pie chart segments (legacy)
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
