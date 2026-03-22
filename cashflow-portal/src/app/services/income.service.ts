import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

/**
 * Database Income Entry Type (matches DB schema)
 */
export type DbIncomeEntry = {
  income_id: number;
  year: number;
  month: string;
  date: string | null;
  amount_inr: number;
  source: string;
  mnc_company: string | null;
  notes: string | null;
  is_delete: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * Application Income Entry Type (for UI)
 */
export type IncomeEntry = {
  id: number;
  month: string;
  year: number;
  amount: number;
  source: string;
  mncCompany?: string;
  notes?: string;
  date: string;
  created_at: string;
  updated_at: string;
};

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private supabase = inject(SupabaseService);
  private incomeData = signal<IncomeEntry[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  constructor() {
    // Auto-load on service initialization
    this.loadIncomeData();
  }


  /**
   * Load all income entries from Supabase (excluding soft-deleted)
   */
  async loadIncomeData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    
    try {
      console.log('📂 Loading income data from database...');
      
      const { data, error } = await this.supabase.db
        .from('income')
        .select('*')
        .eq('is_delete', false)
        .order('year', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Database error:', error.message);
        throw error;
      }

      // Transform DB format to App format
      const entries: IncomeEntry[] = (data || []).map(this.transformDbToApp);
      
      this.incomeData.set(entries);
      console.log('✅ Loaded income entries:', entries.length);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load income data';
      this.error.set(errorMsg);
      console.error('❌ Income load error:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Transform database format to application format
   */
  private transformDbToApp(dbEntry: DbIncomeEntry): IncomeEntry {
    return {
      id: dbEntry.income_id,
      month: dbEntry.month,
      year: dbEntry.year,
      amount: Number(dbEntry.amount_inr),
      source: dbEntry.source,
      mncCompany: dbEntry.mnc_company || undefined,
      notes: dbEntry.notes || undefined,
      date: dbEntry.date || new Date(dbEntry.year, this.getMonthIndex(dbEntry.month), 1).toISOString(),
      created_at: dbEntry.created_at,
      updated_at: dbEntry.updated_at
    };
  }

  /**
   * Transform application format to database format
   */
  private transformAppToDb(appEntry: Partial<IncomeEntry>): Partial<DbIncomeEntry> {
    const dbEntry: any = {};
    
    if (appEntry.month !== undefined) dbEntry.month = appEntry.month;
    if (appEntry.year !== undefined) dbEntry.year = appEntry.year;
    if (appEntry.amount !== undefined) dbEntry.amount_inr = appEntry.amount;
    if (appEntry.source !== undefined) dbEntry.source = appEntry.source;
    if (appEntry.mncCompany !== undefined) dbEntry.mnc_company = appEntry.mncCompany || null;
    if (appEntry.notes !== undefined) dbEntry.notes = appEntry.notes || null;
    if (appEntry.date !== undefined) dbEntry.date = appEntry.date;
    
    return dbEntry;
  }

  /**
   * Get month index from name
   */
  private getMonthIndex(monthName: string): number {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months.indexOf(monthName);
  }


  /**
   * Get all income entries (synchronous access to signal)
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
   * Get loading state signal
   */
  getLoadingSignal() {
    return this.loading;
  }

  /**
   * Get error signal
   */
  getErrorSignal() {
    return this.error;
  }

  /**
   * Add new income entry to database
   */
  async addEntry(entry: Omit<IncomeEntry, 'id' | 'date' | 'created_at' | 'updated_at'>): Promise<IncomeEntry> {
    this.loading.set(true);
    this.error.set(null);

    try {
      // Calculate date if not provided
      const date = new Date(entry.year, this.getMonthIndex(entry.month), 1).toISOString().split('T')[0];

      const newEntry = {
        year: entry.year,
        month: entry.month,
        date: date,
        amount_inr: entry.amount,
        source: entry.source,
        mnc_company: entry.mncCompany || null,  // FIX: Include MNC company on add
        notes: entry.notes || null,
        is_delete: false
      };

      console.log('➕ Adding new entry:', newEntry);

      const { data, error } = await this.supabase.db
        .from('income')
        .insert([newEntry])
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error.message);
        throw error;
      }

      const addedEntry = this.transformDbToApp(data);
      
      // Update local state
      this.incomeData.set([...this.incomeData(), addedEntry]);
      
      console.log('✅ Income entry added successfully. Total:', this.incomeData().length);
      
      return addedEntry;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to add income entry';
      this.error.set(errorMsg);
      console.error('❌ Add income error:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Update existing income entry
   */
  async updateEntry(id: number, updates: Partial<Omit<IncomeEntry, 'id' | 'created_at' | 'updated_at'>>): Promise<IncomeEntry> {
    this.loading.set(true);
    this.error.set(null);

    try {
      // Calculate date if month or year changed
      let dbUpdates: any = this.transformAppToDb(updates);
      
      if (updates.month || updates.year) {
        const currentEntry = this.incomeData().find(e => e.id === id);
        const month = updates.month || currentEntry?.month || 'January';
        const year = updates.year || currentEntry?.year || new Date().getFullYear();
        dbUpdates.date = new Date(year, this.getMonthIndex(month), 1).toISOString().split('T')[0];
      }

      console.log('✏️ Updating entry:', id, dbUpdates);

      const { data, error } = await this.supabase.db
        .from('income')
        .update(dbUpdates)
        .eq('income_id', id)
        .eq('is_delete', false)
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error.message);
        throw error;
      }

      if (!data) {
        throw new Error('Entry not found or already deleted');
      }

      const updatedEntry = this.transformDbToApp(data);
      
      // Update local state
      const currentEntries = this.incomeData();
      const index = currentEntries.findIndex(e => e.id === id);
      if (index !== -1) {
        const newEntries = [...currentEntries];
        newEntries[index] = updatedEntry;
        this.incomeData.set(newEntries);
      }
      
      console.log('✅ Income entry updated successfully');
      
      return updatedEntry;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update income entry';
      this.error.set(errorMsg);
      console.error('❌ Update income error:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Soft delete income entry
   */
  async deleteEntry(id: number): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);

    try {
      console.log('🗑️ Soft deleting entry:', id);

      const { error } = await this.supabase.db
        .from('income')
        .update({ is_delete: true })
        .eq('income_id', id);

      if (error) {
        console.error('❌ Database error:', error.message);
        throw error;
      }

      // Remove from local state
      const currentEntries = this.incomeData();
      const filtered = currentEntries.filter(e => e.id !== id);
      this.incomeData.set(filtered);
      
      console.log('✅ Income entry soft deleted successfully. Remaining:', filtered.length);
      
      return true;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete income entry';
      this.error.set(errorMsg);
      console.error('❌ Delete income error:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Hard delete income entry (permanent - use with caution)
   */
  async hardDeleteEntry(id: number): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);

    try {
      console.log('⚠️ Hard deleting entry:', id);

      const { error } = await this.supabase.db
        .from('income')
        .delete()
        .eq('income_id', id);

      if (error) {
        console.error('❌ Database error:', error.message);
        throw error;
      }

      // Remove from local state
      const currentEntries = this.incomeData();
      const filtered = currentEntries.filter(e => e.id !== id);
      this.incomeData.set(filtered);
      
      console.log('✅ Income entry permanently deleted');
      
      return true;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to permanently delete income entry';
      this.error.set(errorMsg);
      console.error('❌ Hard delete income error:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Restore soft-deleted entry or update if similar entry exists
   */
  async restoreOrUpdateEntry(month: string, year: number, entry: Omit<IncomeEntry, 'id' | 'date' | 'created_at' | 'updated_at'>): Promise<IncomeEntry> {
    this.loading.set(true);
    this.error.set(null);

    try {
      // Check if soft-deleted entry exists for this month/year
      const { data: deletedEntry, error: checkError } = await this.supabase.db
        .from('income')
        .select('*')
        .eq('month', month)
        .eq('year', year)
        .eq('is_delete', true)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw checkError;
      }

      if (deletedEntry) {
        // Restore and update the soft-deleted entry
        console.log('🔄 Restoring and updating soft-deleted entry:', deletedEntry.income_id);
        
        const updates = {
          amount_inr: entry.amount,
          source: entry.source,
          notes: entry.notes || null,
          is_delete: false
        };

        const { data, error } = await this.supabase.db
          .from('income')
          .update(updates)
          .eq('income_id', deletedEntry.income_id)
          .select()
          .single();

        if (error) throw error;

        const restoredEntry = this.transformDbToApp(data);
        this.incomeData.set([...this.incomeData(), restoredEntry]);
        
        console.log('✅ Entry restored and updated');
        return restoredEntry;
      } else {
        // No deleted entry exists, create new one
        return await this.addEntry(entry);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to restore or add entry';
      this.error.set(errorMsg);
      console.error('❌ Restore/update error:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
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
   * Check if month/year combination already exists (excluding soft-deleted)
   */
  async entryExists(month: string, year: number): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.db
        .from('income')
        .select('income_id')
        .eq('month', month)
        .eq('year', year)
        .eq('is_delete', false)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      const exists = !!data;
      console.log(`🔍 Checking if ${month} ${year} exists:`, exists);
      return exists;
    } catch (err) {
      console.error('Error checking entry existence:', err);
      return false;
    }
  }

  /**
   * Reload data from database
   */
  async reloadData(): Promise<void> {
    await this.loadIncomeData();
  }
}
