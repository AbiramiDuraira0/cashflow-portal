import { Component, OnInit, signal, computed, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExpenseService, ExpenseEntry, ExpenseFormData } from '../../services/expense.service';
import { CategoryService } from '../../services/category.service';
import { IncomeService } from '../../services/income.service';

@Component({
  selector: 'app-expense',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expense.page.html',
  styleUrls: ['./expense.page.scss']
})
export class ExpensePage implements OnInit {
  private expenseService = inject(ExpenseService);
  private categoryService = inject(CategoryService);
  private incomeService = inject(IncomeService);
  private router = inject(Router);

  @ViewChild('amountInput') amountInputRef!: ElementRef<HTMLInputElement>;

  // ============================================
  // Constants (MUST be defined before signals that use them)
  // ============================================
  protected readonly months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // ============================================
  // State Signals (same pattern as IncomePage)
  // ============================================
  protected expenses = this.expenseService.getExpensesSignal();
  protected isLoading = signal(false);

  // Filters
  protected selectedYear = signal<number>(new Date().getFullYear());
  protected selectedMonth = signal<string>('January');

  // Search, Sort, Pagination
  protected searchQuery = signal<string>('');
  protected sortColumn = signal<'date' | 'categoryName' | 'amount'>('date');
  protected sortDirection = signal<'asc' | 'desc'>('desc');
  protected currentPage = signal<number>(1);
  protected pageSize = signal<number>(10);
  protected readonly pageSizeOptions = [5, 10, 25, 50, 100];

  // Toggle states
  protected showExpenseVsIncome = signal(false);

  // Modal states
  protected showExpenseModal = signal(false);
  protected showDeleteConfirm = signal(false);
  protected showCategoryBreakdownModal = signal(false);

  // Form state
  protected editingEntry = signal<ExpenseEntry | null>(null);
  protected deletingEntry = signal<ExpenseEntry | null>(null);

  // Form fields (signal-based, same pattern as IncomePage)
  protected formCategoryName = signal<string>('');
  protected formCategoryId = signal<number>(0);
  protected formAmount = signal<number>(0);
  protected formNotes = signal<string>('');

  // Toast notification state (same pattern as IncomePage)
  protected showToast = signal(false);
  protected toastMessage = signal('');
  protected toastType = signal<'success' | 'error' | 'info'>('success');

  // Recently added animation tracking
  protected recentlyAddedIds = signal<Set<number>>(new Set());

  // ============================================
  // Computed Values
  // ============================================

  protected availableYears = computed(() => {
    const years: number[] = [];
    const currentYear = new Date().getFullYear();
    for (let year = 2021; year <= currentYear; year++) {
      years.push(year);
    }
    return years.reverse();
  });

  /** Active (non-deleted) expenses for the selected month/year */
  protected filteredExpenses = computed(() => {
    const all = this.expenses();
    const month = this.selectedMonth();
    const year = this.selectedYear();
    const query = this.searchQuery().toLowerCase();
    
    let filtered = all.filter(e => e.month === month && e.year === year && !e.isDeleted);
    
    // Apply search filter
    if (query) {
      filtered = filtered.filter(e =>
        e.categoryName.toLowerCase().includes(query) ||
        (e.subcategory && e.subcategory.toLowerCase().includes(query)) ||
        (e.notes && e.notes.toLowerCase().includes(query)) ||
        e.amount.toString().includes(query)
      );
    }
    
    return filtered;
  });

  /** Sorted expenses */
  protected sortedExpenses = computed(() => {
    const expenses = [...this.filteredExpenses()];
    const col = this.sortColumn();
    const dir = this.sortDirection();
    
    expenses.sort((a, b) => {
      let aVal: any, bVal: any;
      
      if (col === 'date') {
        // Sort by year first, then by month
        const aMonthIndex = this.months.indexOf(a.month);
        const bMonthIndex = this.months.indexOf(b.month);
        const aDate = a.year * 12 + aMonthIndex;
        const bDate = b.year * 12 + bMonthIndex;
        aVal = aDate;
        bVal = bDate;
      } else if (col === 'categoryName') {
        aVal = a.categoryName.toLowerCase();
        bVal = b.categoryName.toLowerCase();
      } else if (col === 'amount') {
        aVal = a.amount;
        bVal = b.amount;
      }
      
      if (aVal < bVal) return dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return dir === 'asc' ? 1 : -1;
      return 0;
    });
    
    return expenses;
  });

