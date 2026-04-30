import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

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

// ============================================
// Mock Data for QA/Demo environment
// ============================================
const MOCK_TAX_ENTRIES: TaxEntry[] = [
  {
    tax_id: 1, year: 2026, month: 1, tax_paid: 12500, taxable_income: 125000,
    status: 'paid', payment_date: '2026-01-15', payment_mode: 'Online',
    notes: 'January TDS', created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-15T00:00:00Z', is_deleted: false
  },
  {
    tax_id: 2, year: 2026, month: 2, tax_paid: 12000, taxable_income: 120000,
    status: 'paid', payment_date: '2026-02-15', payment_mode: 'Online',
    notes: 'February TDS', created_at: '2026-02-15T00:00:00Z', updated_at: '2026-02-15T00:00:00Z', is_deleted: false
  },
  {
    tax_id: 3, year: 2026, month: 3, tax_paid: 13000, taxable_income: 130000,
    status: 'paid', payment_date: '2026-03-15', payment_mode: 'Online',
    notes: 'March TDS', created_at: '2026-03-15T00:00:00Z', updated_at: '2026-03-15T00:00:00Z', is_deleted: false
  },
  {
    tax_id: 4, year: 2026, month: 4, tax_paid: 12500, taxable_income: 125000,
    status: 'pending', payment_mode: 'Online',
    notes: 'April TDS - Due', created_at: '2026-04-01T00:00:00Z', updated_at: '2026-04-01T00:00:00Z', is_deleted: false
  },
  {
    tax_id: 5, year: 2025, month: 10, tax_paid: 11500, taxable_income: 115000,
    status: 'paid', payment_date: '2025-10-15', payment_mode: 'Online',
    notes: 'October TDS', created_at: '2025-10-15T00:00:00Z', updated_at: '2025-10-15T00:00:00Z', is_deleted: false
  },
  {
    tax_id: 6, year: 2025, month: 11, tax_paid: 11800, taxable_income: 118000,
    status: 'paid', payment_date: '2025-11-15', payment_mode: 'Online',
    notes: 'November TDS', created_at: '2025-11-15T00:00:00Z', updated_at: '2025-11-15T00:00:00Z', is_deleted: false
  },
  {
    tax_id: 7, year: 2025, month: 12, tax_paid: 13000, taxable_income: 130000,
    status: 'paid', payment_date: '2025-12-15', payment_mode: 'Online',
    notes: 'December TDS with bonus', created_at: '2025-12-15T00:00:00Z', updated_at: '2025-12-15T00:00:00Z', is_deleted: false
  }
];

@Injectable({
  providedIn: 'root'
})
export class TaxService {
  private supabase = inject(SupabaseService);
  private taxEntries = signal<TaxEntry[]>([]);
  private loading = signal<boolean>(false);

  // Toggle between mock data (QA) and real DB (Production)
  private readonly USE_DB = false; // Set to false for QA environment with static demo data
  
  private nextMockId = 100; // For generating new IDs in mock mode

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
      if (this.USE_DB) {
        const { data, error} = await this.supabase.db
          .from('tax')
          .select('*')
          .eq('is_deleted', false)
          .order('year', { ascending: false })
          .order('month', { ascending: true });

        if (error) throw error;

        this.taxEntries.set(data || []);
      } else {
        // Use mock data for QA environment
        console.log('📂 Loading mock tax data (QA mode)...');
        this.taxEntries.set([...MOCK_TAX_ENTRIES]);
        console.log('✅ Loaded mock tax entries:', MOCK_TAX_ENTRIES.length);
      }
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
      if (this.USE_DB) {
        const { error } = await this.supabase.db
          .from('tax')
          .upsert([{ ...data, is_deleted: false }], { onConflict: 'year,month' });

        if (error) throw error;

        await this.loadTaxEntries();
      } else {
        // Mock mode - add to local data
        const existingIndex = this.taxEntries().findIndex(
          e => e.year === data.year && e.month === data.month
        );
        
        const newEntry: TaxEntry = {
          tax_id: existingIndex >= 0 ? this.taxEntries()[existingIndex].tax_id : this.nextMockId++,
          ...data,
          created_at: existingIndex >= 0 ? this.taxEntries()[existingIndex].created_at : new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_deleted: false
        };
        
        if (existingIndex >= 0) {
          const updated = [...this.taxEntries()];
          updated[existingIndex] = newEntry;
          this.taxEntries.set(updated);
        } else {
          this.taxEntries.set([...this.taxEntries(), newEntry]);
        }
        console.log('✅ Tax entry added (mock):', newEntry);
      }
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
      if (this.USE_DB) {
        const { error } = await this.supabase.db
          .from('tax')
          .update(data)
          .eq('tax_id', taxId);

        if (error) throw error;

        await this.loadTaxEntries();
      } else {
        // Mock mode - update in local data
        const updated = this.taxEntries().map(entry => 
          entry.tax_id === taxId 
            ? { ...entry, ...data, updated_at: new Date().toISOString() } 
            : entry
        );
        this.taxEntries.set(updated);
        console.log('✅ Tax entry updated (mock)');
      }
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
      if (this.USE_DB) {
        const { error } = await this.supabase.db
          .from('tax')
          .update({ is_deleted: true })
          .eq('tax_id', taxId);

        if (error) throw error;

        await this.loadTaxEntries();
      } else {
        // Mock mode - filter out the deleted entry
        const updated = this.taxEntries().filter(entry => entry.tax_id !== taxId);
        this.taxEntries.set(updated);
        console.log('✅ Tax entry deleted (mock)');
      }
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
