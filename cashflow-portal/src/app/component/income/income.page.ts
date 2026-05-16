import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncomeService, IncomeEntry } from '../../services/income.service';
import { ErrorPopupComponent, ErrorType } from '../../shared/components/error-popup/error-popup.component';

type MonthYear = {
  month: string;
  year: number;
  displayText: string;
};

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule, FormsModule, ErrorPopupComponent],
  templateUrl: './income.page.html',
  styleUrls: ['./income.page.scss']
})
export class IncomePage implements OnInit {
  private incomeService = inject(IncomeService);
  
  // State signals - Use service's signal directly for reactivity
  protected incomeEntries = this.incomeService.getEntriesSignal();
  protected showAddForm = signal(false);
  protected showTotalEarningsModal = signal(false); // New: Modal for total earnings breakdown
  protected showYearlyBreakdownModal = signal(false); // New: Modal for yearly monthly breakdown
  protected showMNCModal = signal(false); // New: Modal for MNC companies
  protected showDeleteConfirm = signal(false); // New: Delete confirmation modal
  protected deletingEntry = signal<IncomeEntry | null>(null); // Entry to be deleted
  protected editingEntry = signal<IncomeEntry | null>(null);
  protected selectedYear = signal<number>(new Date().getFullYear());
  protected viewMode = signal<'list' | 'chart'>('list');
  protected isLoading = signal(false);
  
  // Toast notification state
  protected showToast = signal(false);
  protected toastMessage = signal('');
  protected toastType = signal<'success' | 'error' | 'info'>('success');
  
  // Form state
  protected isYearLocked = signal(false); // Track if year should be readonly
  
  // Form fields
  protected selectedMonth = signal<string>('');
  protected selectedYearForm = signal<number>(new Date().getFullYear());
  protected selectedDate = signal<string>(''); // New: Optional date field
  protected amount = signal<number>(0);
  protected source = signal<string>('Salary');
  protected mncCompany = signal<string>(''); // New: MNC Company field
  protected notes = signal<string>('');

  // Available options
  protected readonly months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  protected readonly incomeSources = ['Salary', 'Bonus', 'Freelance', 'Investment Returns', 'Other'];
  
  // MNC companies base data with icons
  private readonly companyIcons = new Map([
    ['Mindtree', '🌳'],
    ['LTIMindtree', '💼'],
    ['Comcast', '📡']
  ]);

  // Company names for dropdown
  protected readonly companyNames = ['Mindtree', 'LTIMindtree', 'Comcast'];
  
  // Dynamic MNC companies data with periods calculated from actual income entries
  protected mncCompanies = computed(() => {
    const entries = this.incomeEntries();
    const companyPeriods = new Map<string, { firstEntry: Date, lastEntry: Date }>();
    
    // Calculate period for each company based on income entries
    entries.forEach(entry => {
      if (entry.mncCompany) {
        const entryDate = new Date(entry.date);
        const existing = companyPeriods.get(entry.mncCompany);
        
        if (existing) {
          if (entryDate < existing.firstEntry) existing.firstEntry = entryDate;
          if (entryDate > existing.lastEntry) existing.lastEntry = entryDate;
        } else {
          companyPeriods.set(entry.mncCompany, {
            firstEntry: entryDate,
            lastEntry: entryDate
          });
        }
      }
    });
    
    // Format periods for each company
    return this.companyNames.map(companyName => {
      const period = companyPeriods.get(companyName);
      let periodText = 'No entries yet';
      
      if (period) {
        const firstMonth = period.firstEntry.toLocaleString('en-US', { month: 'short' });
        const firstYear = period.firstEntry.getFullYear();
        const lastMonth = period.lastEntry.toLocaleString('en-US', { month: 'short' });
        const lastYear = period.lastEntry.getFullYear();
        
        // Check if last entry is current month/year (consider as "Present")
        const now = new Date();
        const isPresent = lastYear === now.getFullYear() && 
                         period.lastEntry.getMonth() >= now.getMonth() - 1; // Within last 2 months
        
        periodText = `${firstMonth} ${firstYear} - ${isPresent ? 'Present' : `${lastMonth} ${lastYear}`}`;
      }
      
      return {
        name: companyName,
        icon: this.companyIcons.get(companyName) || '🏢',
        period: periodText
      };
    });
  });
  
