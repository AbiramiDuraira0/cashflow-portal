import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

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
  private http = inject(HttpClient);
  private incomeData = signal<IncomeEntry[]>([]);
  private dataLoadedPromise: Promise<void>;

  constructor() {
    this.dataLoadedPromise = this.loadIncomeData();
  }

  /**
   * Load income data - Priority: localStorage > JSON file
   * JSON file only used as initial seed data if localStorage is empty
   * Note: In production, this will be replaced with Supabase query
   */
  private async loadIncomeData(): Promise<void> {
    try {
      // FIRST: Check if we have data in localStorage (user's changes)
      const stored = localStorage.getItem('cashflow_income_data');
      
      if (stored) {
        // Use localStorage data (has user modifications)
        try {
          const data: IncomeData = JSON.parse(stored);
          this.incomeData.set(data.incomeEntries || []);
          console.log('💾 Loaded income data from localStorage:', data.incomeEntries?.length || 0, 'entries');
          return; // Exit early - we have user data
        } catch (parseError) {
          console.error('Error parsing localStorage data:', parseError);
          // Continue to load from JSON if localStorage is corrupted
        }
      }

      // SECOND: If no localStorage data, load from JSON file (initial seed)
      console.log('📄 No localStorage data found, loading initial data from JSON file...');
      const data = await firstValueFrom(
        this.http.get<IncomeData>('/assets/data/income-data.json')
      );
      
      const entries = data.incomeEntries || [];
      
      // Convert date strings to proper format if needed
      const processedEntries = entries.map((entry: any) => ({
        ...entry,
        date: entry.date || new Date(entry.year, this.getMonthIndex(entry.month), 1).toISOString()
      }));
      
      this.incomeData.set(processedEntries);
      
      // Save to localStorage so next time we use this
      await this.saveToFile();
      console.log('📄 Loaded and saved initial data from JSON file:', processedEntries.length, 'entries');
    } catch (error) {
      console.error('Error loading income data:', error);
      this.incomeData.set([]);
    }
  }

  /**
   * Load from localStorage as fallback (DEPRECATED - now part of main load)
   */
  private loadFromLocalStorage(): void {
    const stored = localStorage.getItem('cashflow_income_data');
    if (stored) {
      try {
        const data: IncomeData = JSON.parse(stored);
        this.incomeData.set(data.incomeEntries || []);
        console.log('💾 Fallback: Loaded from localStorage:', data.incomeEntries?.length || 0, 'entries');
      } catch (error) {
        console.error('Error loading from localStorage:', error);
        this.incomeData.set([]);
      }
    } else {
      this.incomeData.set([]);
    }
  }

  /**
   * Get all income entries
   * Waits for initial data load to complete before returning
   */
  async getAllEntries(): Promise<IncomeEntry[]> {
    await this.dataLoadedPromise;
    const entries = this.incomeData();
    console.log('📊 getAllEntries() returning:', entries.length, 'entries');
    return entries;
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
    console.log('➕ Adding new entry. Current count:', currentEntries.length);
    console.log('➕ New entry:', newEntry);
    
    this.incomeData.set([...currentEntries, newEntry]);
    
    console.log('➕ After add, total count:', this.incomeData().length);
    
    // Save to localStorage
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
   * Waits for data to load before checking
   */
  async entryExists(month: string, year: number): Promise<boolean> {
    await this.dataLoadedPromise;
    const exists = this.incomeData().some(entry => entry.month === month && entry.year === year);
    console.log(`🔍 Checking if ${month} ${year} exists:`, exists);
    return exists;
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
