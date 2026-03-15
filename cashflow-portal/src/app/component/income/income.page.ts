import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncomeService, IncomeEntry } from '../../services/income.service';

type MonthYear = {
  month: string;
  year: number;
  displayText: string;
};

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './income.page.html',
  styleUrls: ['./income.page.scss']
})
export class IncomePage implements OnInit {
  private incomeService = inject(IncomeService);
  
  // State signals - Use service's signal directly for reactivity
  protected incomeEntries = this.incomeService.getEntriesSignal();
  protected showAddForm = signal(false);
  protected editingEntry = signal<IncomeEntry | null>(null);
  protected selectedYear = signal<number>(new Date().getFullYear());
  protected viewMode = signal<'list' | 'chart'>('list');
  protected isLoading = signal(false);
  
  // Form fields
  protected selectedMonth = signal<string>('');
  protected selectedYearForm = signal<number>(new Date().getFullYear());
  protected amount = signal<number>(0);
  protected source = signal<string>('Salary');
  protected notes = signal<string>('');

  // Available options
  protected readonly months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  protected readonly incomeSources = ['Salary', 'Bonus', 'Freelance', 'Investment Returns', 'Other'];
  
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

  protected yearlyTotal = computed(() => {
    return this.filteredEntries().reduce((sum, entry) => sum + entry.amount, 0);
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
    
    // Set default month and year for form
    const now = new Date();
    this.selectedMonth.set(this.months[now.getMonth()]);
    this.selectedYearForm.set(now.getFullYear());
  }

  private async loadIncomeData(): Promise<void> {
    this.isLoading.set(true);
    try {
      console.log('🔄 Component: Ensuring service data is loaded...');
      // Just ensure the service has loaded its data
      // The component's incomeEntries signal is already pointing to service's signal
      await this.incomeService.getAllEntries();
      console.log('✅ Component: Service data ready');
    } catch (error) {
      console.error('Error loading income data:', error);
      alert('Failed to load income data. Please refresh the page.');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected openAddForm(): void {
    this.showAddForm.set(true);
    this.editingEntry.set(null);
    this.resetForm();
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
      if (editing) {
        // Update existing entry
        await this.incomeService.updateEntry(editing.id, {
          month: this.selectedMonth(),
          year: this.selectedYearForm(),
          amount: this.amount(),
          source: this.source(),
          notes: this.notes()
        });
      } else {
        // Check for duplicates - now using both selected month and year
        const exists = await this.incomeService.entryExists(this.selectedMonth(), this.selectedYearForm());
        if (exists) {
          alert(`Income for ${this.selectedMonth()} ${this.selectedYearForm()} already exists!`);
          this.isLoading.set(false);
          return;
        }
        
        // Add new entry
        await this.incomeService.addEntry({
          month: this.selectedMonth(),
          year: this.selectedYearForm(),
          amount: this.amount(),
          source: this.source(),
          notes: this.notes()
        });
      }

      // Signal automatically updates reactively - no need to reload!
      this.closeAddForm();
      
      // Show success message
      const action = editing ? 'updated' : 'added';
      console.log(`✅ Income entry ${action} successfully! Total entries:`, this.incomeEntries().length);
    } catch (error) {
      console.error('Error saving income:', error);
      alert('Failed to save income entry. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected editIncome(entry: IncomeEntry): void {
    this.editingEntry.set(entry);
    this.selectedMonth.set(entry.month);
    this.selectedYearForm.set(entry.year);
    this.amount.set(entry.amount);
    this.source.set(entry.source);
    this.notes.set(entry.notes || '');
    this.showAddForm.set(true);
  }

  protected async deleteIncome(entry: IncomeEntry): Promise<void> {
    if (!confirm(`Delete income entry for ${entry.month} ${entry.year}?`)) {
      return;
    }

    this.isLoading.set(true);
    try {
      await this.incomeService.deleteEntry(entry.id);
      await this.loadIncomeData();
      console.log('✅ Income entry deleted successfully!');
    } catch (error) {
      console.error('Error deleting income:', error);
      alert('Failed to delete income entry. Please try again.');
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

  private resetForm(): void {
    const now = new Date();
    this.selectedMonth.set(this.months[now.getMonth()]);
    this.selectedYearForm.set(now.getFullYear());
    this.amount.set(0);
    this.source.set('Salary');
    this.notes.set('');
  }
}