  /** Paginated expenses */
  protected paginatedExpenses = computed(() => {
    const sorted = this.sortedExpenses();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    const end = start + size;
    return sorted.slice(start, end);
  });

  /** Total pages */
  protected totalPages = computed(() => {
    return Math.ceil(this.sortedExpenses().length / this.pageSize());
  });

  /** Pagination info */
  protected paginationInfo = computed(() => {
    const total = this.sortedExpenses().length;
    const page = this.currentPage();
    const size = this.pageSize();
    const start = total === 0 ? 0 : (page - 1) * size + 1;
    const end = Math.min(page * size, total);
    return `${start}-${end} of ${total}`;
  });

  /** Total expense for the selected month */
  protected totalExpense = computed(() => {
    return this.filteredExpenses().reduce((sum, e) => sum + e.amount, 0);
  });

  /** Monthly income from the IncomeService (DB) */
  protected monthlyIncome = computed(() => {
    const incomeEntries = this.incomeService.getAllEntries();
    const entry = incomeEntries.find(
      e => e.month === this.selectedMonth() && e.year === this.selectedYear()
    );
    return entry?.amount || 0;
  });

  /** Balance = Income - Expense */
  protected remainingBalance = computed(() => {
    return this.monthlyIncome() - this.totalExpense();
  });

  /** Expense as percentage of income (for progress bar) */
  protected expensePercentage = computed(() => {
    const income = this.monthlyIncome();
    if (income <= 0) return 0;
    const pct = (this.totalExpense() / income) * 100;
    return Math.min(pct, 100);
  });

  /** Category-wise breakdown for the selected month */
  protected categoryBreakdown = computed(() => {
    const expenses = this.filteredExpenses();
    const breakdown = new Map<string, { icon: string; total: number; count: number }>();

    expenses.forEach(e => {
      const key = e.categoryName;
      const existing = breakdown.get(key);
      if (existing) {
        existing.total += e.amount;
        existing.count++;
      } else {
        breakdown.set(key, { icon: e.categoryIcon || '📁', total: e.amount, count: 1 });
      }
    });

    return Array.from(breakdown.entries())
      .map(([name, data]) => ({
        categoryName: name,
        categoryIcon: data.icon,
        total: data.total,
        count: data.count,
        percentage: this.totalExpense() > 0
          ? Math.round((data.total / this.totalExpense()) * 100)
          : 0
      }))
      .sort((a, b) => b.total - a.total);
  });

  /** Unique category names from the CategoryService (from DB) */
  protected uniqueCategoryNames = computed(() => {
    const categories = this.categoryService.getAllCategories().filter(c => c.is_active);
    const names = new Set(categories.map(c => c.category_name));
    return Array.from(names).sort();
  });

  /** Subcategories (categories with same name that have sub_category) for the selected category name */
  protected filteredSubcategories = computed(() => {
    const catName = this.formCategoryName();
    if (!catName) return [];
    const subcategories = this.categoryService.getAllCategories().filter(
      c => c.category_name === catName && c.sub_category && c.is_active
    );
    // Sort subcategories in ascending order by sub_category name
    return subcategories.sort((a, b) => {
      const aName = (a.sub_category || '').toLowerCase();
      const bName = (b.sub_category || '').toLowerCase();
      return aName.localeCompare(bName);
    });
  });

  /** Get category icon for category name */
  protected getCategoryIconForName(categoryName: string): string {
    const category = this.categoryService.getAllCategories().find(
      c => c.category_name === categoryName && c.is_active
    );
    return category?.category_icon || '📁';
  }

