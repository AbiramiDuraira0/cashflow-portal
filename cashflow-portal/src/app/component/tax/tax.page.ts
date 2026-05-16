import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaxService, TaxEntry, TaxFormData, TaxStatus } from '../../services/tax.service';

interface MonthData {
  month: number;
  monthName: string;
  year?: number;
  taxPaid: number;
  status: TaxStatus;
  entry?: TaxEntry;
}

@Component({
  selector: 'app-tax',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tax.page.html',
  styleUrls: ['./tax.page.scss']
})
export class TaxPage implements OnInit {
  private taxService = inject(TaxService);

  // Signals for UI state
  protected selectedYear = signal<number>(new Date().getFullYear());
  protected showAddEditModal = signal<boolean>(false);
  protected showDeleteModal = signal<boolean>(false);
  protected showFinancialYearModal = signal<boolean>(false);
  protected showYearWiseTaxModal = signal<boolean>(false);
  protected editingEntry = signal<TaxEntry | null>(null);
  protected toastMessage = signal<string>('');
  protected toastVisible = signal<boolean>(false);

  // Form data signals
  protected formYear = signal<number>(new Date().getFullYear());
  protected formMonth = signal<number>(new Date().getMonth() + 1);
  protected formTaxPaid = signal<number>(0);
  protected formTaxableIncome = signal<number>(0);
  protected formStatus = signal<TaxStatus>('paid');
  protected formPaymentDate = signal<string>('');
  protected formPaymentMode = signal<string>('Online');
  protected formNotes = signal<string>('');

  // Get data from service
  protected taxEntries = this.taxService.getTaxEntriesSignal();
  protected loading = this.taxService.getLoadingSignal();

  // Available years (2021-2026)
  protected availableYears = signal<number[]>([2026, 2025, 2024, 2023, 2022, 2021]);

  // Month names
  protected monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Computed: Monthly grid data for selected year
  protected monthlyData = computed(() => {
    const year = this.selectedYear();
    const entries = this.taxEntries().filter(e => e.year === year);
    
    // For 2021, start from August (month 8), otherwise show all 12 months
    const startMonth = year === 2021 ? 8 : 1;
    
    const months: MonthData[] = [];
    for (let month = startMonth; month <= 12; month++) {
      const entry = entries.find(e => e.month === month);
      months.push({
        month,
        monthName: this.monthNames[month - 1],
        taxPaid: entry?.tax_paid || 0,
        status: entry?.status || 'pending',
        entry
      });
    }
    return months;
  });

  // Computed: Tax summary for selected year
  protected summary = computed(() => this.taxService.getTaxSummary(this.selectedYear()));

  // Computed: Financial year breakdown (April prev year - March current year)
  protected financialYearBreakdown = computed(() => {
    const year = this.selectedYear();
    const allEntries = this.taxEntries();
    const months: MonthData[] = [];

    // April to December of previous year
    for (let month = 4; month <= 12; month++) {
      const entry = allEntries.find(e => e.year === year - 1 && e.month === month);
      months.push({
        month,
        monthName: this.monthNames[month - 1],
        year: year - 1,
        taxPaid: entry?.tax_paid || 0,
        status: entry?.status || 'pending',
        entry
      });
    }

    // January to March of current year
    for (let month = 1; month <= 3; month++) {
      const entry = allEntries.find(e => e.year === year && e.month === month);
      months.push({
        month,
        monthName: this.monthNames[month - 1],
        year: year,
        taxPaid: entry?.tax_paid || 0,
        status: entry?.status || 'pending',
        entry
      });
    }

    return months;
  });

  // Computed: Financial year total
  protected financialYearTotal = computed(() => {
    return this.financialYearBreakdown().reduce((sum, month) => sum + month.taxPaid, 0);
  });

  // Computed: Year-wise tax breakdown
  protected yearWiseTaxBreakdown = computed(() => {
    const allEntries = this.taxEntries();
    const years = this.availableYears();
    
    return years.map(year => {
      const yearEntries = allEntries.filter(e => e.year === year);
      const totalTax = yearEntries.reduce((sum, e) => sum + e.tax_paid, 0);
      const monthsPaid = yearEntries.length;
      const averagePerMonth = monthsPaid > 0 ? totalTax / monthsPaid : 0;
      
      return {
        year,
        totalTax,
        monthsPaid,
        averagePerMonth
      };
    });
  });

  // Computed: Total income tax across all years
  protected totalIncomeTax = computed(() => {
    return this.taxEntries().reduce((sum, entry) => sum + entry.tax_paid, 0);
  });

  ngOnInit(): void {
    console.log('🧾 Tax Page Initialized');
  }

  // Refresh data
  protected async refreshData(): Promise<void> {
    await this.taxService.loadTaxEntries();
  }

