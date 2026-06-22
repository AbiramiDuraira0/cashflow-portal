import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { MOCK_TAX_DATA } from './mock-data';

export type TaxStatus = 'paid' | 'pending' | 'overdue';

export interface TaxEntry {
  tax_id: number;
  year: number;
  month: number;
  tax_paid: number;
  taxable_income?: number;
  status: TaxStatus;
  payment_date?: string;
  payment_mode?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface TaxFormData {
  year: number;
  month: number;
  tax_paid: number;
  taxable_income?: number;
  status: TaxStatus;
  payment_date?: string;
  payment_mode?: string;
  notes?: string;
}

export interface TaxSummary {
  totalTaxPaid: number;
  totalIncome: number;
  effectiveTaxRate: number;
  paidMonths: number;
  pendingMonths: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaxService {
  private supabase = inject(SupabaseService);
  private taxEntries = signal<TaxEntry[]>([]);
  private loading = signal<boolean>(false);

  constructor() {
    this.loadTaxEntries();
  }

  // Get all tax entries signal (read-only)
  getTaxEntriesSignal() {
    return this.taxEntries.asReadonly();
  }

  // Get loading state signal (read-only)
  getLoadingSignal() {
    return this.loading.asReadonly();
  }

  // Load all tax entries
  async loadTaxEntries(): Promise<void> {
    this.loading.set(true);
    try {
      // QA MOCK MODE: Return mock data instead of DB calls
      if (this.supabase.isMockMode) {
        console.log('🧪 [QA MODE] Loading MOCK tax data...');
        await new Promise(resolve => setTimeout(resolve, 300));
        this.taxEntries.set(MOCK_TAX_DATA as any);
        console.log('✅ Loaded mock tax entries:', MOCK_TAX_DATA.length);
        return;
      }

      const { data, error} = await this.supabase.db
        .from('tax')
        .select('*')
        .eq('is_deleted', false)
        .order('year', { ascending: false })
        .order('month', { ascending: true });

      if (error) throw error;

      this.taxEntries.set(data || []);
    } catch (error) {
      console.error('Error loading tax entries:', error);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  // Get tax entries for a specific year
  getTaxEntriesForYear(year: number): TaxEntry[] {
    return this.taxEntries().filter(entry => entry.year === year);
  }

  // Get tax summary for a specific year
  getTaxSummary(year: number): TaxSummary {
    const entries = this.getTaxEntriesForYear(year);
    
    const totalTaxPaid = entries.reduce((sum, entry) => sum + entry.tax_paid, 0);
    const totalIncome = entries.reduce((sum, entry) => sum + (entry.taxable_income || 0), 0);
    const effectiveTaxRate = totalIncome > 0 ? (totalTaxPaid / totalIncome) * 100 : 0;
    const paidMonths = entries.filter(e => e.status === 'paid').length;
    const pendingMonths = entries.filter(e => e.status === 'pending' || e.status === 'overdue').length;

    return {
      totalTaxPaid,
      totalIncome,
      effectiveTaxRate,
      paidMonths,
      pendingMonths
    };
  }

  // Add a new tax entry (upsert based on year and month, also restores soft-deleted records)
  async addTaxEntry(data: TaxFormData): Promise<void> {
    this.loading.set(true);
    try {
      // QA MOCK MODE: Simulate add without DB
      if (this.supabase.isMockMode) {
        console.log('🧪 [QA MODE] Simulating tax entry add...');
        await new Promise(resolve => setTimeout(resolve, 200));
        const newEntry = { tax_id: Date.now(), ...data, is_deleted: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as any;
        this.taxEntries.set([...this.taxEntries(), newEntry]);
        return;
      }

      const { error } = await this.supabase.db
        .from('tax')
        .upsert([{ ...data, is_deleted: false }], { onConflict: 'year,month' });

      if (error) throw error;

      await this.loadTaxEntries();
    } catch (error) {
      console.error('Error adding tax entry:', error);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  // Update an existing tax entry
  async updateTaxEntry(taxId: number, data: Partial<TaxFormData>): Promise<void> {
    this.loading.set(true);
    try {
      // QA MOCK MODE: Simulate update without DB
      if (this.supabase.isMockMode) {
        console.log('🧪 [QA MODE] Simulating tax entry update...');
        await new Promise(resolve => setTimeout(resolve, 200));
        this.taxEntries.set(this.taxEntries().map(e => e.tax_id === taxId ? { ...e, ...data, updated_at: new Date().toISOString() } : e));
        return;
      }

      const { error } = await this.supabase.db
        .from('tax')
        .update(data)
        .eq('tax_id', taxId);

      if (error) throw error;

      await this.loadTaxEntries();
    } catch (error) {
      console.error('Error updating tax entry:', error);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  // Soft delete a tax entry
  async deleteTaxEntry(taxId: number): Promise<void> {
    this.loading.set(true);
    try {
      // QA MOCK MODE: Simulate delete without DB
      if (this.supabase.isMockMode) {
        console.log('🧪 [QA MODE] Simulating tax entry delete...');
        await new Promise(resolve => setTimeout(resolve, 200));
        this.taxEntries.set(this.taxEntries().filter(e => e.tax_id !== taxId));
        return;
      }

      const { error } = await this.supabase.db
        .from('tax')
        .update({ is_deleted: true })
        .eq('tax_id', taxId);

      if (error) throw error;

      await this.loadTaxEntries();
    } catch (error) {
      console.error('Error deleting tax entry:', error);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  // Get available years from the entries
  getAvailableYears(): number[] {
    const years = new Set<number>();
    this.taxEntries().forEach(entry => years.add(entry.year));
    return Array.from(years).sort((a, b) => b - a);
  }
}
