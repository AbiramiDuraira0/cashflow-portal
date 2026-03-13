import { Injectable, signal } from '@angular/core';

export type IncomeEntry = {
  id: string;
  month: string;
  year: number;
  amount: number;
  source: string;
  notes?: string;
  date: string; // ISO string format
};

type IncomeData = {
  incomeEntries: IncomeEntry[];
};

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private incomeData = signal<IncomeEntry[]>([]);

  constructor() {
    this.loadIncomeData();
  }

  /**
   * Load income data from JSON file
   * Note: In production, this will be replaced with Supabase query
   */
  private async loadIncomeData(): Promise<void> {
    try {
      // Import the JSON file
      const data = await import('../../data/income-data.json');
      const entries = (data as any).default?.incomeEntries || data.incomeEntries || [];
      
      // Convert date strings to proper format if needed
      const processedEntries = entries.map((entry: any) => ({
        ...entry,
        date: entry.date || new Date(entry.year, this.getMonthIndex(entry.month), 1).toISOString()
      }));
      
      this.incomeData.set(processedEntries);
    } catch (error) {
      console.error('Error loading income data:', error);
      this.incomeData.set([]);
    }
  }

  /**
   * Get all income entries
   */
  getAllEntries(): IncomeEntry[] {
    return this.incomeData();
  }

  /**
   * Get income entries signal (reactive)
   */
  getEntriesSignal() {
    return this.incomeData;
  }

  /**
   * Add new income entry
   * Note: In production, this will call Supabase insert
   */
  async addEntry(entry: Omit<IncomeEntry, 'id' | 'date'>): Promise<IncomeEntry> {
    const newEntry: IncomeEntry = {
      ...entry,
      id: this.generateId(),
      date: new Date(entry.year, this.getMonthIndex(entry.month), 1).toISOString()
    };

    const currentEntries = this.incomeData();
    this.incomeData.set([...currentEntries, newEntry]);
    
    // Save to file (simulated)
    await this.saveToFile();
    
    return newEntry;
  }

  /**
   * Update existing income entry
   * Note: In production, this will call Supabase update
   */
  async updateEntry(id: string, updates: Partial<Omit<IncomeEntry, 'id'>>): Promise<IncomeEntry | null> {
    const currentEntries = this.incomeData();
    const index = currentEntries.findIndex(e => e.id === id);
    
    if (index === -1) {
      console.error('Entry not found:', id);
      return null;
    }

    const updatedEntry: IncomeEntry = {
      ...currentEntries[index],
      ...updates,
      date: updates.month && updates.year 
        ? new Date(updates.year, this.getMonthIndex(updates.month), 1).toISOString()
        : currentEntries[index].date
    };

    const newEntries = [...currentEntries];
    newEntries[index] = updatedEntry;
    this.incomeData.set(newEntries);
    
    // Save to file (simulated)
    await this.saveToFile();
    
    return updatedEntry;
  }

  /**
   * Delete income entry
   * Note: In production, this will call Supabase delete
   */
  async deleteEntry(id: string): Promise<boolean> {
    const currentEntries = this.incomeData();
    const filtered = currentEntries.filter(e => e.id !== id);
    
    if (filtered.length === currentEntries.length) {
      console.error('Entry not found:', id);
      return false;
    }

    this.incomeData.set(filtered);
    
    // Save to file (simulated)
    await this.saveToFile();
    
    return true;
  }

  /**
   * Get entries for specific year
   */
  getEntriesByYear(year: number): IncomeEntry[] {
    return this.incomeData().filter(entry => entry.year === year);
  }

  /**
   * Get total income across all years
   */
  getTotalIncome(): number {
    return this.incomeData().reduce((sum, entry) => sum + entry.amount, 0);
  }

  /**
   * Get total income for specific year
   */
  getYearlyTotal(year: number): number {
    return this.getEntriesByYear(year).reduce((sum, entry) => sum + entry.amount, 0);
  }

  /**
   * Get monthly average for specific year
   */
  getMonthlyAverage(year: number): number {
    const entries = this.getEntriesByYear(year);
    return entries.length > 0 ? this.getYearlyTotal(year) / entries.length : 0;
  }

  /**
   * Check if month/year combination already exists
   */
  entryExists(month: string, year: number): boolean {
    return this.incomeData().some(entry => entry.month === month && entry.year === year);
  }

  /**
   * Save data to JSON file (simulated - in browser, we use localStorage)
   * Note: In production, this won't be needed as Supabase handles persistence
   */
  private async saveToFile(): Promise<void> {
    // Since we can't write to JSON file from browser, use localStorage as fallback
    const data: IncomeData = {
      incomeEntries: this.incomeData()
    };
    localStorage.setItem('cashflow_income_data', JSON.stringify(data));
    console.log('💾 Data saved to localStorage (will be replaced with Supabase)');
  }

  /**
   * Reload data (useful after external changes)
   */
  async reloadData(): Promise<void> {
    await this.loadIncomeData();
  }

  /**
   * Helper: Get month index from name
   */
  private getMonthIndex(monthName: string): number {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months.indexOf(monthName);
  }

  /**
   * Helper: Generate unique ID
   */
  private generateId(): string {
    return `income_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================
  // MIGRATION NOTES FOR SUPABASE
  // ============================================
  /*
  When migrating to Supabase, replace methods as follows:

  1. loadIncomeData() -> 
     const { data } = await this.supabase
       .from('income_entries')
       .select('*')
       .order('date', { ascending: false });

  2. addEntry() ->
     const { data } = await this.supabase
       .from('income_entries')
       .insert([newEntry])
       .select();

  3. updateEntry() ->
     const { data } = await this.supabase
       .from('income_entries')
       .update(updates)
       .eq('id', id)
       .select();

  4. deleteEntry() ->
     const { data } = await this.supabase
       .from('income_entries')
       .delete()
       .eq('id', id);

  5. Remove saveToFile() method entirely
  6. Remove localStorage fallback
  */
}