  // Change selected year
  protected changeYear(year: number): void {
    this.selectedYear.set(year);
  }

  // Open add modal
  protected openAddModal(month?: number): void {
    this.editingEntry.set(null);
    this.resetForm();
    if (month) {
      this.formMonth.set(month);
    }
    this.formYear.set(this.selectedYear());
    this.showAddEditModal.set(true);
  }

  // Open add modal for specific month
  protected openAddModalForMonth(month: number): void {
    this.openAddModal(month);
  }

  // Open financial year modal
  protected openFinancialYearModal(): void {
    this.showFinancialYearModal.set(true);
  }

  // Open year-wise tax modal
  protected openYearWiseTaxModal(): void {
    this.showYearWiseTaxModal.set(true);
  }

  // Open edit modal
  protected openEditModal(entry: TaxEntry): void {
    this.editingEntry.set(entry);
    this.formYear.set(entry.year);
    this.formMonth.set(entry.month);
    this.formTaxPaid.set(entry.tax_paid);
    this.formTaxableIncome.set(entry.taxable_income || 0);
    this.formStatus.set(entry.status);
    this.formPaymentDate.set(entry.payment_date || '');
    this.formPaymentMode.set(entry.payment_mode || 'Online');
    this.formNotes.set(entry.notes || '');
    this.showAddEditModal.set(true);
  }

  // Open delete confirmation modal
  protected openDeleteModal(entry: TaxEntry): void {
    this.editingEntry.set(entry);
    this.showDeleteModal.set(true);
  }

  // Close all modals
  protected closeModals(): void {
    this.showAddEditModal.set(false);
    this.showDeleteModal.set(false);
    this.showFinancialYearModal.set(false);
    this.showYearWiseTaxModal.set(false);
    this.editingEntry.set(null);
  }

  // Reset form
  protected resetForm(): void {
    this.formYear.set(this.selectedYear());
    this.formMonth.set(new Date().getMonth() + 1);
    this.formTaxPaid.set(0);
    this.formTaxableIncome.set(0);
    this.formStatus.set('paid');
    this.formPaymentDate.set('');
    this.formPaymentMode.set('Online');
    this.formNotes.set('');
  }

  // Save tax entry (add or update)
  protected async saveTaxEntry(): Promise<void> {
    if (this.formTaxPaid() < 0) {
      this.showToast('⚠️ Tax paid amount cannot be negative');
      return;
    }

    try {
      const data: TaxFormData = {
        year: this.formYear(),
        month: this.formMonth(),
        tax_paid: this.formTaxPaid(),
        taxable_income: this.formTaxableIncome() || undefined,
        status: this.formStatus(),
        payment_date: this.formPaymentDate() || undefined,
        payment_mode: this.formPaymentMode() || undefined,
        notes: this.formNotes() || undefined
      };

      const editing = this.editingEntry();
      if (editing) {
        await this.taxService.updateTaxEntry(editing.tax_id, data);
        this.showToast('✅ Tax entry updated successfully');
      } else {
        await this.taxService.addTaxEntry(data);
        this.showToast('✅ Tax entry added successfully');
      }

      this.closeModals();
    } catch (error) {
      this.showToast('❌ Failed to save tax entry');
      console.error('Error saving tax entry:', error);
    }
  }

  // Delete tax entry
  protected async confirmDelete(): Promise<void> {
    const entry = this.editingEntry();
    if (!entry) return;

    try {
      await this.taxService.deleteTaxEntry(entry.tax_id);
      this.showToast('✅ Tax entry deleted successfully');
      this.closeModals();
    } catch (error) {
      this.showToast('❌ Failed to delete tax entry');
      console.error('Error deleting tax entry:', error);
    }
  }

  // Show toast notification
  protected showToast(message: string): void {
    this.toastMessage.set(message);
    this.toastVisible.set(true);
    setTimeout(() => {
      this.toastVisible.set(false);
    }, 3000);
  }

  // Format currency
  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Get status class
  protected getStatusClass(status: TaxStatus): string {
    switch (status) {
      case 'paid': return 'status-paid';
      case 'pending': return 'status-pending';
      case 'overdue': return 'status-overdue';
      default: return '';
    }
  }

  // Get status icon
  protected getStatusIcon(status: TaxStatus): string {
    switch (status) {
      case 'paid': return '✓';
      case 'pending': return '⏳';
      case 'overdue': return '⚠️';
      default: return '';
    }
  }

  // Open cell (add or edit)
  protected openCell(monthData: MonthData): void {
    if (monthData.entry) {
      this.openEditModal(monthData.entry);
    } else {
      this.openAddModal(monthData.month);
    }
  }
}
