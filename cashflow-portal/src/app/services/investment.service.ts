import { Injectable, signal, computed, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

// Investment types enum
export enum InvestmentType {
  PHYSICAL_GOLD = 'Physical Gold',
  MUTUAL_FUND_SIP = 'MF - SIP',
  STOCKS = 'Stocks',
  PPF = 'PPF',
  PF = 'PF',
  NPS = 'NPS',
  RD = 'RD',
  LAND = 'Land',
  HOUSE = 'House'
}

// Investment status enum
export enum InvestmentStatus {
  ACTIVE = 'Active',
  PAST = 'Past',
  TODO = 'To-do'
}

// Investment Entry interface
export interface InvestmentEntry {
  investment_id: number;
  type: InvestmentType;
  status: InvestmentStatus;
  name: string;
  start_date: string;
  end_date?: string;
  invested_amount: number;
  current_value?: number;
  maturity_value?: number;
  maturity_date?: string;
  frequency?: string;
  units?: number;
  avg_price?: number;
  current_price?: number;
  returns?: number;
  returns_percentage?: number;
  notes?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

// Form data interface (for create/update)
export interface InvestmentFormData {
  type: string;
  status: string;
  name: string;
  start_date: string;
  end_date?: string;
  invested_amount: number;
  current_value?: number;
  maturity_value?: number;
  maturity_date?: string;
  frequency?: string;
  units?: number;
  avg_price?: number;
  current_price?: number;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
  private supabase = inject(SupabaseService);
  
  // Signal-based state management
  private investmentData = signal<InvestmentEntry[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Public computed signals
  public readonly investments = computed(() => this.investmentData());
  public readonly isLoading = computed(() => this.loading());
  public readonly errorMessage = computed(() => this.error());

  // Computed analytics
  public readonly totalInvested = computed(() => 
    this.investmentData().reduce((sum, inv) => sum + inv.invested_amount, 0)
  );

  public readonly totalCurrentValue = computed(() => 
    this.investmentData()
      .filter(inv => inv.status === InvestmentStatus.ACTIVE && inv.current_value)
      .reduce((sum, inv) => sum + (inv.current_value || 0), 0)
  );

  public readonly totalReturns = computed(() => {
    const invested = this.investmentData()
      .filter(inv => inv.status === InvestmentStatus.ACTIVE)
      .reduce((sum, inv) => sum + inv.invested_amount, 0);
    const current = this.totalCurrentValue();
    return current - invested;
  });

  public readonly totalReturnsPercentage = computed(() => {
    const invested = this.investmentData()
      .filter(inv => inv.status === InvestmentStatus.ACTIVE)
      .reduce((sum, inv) => sum + inv.invested_amount, 0);
    if (invested === 0) return 0;
    return (this.totalReturns() / invested) * 100;
  });

  public readonly activeInvestments = computed(() => 
    this.investmentData().filter(inv => inv.status === InvestmentStatus.ACTIVE)
  );

  public readonly pastInvestments = computed(() => 
    this.investmentData().filter(inv => inv.status === InvestmentStatus.PAST)
  );

  public readonly todoInvestments = computed(() => 
    this.investmentData().filter(inv => inv.status === InvestmentStatus.TODO)
  );

  constructor() {
    // Auto-load on service initialization
    this.loadInvestmentData();
  }

  // Load investment data from database
  async loadInvestmentData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const { data, error } = await this.supabase.db
        .from('investment')
        .select('*')
        .eq('is_deleted', false)
        .order('start_date', { ascending: false });

      if (error) throw error;

      this.investmentData.set(data || []);
      console.log('✅ Loaded investments:', (data || []).length);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.error.set(message);
      console.error('❌ Error loading investments:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  // Add new investment
  async addInvestment(data: InvestmentFormData): Promise<void> {
    this.loading.set(true);
    try {
      const { error } = await this.supabase.db
        .from('investment')
        .insert([data]);

      if (error) throw error;

      await this.loadInvestmentData();
      console.log('✅ Added investment');
    } catch (err) {
      console.error('❌ Error adding investment:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  // Update investment
  async updateInvestment(investment_id: number, data: Partial<InvestmentFormData>): Promise<void> {
    this.loading.set(true);
    try {
      const { error } = await this.supabase.db
        .from('investment')
        .update(data)
        .eq('investment_id', investment_id);

      if (error) throw error;

      await this.loadInvestmentData();
      console.log('✅ Updated investment:', investment_id);
    } catch (err) {
      console.error('❌ Error updating investment:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  // Delete investment (soft delete)
  async deleteInvestment(investment_id: number): Promise<void> {
    this.loading.set(true);
    try {
      const { error } = await this.supabase.db
        .from('investment')
        .update({ is_deleted: true })
        .eq('investment_id', investment_id);

      if (error) throw error;

      await this.loadInvestmentData();
      console.log('✅ Deleted investment:', investment_id);
    } catch (err) {
      console.error('❌ Error deleting investment:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  // Get investments signal for reactive updates
  getInvestmentsSignal() {
    return this.investments;
  }

  // Get loading signal
  getLoadingSignal() {
    return this.isLoading;
  }
}