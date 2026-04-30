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

// ============================================
// Mock Data for QA/Demo environment
// ============================================
const MOCK_INVESTMENTS: InvestmentEntry[] = [
  {
    investment_id: 1, type: InvestmentType.PPF, status: InvestmentStatus.ACTIVE,
    name: 'PPF Account', year: 2024, invested_amount: 150000, interest_earned: 12000,
    notes: 'Annual PPF investment', is_deleted: false,
    created_at: '2024-04-01T00:00:00Z', updated_at: '2024-04-01T00:00:00Z'
  },
  {
    investment_id: 2, type: InvestmentType.PPF, status: InvestmentStatus.ACTIVE,
    name: 'PPF Account', year: 2025, invested_amount: 150000, interest_earned: 11500,
    notes: 'Annual PPF investment', is_deleted: false,
    created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z'
  },
  {
    investment_id: 3, type: InvestmentType.MUTUAL_FUND_SIP, status: InvestmentStatus.ACTIVE,
    name: 'HDFC Top 100 Fund', year: 2024, invested_amount: 60000, interest_earned: 8500,
    notes: 'SIP @ 5000/month', is_deleted: false,
    created_at: '2024-01-01T00:00:00Z', updated_at: '2024-12-31T00:00:00Z'
  },
  {
    investment_id: 4, type: InvestmentType.MUTUAL_FUND_SIP, status: InvestmentStatus.ACTIVE,
    name: 'HDFC Top 100 Fund', year: 2025, invested_amount: 60000, interest_earned: 7200,
    notes: 'SIP @ 5000/month', is_deleted: false,
    created_at: '2025-01-01T00:00:00Z', updated_at: '2025-12-31T00:00:00Z'
  },
  {
    investment_id: 5, type: InvestmentType.PHYSICAL_GOLD, status: InvestmentStatus.ACTIVE,
    name: 'Gold Coins', year: 2023, invested_amount: 100000, interest_earned: 15000,
    notes: '10g gold coin purchase', is_deleted: false,
    created_at: '2023-11-01T00:00:00Z', updated_at: '2023-11-01T00:00:00Z'
  },
  {
    investment_id: 6, type: InvestmentType.PF, status: InvestmentStatus.ACTIVE,
    name: 'Employee PF', year: 2024, invested_amount: 180000, interest_earned: 14400,
    notes: 'EPF contribution', is_deleted: false,
    created_at: '2024-04-01T00:00:00Z', updated_at: '2024-04-01T00:00:00Z'
  },
  {
    investment_id: 7, type: InvestmentType.PF, status: InvestmentStatus.ACTIVE,
    name: 'Employee PF', year: 2025, invested_amount: 195000, interest_earned: 15600,
    notes: 'EPF contribution', is_deleted: false,
    created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z'
  },
  {
    investment_id: 8, type: InvestmentType.RD, status: InvestmentStatus.PAST,
    name: 'SBI RD', year: 2023, invested_amount: 36000, interest_earned: 2880,
    notes: 'Completed RD', is_deleted: false,
    created_at: '2023-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z'
  },
  {
    investment_id: 9, type: InvestmentType.STOCKS, status: InvestmentStatus.ACTIVE,
    name: 'Reliance Industries', year: 2024, invested_amount: 50000, interest_earned: 7500,
    notes: '20 shares', is_deleted: false,
    created_at: '2024-03-01T00:00:00Z', updated_at: '2024-03-01T00:00:00Z'
  },
  {
    investment_id: 10, type: InvestmentType.NPS, status: InvestmentStatus.TODO,
    name: 'National Pension Scheme', year: 2026, invested_amount: 50000, interest_earned: 0,
    notes: 'Planning to start NPS', is_deleted: false,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
  }
];

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
  private supabase = inject(SupabaseService);
  
  // Toggle between mock data (QA) and real DB (Production)
  private readonly USE_DB = false; // Set to false for QA environment with static demo data
  
  private nextMockId = 100; // For generating new IDs in mock mode
  
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

  // Load investment data from database or mock data
  async loadInvestmentData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      if (this.USE_DB) {
        const { data, error } = await this.supabase.db
          .from('investment')
          .select('*')
          .eq('is_deleted', false)
          .order('year', { ascending: false });

        if (error) throw error;

        this.investmentData.set(data || []);
        console.log('✅ Loaded investments:', (data || []).length);
      } else {
        // Use mock data for QA environment
        console.log('📊 Loading mock investment data (QA mode)...');
        this.investmentData.set([...MOCK_INVESTMENTS]);
        console.log('✅ Loaded mock investments:', MOCK_INVESTMENTS.length);
      }
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
      if (this.USE_DB) {
        const { data: insertedData, error } = await this.supabase.db
          .from('investment')
          .insert([data])
          .select()
          .single();

        if (error) throw error;

        await this.loadInvestmentData();
        console.log('✅ Added investment');
        return insertedData;
      } else {
        // Mock mode - add to local data
        const newInvestment: InvestmentEntry = {
          investment_id: this.nextMockId++,
          type: data.type as InvestmentType,
          status: data.status as InvestmentStatus,
          name: data.name,
          year: data.year,
          invested_amount: data.invested_amount,
          interest_earned: data.interest_earned || 0,
          notes: data.notes,
          is_deleted: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        this.investmentData.set([...this.investmentData(), newInvestment]);
        console.log('✅ Added investment (mock):', newInvestment);
        return newInvestment;
      }
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
      if (this.USE_DB) {
        const { error } = await this.supabase.db
          .from('investment')
          .update(data)
          .eq('investment_id', investment_id);

        if (error) throw error;

        await this.loadInvestmentData();
        console.log('✅ Updated investment:', investment_id);
      } else {
        // Mock mode - update in local data
        const updated = this.investmentData().map(inv => 
          inv.investment_id === investment_id 
            ? { ...inv, ...data, updated_at: new Date().toISOString() } as InvestmentEntry
            : inv
        );
        this.investmentData.set(updated);
        console.log('✅ Updated investment (mock):', investment_id);
      }
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
      if (this.USE_DB) {
        const { error } = await this.supabase.db
          .from('investment')
          .update({ is_deleted: true })
          .eq('investment_id', investment_id);

        if (error) throw error;

        await this.loadInvestmentData();
        console.log('✅ Deleted investment:', investment_id);
      } else {
        // Mock mode - filter out the deleted entry
        const updated = this.investmentData().filter(inv => inv.investment_id !== investment_id);
        this.investmentData.set(updated);
        console.log('✅ Deleted investment (mock):', investment_id);
      }
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