  // ============================================
  // Lifecycle (same pattern as IncomePage)
  // ============================================

  ngOnInit(): void {
    console.log('💸 Expense component initialized');
    console.log('📊 Initial expenses signal:', this.expenses());
    console.log('⏳ Is loading:', this.isLoading());
    this.loadData();
  }

  private async loadData(): Promise<void> {
    console.log('🔄 Component: Starting loadData...');
    this.isLoading.set(true);
    try {
      console.log('🔄 Component: Loading expense page data...');
      await Promise.all([
        this.expenseService.loadExpenseData(),
        this.categoryService.loadCategories(),
        this.incomeService.loadIncomeData()
      ]);
      console.log('✅ Component: All data loaded successfully');
      console.log('📊 Expenses after load:', this.expenses().length);
    } catch (error) {
      console.error('❌ Error loading data:', error);
      this.showToastNotification('Failed to load data. Please refresh.', 'error');
    } finally {
      console.log('🏁 Component: Setting isLoading to false');
      this.isLoading.set(false);
    }
  }

  // ============================================
  // Year & Month Selection
  // ============================================

  protected changeYear(year: number): void {
    this.selectedYear.set(year);
  }

  protected changeMonth(month: string): void {
    this.selectedMonth.set(month);
    this.currentPage.set(1); // Reset to first page when changing month
  }

  // ============================================
  // Search, Sort, Pagination
  // ============================================

