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
  protected sortColumn = signal<'date' | 'categoryName' | 'subcategory' | 'amount'>('amount');
  protected sortDirection = signal<'asc' | 'desc'>('desc');
  protected secondarySortColumn = signal<'subcategory' | null>(null);
  protected secondarySortDirection = signal<'asc' | 'desc'>('asc');
  protected currentPage = signal<number>(1);
  protected pageSize = signal<number>(10);
  protected readonly pageSizeOptions = [5, 10, 25, 50, 100];

  // Toggle states
  protected showExpenseVsIncome = signal(false);
  protected groupByCategory = signal(true); // Enable grouping by default
  protected expandedCategories = signal<Set<string>>(new Set()); // Track expanded categories

  // Modal states
  protected showExpenseModal = signal(false);
  protected showDeleteConfirm = signal(false);
  protected showCategoryBreakdownModal = signal(false);

  // Form state
  protected editingEntry = signal<ExpenseEntry | null>(null);
  protected editingEntryId = signal<number | null>(null); // Store ID separately for safety
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

  // Flag to prevent duplicate submissions
  private isSaving = signal(false);

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

  /** Available months based on selected year (2021 starts from August) */
  protected availableMonths = computed(() => {
    const year = this.selectedYear();
    if (year === 2021) {
      // For 2021, only show August to December
      return this.months.slice(7); // Index 7 = August
    }
    return this.months;
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

  /** Sorted expenses with multi-level sorting support */
  protected sortedExpenses = computed(() => {
    const expenses = [...this.filteredExpenses()];
    const col = this.sortColumn();
    const dir = this.sortDirection();
    const secondaryCol = this.secondarySortColumn();
    const secondaryDir = this.secondarySortDirection();
    
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
      } else if (col === 'subcategory') {
        aVal = (a.subcategory || '').toLowerCase();
        bVal = (b.subcategory || '').toLowerCase();
      } else if (col === 'amount') {
        aVal = a.amount;
        bVal = b.amount;
      }
      
      // Primary sort comparison
      let primaryComparison = 0;
      if (aVal < bVal) primaryComparison = dir === 'asc' ? -1 : 1;
      else if (aVal > bVal) primaryComparison = dir === 'asc' ? 1 : -1;
      
      // If primary values are equal and secondary sort is enabled
      if (primaryComparison === 0 && col === 'categoryName' && secondaryCol === 'subcategory') {
        const aSubVal = (a.subcategory || '').toLowerCase();
        const bSubVal = (b.subcategory || '').toLowerCase();
        if (aSubVal < bSubVal) return secondaryDir === 'asc' ? -1 : 1;
        if (aSubVal > bSubVal) return secondaryDir === 'asc' ? 1 : -1;
      }
      
      return primaryComparison;
    });
    
    return expenses;
  });

  /** Grouped expenses by category */
  protected groupedExpenses = computed(() => {
    const sorted = this.sortedExpenses();
    const groups = new Map<string, ExpenseEntry[]>();
    
    sorted.forEach(expense => {
      const categoryKey = expense.categoryName;
      if (!groups.has(categoryKey)) {
        groups.set(categoryKey, []);
      }
      groups.get(categoryKey)!.push(expense);
    });
    
    // Calculate total for percentage calculation
    const grandTotal = sorted.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Convert to array with category info and percentage
    return Array.from(groups.entries()).map(([categoryName, expenses]) => {
      const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const percentage = grandTotal > 0 ? (total / grandTotal) * 100 : 0;
      
      return {
        categoryName,
        categoryIcon: expenses[0].categoryIcon,
        expenses,
        total,
        count: expenses.length,
        percentage
      };
    });
  });

  /** Paginated expenses (flat list or grouped) */
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

  /** Search query for category dropdown */
  protected categorySearchQuery = signal<string>('');

  /** Filtered category names based on search */
  protected filteredCategoryNames = computed(() => {
    const allNames = this.uniqueCategoryNames();
    const searchTerm = this.categorySearchQuery().toLowerCase().trim();
    
    if (!searchTerm) return allNames;
    
    return allNames.filter(name => 
      name.toLowerCase().includes(searchTerm)
    );
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
    
    // Default to grouped and collapsed - no expansion needed
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

  protected async refreshData(): Promise<void> {
    await this.loadData();
  }

  // ============================================
  // Year & Month Selection
  // ============================================

  protected changeYear(year: number): void {
    this.selectedYear.set(year);
    // If changing to 2021 and current month is Jan-Jul, reset to August
    if (year === 2021) {
      const currentMonth = this.selectedMonth();
      const monthIndex = this.months.indexOf(currentMonth);
      if (monthIndex < 7) { // Jan(0) to Jul(6) are not available for 2021
        this.selectedMonth.set('August');
      }
    }
    this.currentPage.set(1); // Reset to first page when changing year
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

  protected toggleGroupByCategory(): void {
    this.groupByCategory.update(v => !v);
    // When toggling grouped view, keep categories collapsed by default
    if (this.groupByCategory()) {
      this.expandedCategories.set(new Set());
    }
  }

  protected toggleCategoryExpand(categoryName: string): void {
    this.expandedCategories.update(set => {
      const newSet = new Set(set);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  }

  protected isCategoryExpanded(categoryName: string): boolean {
    return this.expandedCategories().has(categoryName);
  }

  protected expandAllCategories(): void {
    const allCategories = new Set(this.groupedExpenses().map(g => g.categoryName));
    this.expandedCategories.set(allCategories);
  }

  protected collapseAllCategories(): void {
    this.expandedCategories.set(new Set());
  }

  protected areAllCategoriesExpanded(): boolean {
    const allCategories = this.groupedExpenses().map(g => g.categoryName);
    const expandedSet = this.expandedCategories();
    return allCategories.length > 0 && allCategories.every(cat => expandedSet.has(cat));
  }

  protected areAllCategoriesCollapsed(): boolean {
    return this.expandedCategories().size === 0;
  }

  protected sortBy(column: 'date' | 'categoryName' | 'subcategory' | 'amount'): void {
    const currentPrimary = this.sortColumn();
    const currentSecondary = this.secondarySortColumn();
    
    // If clicking on subcategory and categoryName is already primary sort
    if (column === 'subcategory' && currentPrimary === 'categoryName') {
      if (currentSecondary === 'subcategory') {
        // Toggle secondary sort direction
        this.secondarySortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
      } else {
        // Enable secondary sort
        this.secondarySortColumn.set('subcategory');
        this.secondarySortDirection.set('asc');
      }
    }
    // If clicking on categoryName
    else if (column === 'categoryName') {
      if (currentPrimary === 'categoryName') {
        // Toggle primary sort direction
        this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
      } else {
        // Set as new primary sort, reset secondary
        this.sortColumn.set('categoryName');
        this.sortDirection.set('asc');
        this.secondarySortColumn.set(null);
      }
    }
    // Any other column
    else {
      if (this.sortColumn() === column) {
        // Toggle direction if same column
        this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
      } else {
        // New column, default to ascending, clear secondary sort
        this.sortColumn.set(column);
        this.sortDirection.set('asc');
        this.secondarySortColumn.set(null);
      }
    }
  }

  protected getSortIcon(column: string): string {
    const isPrimary = this.sortColumn() === column;
    const isSecondary = this.secondarySortColumn() === column;
    
    if (isPrimary) {
      return this.sortDirection() === 'asc' ? '↑' : '↓';
    }
    
    if (isSecondary && column === 'subcategory') {
      // Show secondary sort indicator (smaller/different style)
      return this.secondarySortDirection() === 'asc' ? '▲²' : '▼²';
    }
    
    return '↕️';
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
    this.editingEntryId.set(null); // Clear editing ID
    this.resetForm();
    this.showExpenseModal.set(true);
    // Autofocus amount after modal renders
    setTimeout(() => this.amountInputRef?.nativeElement?.focus(), 150);
  }

  protected openEditExpenseModal(entry: ExpenseEntry): void {
    // Store a deep copy of the entry to prevent reference issues
    this.editingEntry.set({ ...entry });
    this.editingEntryId.set(entry.id); // Store ID separately for safety
    this.formAmount.set(entry.amount);
    this.formNotes.set(entry.notes || '');

    // Set category name first, then pick the right subcategory
    this.formCategoryName.set(entry.categoryName);
    // Find the matching category record
    const matchingCat = this.categoryService.getAllCategories().find(
      c => c.category_name === entry.categoryName && c.sub_category === entry.subcategory
    );
    this.formCategoryId.set(matchingCat?.category_id || 0);

    console.log('📝 Edit modal opened for ID:', entry.id, 'Entry:', entry);
    this.showExpenseModal.set(true);
    setTimeout(() => this.amountInputRef?.nativeElement?.focus(), 150);
  }

  protected duplicateExpense(entry: ExpenseEntry): void {
    this.editingEntry.set(null); // Clear editing state - this will be a new entry
    this.editingEntryId.set(null); // Clear editing ID - this is a new entry, not an update
    this.formAmount.set(entry.amount);
    this.formNotes.set(entry.notes || '');
    this.formCategoryName.set(entry.categoryName);

    const matchingCat = this.categoryService.getAllCategories().find(
      c => c.category_name === entry.categoryName && c.sub_category === entry.subcategory
    );
    this.formCategoryId.set(matchingCat?.category_id || 0);

    console.log('📋 Duplicate modal opened - creating NEW entry (editingId: null)');
    this.showExpenseModal.set(true);
    setTimeout(() => this.amountInputRef?.nativeElement?.focus(), 150);
  }

  protected closeExpenseModal(): void {
    this.showExpenseModal.set(false);
    this.editingEntry.set(null);
    this.editingEntryId.set(null); // Clear editing ID
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
    // Prevent duplicate submissions
    if (this.isSaving()) {
      console.warn('Save already in progress, ignoring duplicate request');
      return;
    }

    // Capture editing ID at the start from the dedicated signal
    const editingId = this.editingEntryId();
    
    console.log('💾 Save initiated - Editing ID:', editingId);

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

    // Set saving flag to prevent duplicate submissions
    this.isSaving.set(true);
    this.isLoading.set(true);

    try {
      const formData: ExpenseFormData = {
        month: this.selectedMonth(),
        year: this.selectedYear(),
        categoryId: categoryId,
        amount: this.formAmount(),
        notes: this.formNotes() || undefined
      };

      // Use the captured editingId for the check
      if (editingId && editingId > 0) {
        // Update existing entry
        console.log('✏️ Updating expense ID:', editingId, 'with data:', formData);
        await this.expenseService.updateExpense(editingId, formData);
        this.showToastNotification('Expense updated successfully!', 'success');
      } else {
        // Add new entry
        console.log('➕ Adding new expense with data:', formData);
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
      this.isSaving.set(false);
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
