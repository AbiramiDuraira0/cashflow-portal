import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type IncomeEntry = {
  id: string;
  month: string;
  year: number;
  amount: number;
  source: string;
  notes?: string;
  date: Date;
};

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
  // State signals
  protected incomeEntries = signal<IncomeEntry[]>([]);
  protected showAddForm = signal(false);
  protected editingEntry = signal<IncomeEntry | null>(null);
  protected selectedYear = signal<number>(new Date().getFullYear());
  protected viewMode = signal<'list' | 'chart'>('list');
  
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
    return this.incomeEntries()
      .filter(entry => entry.year === this.selectedYear())
      .sort((a, b) => b.date.getTime() - a.date.getTime());
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

  protected saveIncome(): void {
    if (!this.selectedMonth() || this.amount() <= 0) {
      alert('Please enter valid month and amount');
      return;
    }

    const editing = this.editingEntry();
    
    if (editing) {
      // Update existing entry
      const updatedEntries = this.incomeEntries().map(entry => 
        entry.id === editing.id
          ? {
              ...entry,
              month: this.selectedMonth(),
              year: this.selectedYearForm(),
              amount: this.amount(),
              source: this.source(),
              notes: this.notes(),
              date: this.getDateFromMonthYear(this.selectedMonth(), this.selectedYearForm())
            }
          : entry
      );
      this.incomeEntries.set(updatedEntries);
    } else {
      // Add new entry
      const newEntry: IncomeEntry = {
        id: this.generateId(),
        month: this.selectedMonth(),
        year: this.selectedYearForm(),
        amount: this.amount(),
        source: this.source(),
        notes: this.notes(),
        date: this.getDateFromMonthYear(this.selectedMonth(), this.selectedYearForm())
      };
      this.incomeEntries.set([...this.incomeEntries(), newEntry]);
    }

    this.saveIncomeData();
    this.closeAddForm();
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

  protected deleteIncome(entry: IncomeEntry): void {
    if (confirm(`Delete income entry for ${entry.month} ${entry.year}?`)) {
      this.incomeEntries.set(
        this.incomeEntries().filter(e => e.id !== entry.id)
      );
      this.saveIncomeData();
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

  private resetForm(): void {
    const now = new Date();
    this.selectedMonth.set(this.months[now.getMonth()]);
    this.selectedYearForm.set(now.getFullYear());
    this.amount.set(0);
    this.source.set('Salary');
    this.notes.set('');
  }

  private generateId(): string {
    return `income_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDateFromMonthYear(month: string, year: number): Date {
    const monthIndex = this.months.indexOf(month);
    return new Date(year, monthIndex, 1);
  }

  private loadIncomeData(): void {
    const stored = localStorage.getItem('cashflow_income_entries');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Reconstruct Date objects
      const entries = parsed.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date)
      }));
      this.incomeEntries.set(entries);
    }
  }

  private saveIncomeData(): void {
    localStorage.setItem('cashflow_income_entries', JSON.stringify(this.incomeEntries()));
  }
}