  protected onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1); // Reset to first page on search
  }

  protected sortBy(column: 'date' | 'categoryName' | 'amount'): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  protected getSortIcon(column: string): string {
    if (this.sortColumn() !== column) return '↕️';
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  protected goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  protected changePageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1); // Reset to first page when changing page size
  }

  protected toggleExpenseVsIncome(): void {
    this.showExpenseVsIncome.update(v => !v);
  }

  protected navigateToCategories(): void {
    this.router.navigate(['/category']);
  }

  // ============================================
  // Modal Controls
  // ============================================

  protected openAddExpenseModal(): void {
    this.editingEntry.set(null);
    this.resetForm();
    this.showExpenseModal.set(true);
    // Autofocus amount after modal renders
    setTimeout(() => this.amountInputRef?.nativeElement?.focus(), 150);
  }

  protected openEditExpenseModal(entry: ExpenseEntry): void {
    this.editingEntry.set(entry);
    this.formAmount.set(entry.amount);
    this.formNotes.set(entry.notes || '');

    // Set category name first, then pick the right subcategory
    this.formCategoryName.set(entry.categoryName);
    // Find the matching category record
    const matchingCat = this.categoryService.getAllCategories().find(
      c => c.category_name === entry.categoryName && c.sub_category === entry.subcategory
    );
    this.formCategoryId.set(matchingCat?.category_id || 0);

    this.showExpenseModal.set(true);
    setTimeout(() => this.amountInputRef?.nativeElement?.focus(), 150);
  }

  protected duplicateExpense(entry: ExpenseEntry): void {
    this.editingEntry.set(null); // Clear editing state - this will be a new entry
    this.formAmount.set(entry.amount);
    this.formNotes.set(entry.notes || '');
    this.formCategoryName.set(entry.categoryName);

    const matchingCat = this.categoryService.getAllCategories().find(
      c => c.category_name === entry.categoryName && c.sub_category === entry.subcategory
    );
    this.formCategoryId.set(matchingCat?.category_id || 0);

    this.showExpenseModal.set(true);
    setTimeout(() => this.amountInputRef?.nativeElement?.focus(), 150);
  }

  protected closeExpenseModal(): void {
    this.showExpenseModal.set(false);
    this.editingEntry.set(null);
    this.resetForm();
  }

  protected openDeleteConfirm(entry: ExpenseEntry): void {
    this.deletingEntry.set(entry);
    this.showDeleteConfirm.set(true);
  }

  protected closeDeleteConfirm(): void {
    this.showDeleteConfirm.set(false);
    this.deletingEntry.set(null);
  }

  protected openCategoryBreakdownModal(): void {
    this.showCategoryBreakdownModal.set(true);
  }

  protected closeCategoryBreakdownModal(): void {
    this.showCategoryBreakdownModal.set(false);
  }

  // ============================================
  // Form: Category Change → Subcategory
  // ============================================

  protected onCategoryNameChange(name: string): void {
    this.formCategoryName.set(name);
    this.formCategoryId.set(0); // Reset subcategory selection
  }

  protected onSubcategoryChange(categoryId: number): void {
    this.formCategoryId.set(Number(categoryId));
  }

  // ============================================
  // Save / Update
  // ============================================

  protected async saveExpense(): Promise<void> {
    // Validation
    if (this.formAmount() <= 0 || !this.formCategoryName()) {
      this.showToastNotification('Please fill all required fields', 'error');
      return;
    }

    // If no subcategory selected but subcategories exist, use the first one
    let categoryId = this.formCategoryId();
    if (!categoryId) {
      const cats = this.categoryService.getAllCategories().filter(
        c => c.category_name === this.formCategoryName() && c.is_active
      );
      categoryId = cats[0]?.category_id || 0;
    }

    if (!categoryId) {
      this.showToastNotification('Please select a valid category', 'error');
      return;
    }

    this.isLoading.set(true);
    const editing = this.editingEntry();

    try {
      const formData: ExpenseFormData = {
        month: this.selectedMonth(),
        year: this.selectedYear(),
        categoryId: categoryId,
        amount: this.formAmount(),
        notes: this.formNotes() || undefined
      };

      if (editing) {
        await this.expenseService.updateExpense(editing.id, formData);
        this.showToastNotification('Expense updated successfully!', 'success');
      } else {
        const added = await this.expenseService.addExpense(formData);
        // Track for animation
        const ids = new Set(this.recentlyAddedIds());
        ids.add(added.id);
        this.recentlyAddedIds.set(ids);
        setTimeout(() => {
          const ids = new Set(this.recentlyAddedIds());
          ids.delete(added.id);
          this.recentlyAddedIds.set(ids);
        }, 1500);
        this.showToastNotification('Expense added successfully!', 'success');
      }

      this.closeExpenseModal();
    } catch (error) {
      console.error('Error saving expense:', error);
      this.showToastNotification('Failed to save expense. Please try again.', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Handle Enter key press → save immediately
   */
  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.saveExpense();
    }
  }

  // ============================================
  // Delete
  // ============================================

  protected async confirmDelete(): Promise<void> {
    const entry = this.deletingEntry();
    if (!entry) return;

    this.isLoading.set(true);
    try {
      await this.expenseService.deleteExpense(entry.id);
      this.showToastNotification('Expense deleted successfully!', 'success');
      this.closeDeleteConfirm();
    } catch (error) {
      console.error('Error deleting expense:', error);
      this.showToastNotification('Failed to delete expense.', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  // ============================================
  // Helpers
  // ============================================

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  protected formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  }

  protected isRecentlyAdded(id: number): boolean {
    return this.recentlyAddedIds().has(id);
  }

  protected getBalanceClass(): string {
    const balance = this.remainingBalance();
    if (balance > 0) return 'positive';
    if (balance < 0) return 'negative';
    return 'neutral';
  }

  protected getProgressBarColor(): string {
    const pct = this.expensePercentage();
    if (pct < 50) return '#10b981';  // Green
    if (pct < 75) return '#f59e0b';  // Amber
    if (pct < 90) return '#f97316';  // Orange
    return '#ef4444';                 // Red
  }

  private getCurrentMonthName(): string {
    return this.months[new Date().getMonth()];
  }

  private resetForm(): void {
    this.formCategoryName.set('');
    this.formCategoryId.set(0);
    this.formAmount.set(0);
    this.formNotes.set('');
  }

  private showToastNotification(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }
}
