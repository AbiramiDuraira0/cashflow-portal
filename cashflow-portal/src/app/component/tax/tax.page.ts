import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type TaxEntry = {
  id: string;
  financialYear: string;
  taxableIncome: number;
  taxPaid: number;
  status: 'filed' | 'pending' | 'draft';
  filingDate?: string;
  refundAmount?: number;
  notes?: string;
};

@Component({
  selector: 'app-tax',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tax.page.html',
  styleUrls: ['./tax.page.scss']
})
export class TaxPage implements OnInit {
  protected taxEntries = signal<TaxEntry[]>([]);
  protected loading = signal(false);
  protected selectedYear = signal<string>(this.getCurrentFinancialYear());
  
  // Available financial years
  protected availableYears = computed(() => {
    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      years.push(`${year}-${year + 1}`);
    }
    return years;
  });

  ngOnInit(): void {
    this.loadTaxData();
  }

  private getCurrentFinancialYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Financial year in India: April to March
    if (month >= 3) { // April onwards (month is 0-indexed)
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  }

  private loadTaxData(): void {
    this.loading.set(true);
    
    // Mock data - replace with actual API call
    setTimeout(() => {
      this.taxEntries.set([
        {
          id: '1',
          financialYear: '2025-2026',
          taxableIncome: 1200000,
          taxPaid: 180000,
          status: 'pending',
          notes: 'Tax return to be filed'
        },
        {
          id: '2',
          financialYear: '2024-2025',
          taxableIncome: 1100000,
          taxPaid: 165000,
          status: 'filed',
          filingDate: '2025-07-15',
          refundAmount: 5000,
          notes: 'Filed and refund received'
        }
      ]);
      this.loading.set(false);
    }, 500);
  }

  protected filteredEntries = computed(() => {
    const year = this.selectedYear();
    if (!year) return this.taxEntries();
    return this.taxEntries().filter(entry => entry.financialYear === year);
  });

  protected changeYear(year: string): void {
    this.selectedYear.set(year);
  }

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  protected getStatusClass(status: string): string {
    switch (status) {
      case 'filed': return 'status-filed';
      case 'pending': return 'status-pending';
      case 'draft': return 'status-draft';
      default: return '';
    }
  }

  protected getStatusIcon(status: string): string {
    switch (status) {
      case 'filed': return '✓';
      case 'pending': return '⏳';
      case 'draft': return '📝';
      default: return '';
    }
  }

  protected addTaxEntry(): void {
    console.log('Add new tax entry');
    // TODO: Implement add functionality
  }

  protected editTaxEntry(entry: TaxEntry): void {
    console.log('Edit tax entry:', entry);
    // TODO: Implement edit functionality
  }

  protected deleteTaxEntry(entry: TaxEntry): void {
    console.log('Delete tax entry:', entry);
    // TODO: Implement delete functionality
  }
}
