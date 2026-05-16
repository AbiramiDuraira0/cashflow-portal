import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LifelineService, LifelineEntry } from '../../services/lifeline.service';
import { PaginationHelper } from '../../shared';

@Component({
  selector: 'app-lifeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lifeline.page.html',
  styleUrls: ['./lifeline.page.scss']
})
export class LifelinePage implements OnInit {
  private lifelineService = inject(LifelineService);
  
  // State signals
  protected lifelineEntries = this.lifelineService.getEntriesSignal();
  protected showAddForm = signal(false);
  protected showDeleteConfirm = signal(false);
  protected showSuccessPopup = signal(false);
  protected editingEntry = signal<LifelineEntry | null>(null);
  protected deletingEntry = signal<LifelineEntry | null>(null);
  protected savedEntry = signal<{ date: string; amount: number; notes?: string; isEdit: boolean } | null>(null);
  protected isLoading = signal(false);
  
  // Toast notification state
  protected showToast = signal(false);
  protected toastMessage = signal('');
  protected toastType = signal<'success' | 'error' | 'info'>('success');
  
  // Summary popup state
  protected showSummaryPopup = signal(false);
  
  // Form fields
  protected entryDate = signal<string>('');
  protected amount = signal<number>(0);
  protected notes = signal<string>('');

  // Sorting state
  protected sortColumn = signal<'date' | 'amount' | 'notes'>('date');
  protected sortDirection = signal<'asc' | 'desc'>('asc'); // Default: oldest first

  // Pagination state
  protected currentPage = signal<number>(1);
  protected pageSize = signal<number>(10);
  protected readonly pageSizeOptions = PaginationHelper.PAGE_SIZE_OPTIONS;

  // Computed values
  protected totalAmount = computed(() => {
    return this.lifelineEntries().reduce((sum, entry) => sum + entry.amount, 0);
  });

  protected entriesCount = computed(() => {
    return this.lifelineEntries().length;
  });

