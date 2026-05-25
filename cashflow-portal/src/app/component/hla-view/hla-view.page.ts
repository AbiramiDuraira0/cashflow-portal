import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationHelper, SortingHelper, SortDirection } from '../../shared';

type HlaRecord = {
  id: number;
  name: string;
  icon: string;
  type: 'debt' | 'investment' | 'expense' | 'family' | 'asset' | 'subscription';
  status: 'active' | 'pending' | 'completed';
};

type SortColumn = 'name' | 'type' | 'status';

@Component({
  selector: 'app-hla-view',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './hla-view.page.html',
  styleUrls: ['./hla-view.page.scss']
})
export class HlaViewPage {
  // Page title
  protected pageTitle = 'High Level Allocation Overview';
  
  // Current date for display
  protected currentDate: string;

  // HLA Records - 22 items
  private readonly allRecords: HlaRecord[] = [
    { id: 1, name: 'BB EMI - Debts', icon: '💳', type: 'debt', status: 'active' },
    { id: 2, name: 'Gold Loan', icon: '🥇', type: 'debt', status: 'active' },
    { id: 3, name: 'Stock + MF', icon: '📈', type: 'investment', status: 'active' },
    { id: 4, name: 'PPF + RD', icon: '🏦', type: 'investment', status: 'active' },
    { id: 5, name: 'Crypto Lost', icon: '₿', type: 'investment', status: 'completed' },
    { id: 6, name: 'Ring', icon: '💍', type: 'asset', status: 'completed' },
    { id: 7, name: 'Furniture', icon: '🪑', type: 'asset', status: 'completed' },
    { id: 8, name: 'NPS', icon: '🏛️', type: 'investment', status: 'active' },
    { id: 9, name: 'Trip', icon: '✈️', type: 'expense', status: 'pending' },
    { id: 10, name: 'Wifi + Recharge', icon: '📶', type: 'subscription', status: 'active' },
    { id: 11, name: 'Rajeswari', icon: '👩', type: 'family', status: 'active' },
    { id: 12, name: 'Chit', icon: '📝', type: 'investment', status: 'active' },
    { id: 13, name: 'Amma', icon: '👩‍🦳', type: 'family', status: 'active' },
    { id: 14, name: 'Appa', icon: '👨‍🦳', type: 'family', status: 'active' },
    { id: 15, name: 'Dhanush', icon: '👦', type: 'family', status: 'active' },
    { id: 16, name: 'Scooty', icon: '🛵', type: 'asset', status: 'completed' },
    { id: 17, name: 'Pratheek', icon: '👨', type: 'family', status: 'active' },
    { id: 18, name: 'Gifts', icon: '🎁', type: 'expense', status: 'pending' },
    { id: 19, name: 'Insurance', icon: '🛡️', type: 'expense', status: 'active' },
    { id: 20, name: 'Medical', icon: '🏥', type: 'expense', status: 'pending' },
    { id: 21, name: 'Shopping', icon: '🛒', type: 'expense', status: 'active' },
    { id: 22, name: 'Subscriptions', icon: '📺', type: 'subscription', status: 'active' },
  ];

  // Expose records for template
  protected hlaRecords = this.allRecords;

  // Sorting state
  protected sortColumn = signal<SortColumn>('name');
  protected sortDirection = signal<SortDirection>('asc');

  // Pagination state
  protected currentPage = signal<number>(1);
  protected pageSize = signal<number>(10);
  protected readonly pageSizeOptions = PaginationHelper.PAGE_SIZE_OPTIONS;

  // Computed: Sorted records
  protected sortedRecords = computed(() => {
    return SortingHelper.sort(
      this.allRecords,
      this.sortColumn(),
      this.sortDirection()
    );
  });

  // Computed: Pagination result
  protected paginationResult = computed(() => {
    return PaginationHelper.paginate(
      this.sortedRecords(),
      this.currentPage(),
      this.pageSize()
    );
  });

  // Computed: Paginated records for display
  protected paginatedRecords = computed(() => this.paginationResult().items);

  // Computed: Total pages
  protected totalPages = computed(() => this.paginationResult().totalPages);

  // Computed: Pagination info text
  protected paginationInfo = computed(() =>
    PaginationHelper.getPaginationInfo(this.paginationResult())
  );

  constructor() {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    this.currentDate = now.toLocaleDateString('en-US', options);
  }

  // Helper method to get active count
  getActiveCount(): number {
    return this.allRecords.filter(r => r.status === 'active').length;
  }

  // Helper method to get pending count
  getPendingCount(): number {
    return this.allRecords.filter(r => r.status === 'pending').length;
  }

  // Sorting methods
  sortBy(column: SortColumn): void {
    if (this.sortColumn() === column) {
      // Toggle direction if same column
      this.sortDirection.set(SortingHelper.toggleDirection(this.sortDirection()));
    } else {
      // New column, set default direction
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.currentPage.set(1); // Reset to first page when sorting
  }

  getSortIcon(column: SortColumn): string {
    return SortingHelper.getSortIcon(column, this.sortColumn(), this.sortDirection());
  }

  // Pagination methods
  getPageNumbers(): number[] {
    return PaginationHelper.getPageNumbers(this.currentPage(), this.totalPages());
  }

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

  // Get row number based on pagination
  getRowNumber(index: number): number {
    return (this.currentPage() - 1) * this.pageSize() + index + 1;
  }
}