  // Computed values
  protected availableYears = computed(() => {
    const years: number[] = [];
    const currentYear = new Date().getFullYear();
    for (let year = 2021; year <= currentYear; year++) {
      years.push(year);
    }
    return years.reverse();
  });

  protected filteredEntries = computed(() => {
    const allEntries = this.incomeEntries();
    const year = this.selectedYear();
    const filtered = allEntries.filter(entry => entry.year === year);
    console.log(`🔍 Filtered for year ${year}:`, filtered.length, 'of', allEntries.length, 'total entries');
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  // New: Group entries by month for grid display (2 rows of 6 months)
  protected monthlyEntriesGrid = computed(() => {
    const entries = this.filteredEntries();
    const year = this.selectedYear();
    
    // For 2021, start from August (index 7), otherwise show all 12 months
    const monthsToShow = year === 2021 ? this.months.slice(7) : this.months;
    
    const monthsData = monthsToShow.map(month => {
      const entry = entries.find(e => e.month === month);
      return {
        month,
        entry,
        hasEntry: !!entry
      };
    });
    
    // Split into 2 rows (Jan-Jun, Jul-Dec) or (Aug-Oct, Nov-Dec) for 2021
    const halfPoint = Math.ceil(monthsData.length / 2);
    return {
      firstRow: monthsData.slice(0, halfPoint),
      secondRow: monthsData.slice(halfPoint)
    };
  });

  protected yearlyTotal = computed(() => {
    return this.filteredEntries().reduce((sum, entry) => sum + entry.amount, 0);
  });

  protected filledMonthsCount = computed(() => {
    return this.filteredEntries().length;
  });

  protected monthlyAverage = computed(() => {
    const entries = this.filteredEntries();
    return entries.length > 0 ? this.yearlyTotal() / entries.length : 0;
  });

  protected totalEarnings = computed(() => {
    return this.incomeEntries().reduce((sum, entry) => sum + entry.amount, 0);
  });

  protected currentYear = computed(() => {
    return new Date().getFullYear();
  });

  protected yearWiseTotals = computed(() => {
    const totals = new Map<number, number>();
    this.incomeEntries().forEach(entry => {
      const current = totals.get(entry.year) || 0;
      totals.set(entry.year, current + entry.amount);
    });
    return totals;
  });

  // Sorting state for Total Earnings table
  protected sortColumn = signal<'year' | 'amount'>('year');
  protected sortDirection = signal<'asc' | 'desc'>('asc'); // Default ascending (2021 to 2026)

  // New: Year-wise totals as array for table display with sorting
  protected yearWiseTotalsArray = computed(() => {
    const totals = this.yearWiseTotals();
    const column = this.sortColumn();
    const direction = this.sortDirection();
    
    const result = Array.from(totals.entries())
      .map(([year, amount]) => ({ year, amount }))
      .sort((a, b) => {
        let comparison = 0;
        if (column === 'year') {
          comparison = a.year - b.year;
        } else {
          comparison = a.amount - b.amount;
        }
        return direction === 'asc' ? comparison : -comparison;
      });
    return result;
  });

  // New: Company-wise earnings totals
  protected companyWiseEarnings = computed(() => {
    const totals = new Map<string, number>();
    this.incomeEntries().forEach(entry => {
      if (entry.mncCompany) {
        const current = totals.get(entry.mncCompany) || 0;
        totals.set(entry.mncCompany, current + entry.amount);
      }
    });
    return totals;
  });

  // New: Company-wise earnings as array for modal display
  protected companyWiseEarningsArray = computed(() => {
    const totals = this.companyWiseEarnings();
    const companies = this.mncCompanies();
    return companies.map(company => ({
      name: company.name,
      icon: company.icon,
      period: company.period,
      earnings: totals.get(company.name) || 0
    }));
  });

  // New: Monthly breakdown for selected year
  protected yearlyMonthlyBreakdown = computed(() => {
    const entries = this.filteredEntries();
    const year = this.selectedYear();
    
    // Create array with all 12 months
    const monthlyData = this.months.map(monthName => {
      const entry = entries.find(e => e.month === monthName);
      return {
        month: monthName,
        amount: entry ? entry.amount : 0,
        hasEntry: !!entry,
        entry: entry
      };
    });
    
    return monthlyData;
  });

  protected availableMonths = computed(() => {
    const existingMonthYears = this.incomeEntries().map(
      entry => `${entry.month}-${entry.year}`
    );
    
    const allMonths: MonthYear[] = [];
    const currentDate = new Date();
    const startDate = new Date(2021, 7, 1); // August 2021
    
    let date = new Date(startDate);
    while (date <= currentDate) {
      const monthName = this.months[date.getMonth()];
      const year = date.getFullYear();
      const key = `${monthName}-${year}`;
      
      if (!existingMonthYears.includes(key)) {
        allMonths.push({
          month: monthName,
          year: year,
          displayText: `${monthName} ${year}`
        });
      }
      
      date.setMonth(date.getMonth() + 1);
    }
    
    return allMonths.reverse();
  });

  ngOnInit(): void {
    this.loadIncomeData();
  }

  private async loadIncomeData(): Promise<void> {
    this.isLoading.set(true);
    try {
      console.log('🔄 Component: Loading income data from service...');
      await this.incomeService.loadIncomeData();
      console.log('✅ Component: Income data loaded successfully');
    } catch (error) {
      console.error('Error loading income data:', error);
      alert('Failed to load income data. Please refresh the page.');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async refreshData(): Promise<void> {
    await this.loadIncomeData();
  }

  protected openAddForm(): void {
    this.showAddForm.set(true);
    this.editingEntry.set(null);
    this.resetForm();
    this.isYearLocked.set(false); // Year is NOT locked for top button
  }

  protected openTotalEarningsModal(): void {
    this.showTotalEarningsModal.set(true);
  }

  protected closeTotalEarningsModal(): void {
    this.showTotalEarningsModal.set(false);
  }

  // Sort table by column
  protected sortTable(column: 'year' | 'amount'): void {
    if (this.sortColumn() === column) {
      // Toggle direction if same column
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, set ascending as default
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  // Get sort icon for column header
  protected getSortIcon(column: 'year' | 'amount'): string {
    if (this.sortColumn() !== column) {
      return '⇅'; // Neutral sort icon
    }
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  protected openYearlyBreakdownModal(): void {
    this.showYearlyBreakdownModal.set(true);
  }

  protected closeYearlyBreakdownModal(): void {
    this.showYearlyBreakdownModal.set(false);
  }

  protected openMNCModal(): void {
    this.showMNCModal.set(true);
  }

  protected closeMNCModal(): void {
    this.showMNCModal.set(false);
  }

  protected openAddFormForYear(year: number): void {
    this.showAddForm.set(true);
    this.editingEntry.set(null);
    this.resetForm();
    this.selectedYearForm.set(year); // Set year AFTER resetForm to preserve it
    this.isYearLocked.set(true); // Year IS locked for year-specific button
  }

  // Open add form with specific month and year pre-populated
  protected openAddFormForMonth(month: string, year: number): void {
    this.showAddForm.set(true);
    this.editingEntry.set(null);
    this.resetForm();
    this.selectedMonth.set(month); // Pre-populate month
    this.selectedYearForm.set(year); // Pre-populate year
    this.isYearLocked.set(true); // Lock year since it's tied to current view
  }

  protected closeAddForm(): void {
    this.showAddForm.set(false);
    this.editingEntry.set(null);
    this.resetForm();
  }

  protected async saveIncome(): Promise<void> {
    if (!this.selectedMonth() || this.amount() <= 0) {
      alert('Please enter valid month and amount');
      return;
    }

    this.isLoading.set(true);
    const editing = this.editingEntry();
    
    try {
      const entryData: any = {
        month: this.selectedMonth(),
        year: this.selectedYearForm(),
        amount: this.amount(),
        source: this.source(),
        mncCompany: this.mncCompany() || undefined,
        notes: this.notes()
      };

      // Add optional date if provided (without timezone conversion)
      if (this.selectedDate()) {
        // Use the date as-is without timezone conversion
        entryData.date = this.selectedDate();
      }
      
      if (editing) {
        // Update existing entry
        await this.incomeService.updateEntry(editing.id, entryData);
        console.log('✅ Income entry updated successfully!');
        this.showToastNotification('Income entry updated successfully!', 'success');
      } else {
        // Check for duplicates
        const exists = await this.incomeService.entryExists(this.selectedMonth(), this.selectedYearForm());
        if (exists) {
          const shouldRestore = confirm(
            `Income for ${this.selectedMonth()} ${this.selectedYearForm()} already exists or was previously deleted.\n\nDo you want to restore/update it with the new values?`
          );
          
          if (shouldRestore) {
            // Restore and update the deleted entry
            await this.incomeService.restoreOrUpdateEntry(
              this.selectedMonth(),
              this.selectedYearForm(),
              entryData
            );
            console.log('✅ Income entry restored/updated successfully!');
            this.showToastNotification('✅ Income entry restored successfully!', 'success');
          } else {
            this.isLoading.set(false);
            return;
          }
        } else {
          // Add new entry
          await this.incomeService.addEntry(entryData);
          console.log('✅ Income entry added successfully!');
          this.showToastNotification('Income entry added successfully!', 'success');
        }
      }

      // Close form - reactive signals will auto-update UI
      this.closeAddForm();
    } catch (error) {
      console.error('Error saving income:', error);
      this.showToastNotification('❌ Failed to save income entry. Please try again.', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected editIncome(entry: IncomeEntry): void {
    this.editingEntry.set(entry);
    this.selectedMonth.set(entry.month);
    this.selectedYearForm.set(entry.year);
    this.selectedDate.set(entry.date || ''); // Set the date if exists
    this.amount.set(entry.amount);
    this.source.set(entry.source);
    this.mncCompany.set(entry.mncCompany || '');
    this.notes.set(entry.notes || '');
    this.showAddForm.set(true);
  }

  protected async deleteIncome(entry: IncomeEntry): Promise<void> {
    // Show confirmation modal instead of browser alert
    this.deletingEntry.set(entry);
    this.showDeleteConfirm.set(true);
  }

  protected closeDeleteConfirm(): void {
    this.showDeleteConfirm.set(false);
    this.deletingEntry.set(null);
  }

  protected async confirmDelete(): Promise<void> {
    const entry = this.deletingEntry();
    if (!entry) return;

    this.isLoading.set(true);
    try {
      await this.incomeService.deleteEntry(entry.id);
      console.log('✅ Income entry soft deleted successfully!');
      this.showToastNotification('✅ Income entry deleted successfully!', 'success');
      this.closeDeleteConfirm();
    } catch (error) {
      console.error('Error deleting income:', error);
      this.showToastNotification('❌ Failed to delete income entry. Please try again.', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected changeYear(year: number): void {
    this.selectedYear.set(year);
  }

  protected toggleViewMode(): void {
    this.viewMode.set(this.viewMode() === 'list' ? 'chart' : 'list');
  }

  protected getMonthIndex(monthName: string): number {
    return this.months.indexOf(monthName);
  }

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  protected getYearWiseTotalsText(): string {
    const totals = this.yearWiseTotals();
    const entries: string[] = [];
    
    // Get sorted years
    const years = Array.from(totals.keys()).sort((a, b) => b - a);
    
    for (const year of years) {
      const amount = totals.get(year) || 0;
      entries.push(`${year}: ${this.formatCurrency(amount)}`);
    }
    
    return entries.join(' | ');
  }

  protected getMNCWorkedText(): string {
    const companies = this.mncCompanies();
    return companies.map(c => c.name).join(' • ');
  }

  /**
   * Show toast notification
   */
  private showToastNotification(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.showToast.set(false);
    }, 3000);
  }

  private resetForm(): void {
    const now = new Date();
    this.selectedMonth.set(''); // Reset to empty - user must select
    this.selectedYearForm.set(now.getFullYear());
    this.selectedDate.set(''); // Reset date field
    this.amount.set(0);
    this.source.set('Salary');
    this.mncCompany.set('');
    this.notes.set('');
  }
}