  protected sortedEntries = computed(() => {
    const entries = [...this.lifelineEntries()];
    const column = this.sortColumn();
    const direction = this.sortDirection();

    return entries.sort((a, b) => {
      let comparison = 0;

      switch (column) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'notes':
          const notesA = (a.notes || '').toLowerCase();
          const notesB = (b.notes || '').toLowerCase();
          comparison = notesA.localeCompare(notesB);
          break;
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  });

  // Pagination computed properties
  protected paginationResult = computed(() => {
    return PaginationHelper.paginate(
      this.sortedEntries(),
      this.currentPage(),
      this.pageSize()
    );
  });

  protected paginatedEntries = computed(() => this.paginationResult().items);
  protected totalPages = computed(() => this.paginationResult().totalPages);
  protected paginationInfo = computed(() => 
    PaginationHelper.getPaginationInfo(this.paginationResult())
  );

  // Summary consolidated data - grouped by year
  protected yearlyConsolidation = computed(() => {
    const entries = this.lifelineEntries();
    const yearMap = new Map<number, { count: number; total: number }>();
    
    entries.forEach(entry => {
      const year = new Date(entry.date).getFullYear();
      const existing = yearMap.get(year) || { count: 0, total: 0 };
      yearMap.set(year, {
        count: existing.count + 1,
        total: existing.total + entry.amount
      });
    });
    
    // Convert to array and sort by year descending
    return Array.from(yearMap.entries())
      .map(([year, data]) => ({ year, ...data }))
      .sort((a, b) => b.year - a.year);
  });

  // Summary statistics
  protected summaryStats = computed(() => {
    const entries = this.lifelineEntries();
    if (entries.length === 0) {
      return {
        totalAmount: 0,
        totalEntries: 0,
        averageAmount: 0,
        minAmount: 0,
        maxAmount: 0,
        firstEntry: null as string | null,
        lastEntry: null as string | null
      };
    }
    
    const amounts = entries.map(e => e.amount);
    const dates = entries.map(e => new Date(e.date).getTime());
    
    return {
      totalAmount: amounts.reduce((sum, amt) => sum + amt, 0),
      totalEntries: entries.length,
      averageAmount: amounts.reduce((sum, amt) => sum + amt, 0) / entries.length,
      minAmount: Math.min(...amounts),
      maxAmount: Math.max(...amounts),
      firstEntry: new Date(Math.min(...dates)).toISOString().split('T')[0],
      lastEntry: new Date(Math.max(...dates)).toISOString().split('T')[0]
    };
  });

  // Get page numbers for pagination controls
  getPageNumbers(): number[] {
    return PaginationHelper.getPageNumbers(this.currentPage(), this.totalPages());
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  onPageSizeChange(): void {
    this.currentPage.set(1); // Reset to first page when changing page size
  }

  // Summary popup methods
  openSummaryPopup(): void {
    this.showSummaryPopup.set(true);
  }

  closeSummaryPopup(): void {
    this.showSummaryPopup.set(false);
  }

  // Sort method
  sortBy(column: 'date' | 'amount' | 'notes'): void {
    if (this.sortColumn() === column) {
      // Toggle direction if same column
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, set default direction
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.currentPage.set(1); // Reset to first page when sorting
  }

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    try {
      await this.lifelineService.loadLifelineData();
    } catch (error) {
      this.showToastMessage('Failed to load data', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Form Methods
  openAddForm(): void {
    this.resetForm();
    this.editingEntry.set(null);
    this.showAddForm.set(true);
  }

  closeAddForm(): void {
    this.showAddForm.set(false);
    this.resetForm();
    this.editingEntry.set(null);
  }

  /**
   * Handle keyboard events in modal
   * - Enter key → save (except in textarea)
   * - Escape key → close modal
   */
  onKeyDown(event: KeyboardEvent): void {
    // Handle Escape key to close modal
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeAddForm();
      return;
    }
    
    // Handle Enter key to save (skip if in textarea for multi-line notes)
    const target = event.target as HTMLElement;
    const isTextarea = target.tagName.toLowerCase() === 'textarea';
    
    if (event.key === 'Enter' && !event.shiftKey && !isTextarea) {
      event.preventDefault();
      this.saveEntry();
    }
  }

  resetForm(): void {
    const today = new Date().toISOString().split('T')[0];
    this.entryDate.set(today);
    this.amount.set(0);
    this.notes.set('');
  }

  // Edit Methods
  editEntry(entry: LifelineEntry): void {
    this.editingEntry.set(entry);
    this.entryDate.set(entry.date);
    this.amount.set(entry.amount);
    this.notes.set(entry.notes || '');
    this.showAddForm.set(true);
  }

  // Duplicate Entry Method
  duplicateEntry(entry: LifelineEntry): void {
    // Pre-fill form with existing entry data but as a new entry
    this.editingEntry.set(null); // Not editing, creating new
    this.entryDate.set(entry.date); // Use original entry's date
    this.amount.set(entry.amount);
    this.notes.set(entry.notes ? `(Copy) ${entry.notes}` : '(Copy)');
    this.showAddForm.set(true);
    this.showToastMessage('Entry duplicated - modify and save', 'info');
  }

  // Delete Methods
  confirmDelete(entry: LifelineEntry): void {
    this.deletingEntry.set(entry);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.deletingEntry.set(null);
    this.showDeleteConfirm.set(false);
  }

  async deleteEntry(): Promise<void> {
    const entry = this.deletingEntry();
    if (!entry) return;

    this.isLoading.set(true);
    try {
      await this.lifelineService.deleteEntry(entry.id);
      this.showToastMessage('Entry deleted successfully', 'success');
      this.cancelDelete();
    } catch (error) {
      this.showToastMessage('Failed to delete entry', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Save Methods
  async saveEntry(): Promise<void> {
    const date = this.entryDate();
    const amount = this.amount();
    const notes = this.notes();

    // Validation
    if (!date) {
      this.showToastMessage('Please select a date', 'error');
      return;
    }
    if (amount <= 0) {
      this.showToastMessage('Please enter a valid amount', 'error');
      return;
    }

    this.isLoading.set(true);
    const editing = this.editingEntry();

    try {
      if (editing) {
        // Update existing entry
        await this.lifelineService.updateEntry(editing.id, {
          date,
          amount,
          notes: notes || undefined
        });
        // Store saved entry details for success popup
        this.savedEntry.set({ date, amount, notes: notes || undefined, isEdit: true });
      } else {
        // Add new entry
        await this.lifelineService.addEntry({
          date,
          amount,
          notes: notes || undefined
        });
        // Store saved entry details for success popup
        this.savedEntry.set({ date, amount, notes: notes || undefined, isEdit: false });
      }
      this.closeAddForm();
      // Show success popup
      this.showSuccessPopup.set(true);
    } catch (error) {
      this.showToastMessage(editing ? 'Failed to update entry' : 'Failed to add entry', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Close Success Popup
  closeSuccessPopup(): void {
    this.showSuccessPopup.set(false);
    this.savedEntry.set(null);
  }

  // Utility Methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  // Toast Methods
  showToastMessage(message: string, type: 'success' | 'error' | 'info'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    
    setTimeout(() => {
      this.showToast.set(false);
    }, 3000);
  }

  closeToast(): void {
    this.showToast.set(false);
  }

  // Refresh data
  async refreshData(): Promise<void> {
    await this.loadData();
    this.showToastMessage('Data refreshed', 'info');
  }
}
