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
  year: number;
  invested_amount: number;
  interest_earned?: number;
  notes?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

// Consolidated Investment interface (grouped by name)
export interface ConsolidatedInvestment {
  name: string;
  type: InvestmentType;
  status: InvestmentStatus;
  total_invested_amount: number;
  total_interest_earned: number;
  current_value: number;
  years: InvestmentEntry[];
  earliest_year: number;
  latest_year: number;
  years_count: number;
}

// Form data interface (for create/update)
export interface InvestmentFormData {
  type: string;
  status: string;
  name: string;
  year: number;
  invested_amount: number;
  interest_earned?: number;
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
    this.investmentData()
      .filter(inv => inv.status === InvestmentStatus.ACTIVE)
      .reduce((sum, inv) => sum + inv.invested_amount, 0)
  );

  public readonly totalInterestEarned = computed(() => 
    this.investmentData()
      .filter(inv => inv.status === InvestmentStatus.ACTIVE)
      .reduce((sum, inv) => sum + (inv.interest_earned || 0), 0)
  );

  public readonly totalCurrentValue = computed(() => 
    this.investmentData()
      .filter(inv => inv.status === InvestmentStatus.ACTIVE)
      .reduce((sum, inv) => sum + inv.invested_amount + (inv.interest_earned || 0), 0)
  );

  public readonly totalReturns = computed(() => {
    return this.totalInterestEarned();
  });

  public readonly totalReturnsPercentage = computed(() => {
    const invested = this.totalInvested();
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

  // Consolidated investments grouped by name and type
  public readonly consolidatedInvestments = computed(() => {
    const grouped = new Map<string, ConsolidatedInvestment>();
    
    this.investmentData().forEach(inv => {
      const key = `${inv.type}|${inv.name}`;
      
      if (!grouped.has(key)) {
        grouped.set(key, {
          name: inv.name,
          type: inv.type,
          status: inv.status,
          total_invested_amount: 0,
          total_interest_earned: 0,
          current_value: 0,
          years: [],
          earliest_year: inv.year,
          latest_year: inv.year,
          years_count: 0
        });
      }
      
      const consolidated = grouped.get(key)!;
      consolidated.total_invested_amount += inv.invested_amount;
      consolidated.total_interest_earned += inv.interest_earned || 0;
      consolidated.current_value += inv.invested_amount + (inv.interest_earned || 0);
      consolidated.years.push(inv);
      consolidated.earliest_year = Math.min(consolidated.earliest_year, inv.year);
      consolidated.latest_year = Math.max(consolidated.latest_year, inv.year);
      consolidated.years_count = consolidated.years.length;
      
      // Update status to Active if any year is Active
      if (inv.status === InvestmentStatus.ACTIVE) {
        consolidated.status = InvestmentStatus.ACTIVE;
      }
    });
    
    // Sort years within each consolidated investment
    grouped.forEach(consolidated => {
      consolidated.years.sort((a, b) => a.year - b.year);
    });
    
    return Array.from(grouped.values());
  });

  public readonly activeConsolidatedInvestments = computed(() => 
    this.consolidatedInvestments().filter(inv => inv.status === InvestmentStatus.ACTIVE)
  );

  public readonly pastConsolidatedInvestments = computed(() => 
    this.consolidatedInvestments().filter(inv => inv.status === InvestmentStatus.PAST)
  );

  public readonly todoConsolidatedInvestments = computed(() => 
    this.consolidatedInvestments().filter(inv => inv.status === InvestmentStatus.TODO)
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
        .order('year', { ascending: false });

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
  async addInvestment(data: InvestmentFormData): Promise<InvestmentEntry> {
    this.loading.set(true);
    try {
      const { data: insertedData, error } = await this.supabase.db
        .from('investment')
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      await this.loadInvestmentData();
      console.log('✅ Added investment');
      return insertedData;
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