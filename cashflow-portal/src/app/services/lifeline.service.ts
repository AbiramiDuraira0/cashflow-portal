import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { MOCK_LIFELINE_DATA } from './mock-data';

/**
 * Database Lifeline Entry Type (matches DB schema)
 */
export type DbLifelineEntry = {
  lifeline_id: number;
  entry_date: string;
  amount_inr: number;
  notes: string | null;
  is_delete: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * Application Lifeline Entry Type (for UI)
 */
export type LifelineEntry = {
  id: number;
  date: string;
  amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
};

/**
 * Create/Update Lifeline Entry DTO
 */
export type LifelineEntryDTO = {
  date: string;
  amount: number;
  notes?: string;
};

@Injectable({
  providedIn: 'root'
})
export class LifelineService {
  private supabase = inject(SupabaseService);
  private lifelineData = signal<LifelineEntry[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  constructor() {
    // Auto-load on service initialization
    this.loadLifelineData();
  }

  /**
   * Get the signal for reactive data binding
   */
  getEntriesSignal() {
    return this.lifelineData;
  }

  /**
   * Get loading state signal
   */
  getLoadingSignal() {
    return this.loading;
  }

  /**
   * Get error state signal
   */
  getErrorSignal() {
    return this.error;
  }

  /**
   * Load all lifeline entries from Supabase (excluding soft-deleted)
   */
  async loadLifelineData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    
    try {
      // QA MOCK MODE: Return mock data instead of DB calls
      if (this.supabase.isMockMode) {
        console.log('🧪 [QA MODE] Loading MOCK lifeline data...');
        await new Promise(resolve => setTimeout(resolve, 300));
        const entries: LifelineEntry[] = MOCK_LIFELINE_DATA.map(this.transformDbToApp);
        this.lifelineData.set(entries);
        console.log('✅ Loaded mock lifeline entries:', entries.length);
        return;
      }

      console.log('📂 Loading lifeline data from database...');
      
      const { data, error } = await this.supabase.db
        .from('lifeline')
        .select('*')
        .eq('is_delete', false)
        .order('entry_date', { ascending: false });

      if (error) {
        console.error('❌ Database error:', error.message);
        throw error;
      }

      // Transform DB format to App format
      const entries: LifelineEntry[] = (data || []).map(this.transformDbToApp);
      
      this.lifelineData.set(entries);
      console.log('✅ Loaded lifeline entries:', entries.length);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load lifeline data';
      this.error.set(errorMsg);
      console.error('❌ Lifeline load error:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Transform database format to application format
   */
  private transformDbToApp(dbEntry: DbLifelineEntry): LifelineEntry {
    return {
      id: dbEntry.lifeline_id,
      date: dbEntry.entry_date,
      amount: Number(dbEntry.amount_inr),
      notes: dbEntry.notes || undefined,
      created_at: dbEntry.created_at,
      updated_at: dbEntry.updated_at
    };
  }

  /**
   * Transform application format to database format
   */
  private transformAppToDb(entry: LifelineEntryDTO): Partial<DbLifelineEntry> {
    return {
      entry_date: entry.date,
      amount_inr: entry.amount,
      notes: entry.notes || null
    };
  }

  /**
   * Add a new lifeline entry
   */
  async addEntry(entry: LifelineEntryDTO): Promise<LifelineEntry> {
    this.loading.set(true);
    this.error.set(null);

    try {
      // QA MOCK MODE: Simulate add without DB
      if (this.supabase.isMockMode) {
        console.log('🧪 [QA MODE] Simulating lifeline entry add...');
        await new Promise(resolve => setTimeout(resolve, 200));
        const mockEntry: LifelineEntry = { id: Date.now(), date: entry.date, amount: entry.amount, notes: entry.notes, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        this.lifelineData.update(entries => [mockEntry, ...entries]);
        return mockEntry;
      }

      console.log('➕ Adding new lifeline entry:', entry);
      
      const dbEntry = this.transformAppToDb(entry);
      
      const { data, error } = await this.supabase.db
        .from('lifeline')
        .insert(dbEntry)
        .select()
        .single();

      if (error) {
        console.error('❌ Insert error:', error.message);
        throw error;
      }

      const newEntry = this.transformDbToApp(data);
      
      // Update local state
      this.lifelineData.update(entries => [newEntry, ...entries]);
      
      console.log('✅ Added lifeline entry:', newEntry.id);
      return newEntry;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to add lifeline entry';
      this.error.set(errorMsg);
      console.error('❌ Add entry error:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Update an existing lifeline entry
   */
  async updateEntry(id: number, entry: LifelineEntryDTO): Promise<LifelineEntry> {
    this.loading.set(true);
    this.error.set(null);

    try {
      // QA MOCK MODE: Simulate update without DB
      if (this.supabase.isMockMode) {
        console.log('🧪 [QA MODE] Simulating lifeline entry update...');
        await new Promise(resolve => setTimeout(resolve, 200));
        const updated: LifelineEntry = { id, date: entry.date, amount: entry.amount, notes: entry.notes, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        this.lifelineData.update(entries => entries.map(e => e.id === id ? updated : e));
        return updated;
      }

      console.log('📝 Updating lifeline entry:', id, entry);
      
      const dbEntry = this.transformAppToDb(entry);
      
      const { data, error } = await this.supabase.db
        .from('lifeline')
        .update(dbEntry)
        .eq('lifeline_id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Update error:', error.message);
        throw error;
      }

      const updatedEntry = this.transformDbToApp(data);
      
      // Update local state
      this.lifelineData.update(entries => 
        entries.map(e => e.id === id ? updatedEntry : e)
      );
      
      console.log('✅ Updated lifeline entry:', id);
      return updatedEntry;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update lifeline entry';
      this.error.set(errorMsg);
      console.error('❌ Update entry error:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Soft delete a lifeline entry
   */
  async deleteEntry(id: number): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      // QA MOCK MODE: Simulate delete without DB
      if (this.supabase.isMockMode) {
        console.log('🧪 [QA MODE] Simulating lifeline entry delete...');
        await new Promise(resolve => setTimeout(resolve, 200));
        this.lifelineData.update(entries => entries.filter(e => e.id !== id));
        return;
      }

      console.log('🗑️ Deleting lifeline entry:', id);
      
      const { error } = await this.supabase.db
        .from('lifeline')
        .update({ is_delete: true })
        .eq('lifeline_id', id);

      if (error) {
        console.error('❌ Delete error:', error.message);
        throw error;
      }

      // Update local state
      this.lifelineData.update(entries => 
        entries.filter(e => e.id !== id)
      );
      
      console.log('✅ Deleted lifeline entry:', id);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete lifeline entry';
      this.error.set(errorMsg);
      console.error('❌ Delete entry error:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Calculate total amount of all entries
   */
  getTotalAmount(): number {
    return this.lifelineData().reduce((sum, entry) => sum + entry.amount, 0);
  }

  /**
   * Refresh data from database
   */
  async refresh(): Promise<void> {
    await this.loadLifelineData();
  }
}
