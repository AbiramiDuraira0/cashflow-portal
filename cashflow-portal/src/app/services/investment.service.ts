import { Injectable, signal, computed } from '@angular/core';

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
  id: string;
  type: InvestmentType;
  status: InvestmentStatus;
  name: string; // e.g., "HDFC Top 100 Fund", "Infosys Stock"
  startDate: string; // YYYY-MM-DD
  endDate?: string; // For closed investments
  investedAmount: number; // Total amount invested
  currentValue?: number; // Current market value (for active)
  maturityValue?: number; // Expected/actual maturity value
  maturityDate?: string; // Expected/actual maturity date
  frequency?: string; // For SIP: Monthly, Quarterly, etc.
  units?: number; // For stocks/MF
  avgPrice?: number; // Average purchase price
  currentPrice?: number; // Current market price
  returns?: number; // Calculated returns
  returnsPercentage?: number; // Calculated returns %
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Database format (for future Supabase integration)
export interface DbInvestmentEntry {
  investment_id: string;
  type: string;
  status: string;
  name: string;
  start_date: string;
  end_date: string | null;
  invested_amount: number;
  current_value: number | null;
  maturity_value: number | null;
  maturity_date: string | null;
  frequency: string | null;
  units: number | null;
  avg_price: number | null;
  current_price: number | null;
  returns: number | null;
  returns_percentage: number | null;
  notes: string | null;
  is_delete: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
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
    this.investmentData().reduce((sum, inv) => sum + inv.investedAmount, 0)
  );

  public readonly totalCurrentValue = computed(() => 
    this.investmentData()
      .filter(inv => inv.status === InvestmentStatus.ACTIVE && inv.currentValue)
      .reduce((sum, inv) => sum + (inv.currentValue || 0), 0)
  );

  public readonly totalReturns = computed(() => {
    const invested = this.investmentData()
      .filter(inv => inv.status === InvestmentStatus.ACTIVE)
      .reduce((sum, inv) => sum + inv.investedAmount, 0);
    const current = this.totalCurrentValue();
    return current - invested;
  });

  public readonly totalReturnsPercentage = computed(() => {
    const invested = this.investmentData()
      .filter(inv => inv.status === InvestmentStatus.ACTIVE)
      .reduce((sum, inv) => sum + inv.investedAmount, 0);
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

  // Toggle between mock data and real DB
  private readonly USE_DB = false;

  private nextMockId = 200;

  constructor() {
    // Auto-load on service initialization
    this.loadInvestmentData().catch(err => {
      console.error('❌ Failed to auto-load investments:', err);
    });
  }

  // Load investment data (mock or from DB)
  async loadInvestmentData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      if (this.USE_DB) {
        // TODO: Implement Supabase integration when table is ready
        console.log('📊 Loading from database...');
        // const { data, error } = await supabase.from('investments').select('*');
      } else {
        // Use mock data
        console.log('📊 Loading investment mock data...');
        this.investmentData.set(MOCK_INVESTMENTS);
        console.log('✅ Loaded mock investments:', MOCK_INVESTMENTS.length);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.error.set(message);
      console.error('❌ Error loading investments:', err);
    } finally {
      this.loading.set(false);
    }
  }

  // Add new investment
  async addInvestment(data: Partial<InvestmentEntry>): Promise<void> {
    this.loading.set(true);
    try {
      if (this.USE_DB) {
        // TODO: Supabase insert
      } else {
        const newInvestment: InvestmentEntry = {
          id: String(this.nextMockId++),
          type: data.type || InvestmentType.MUTUAL_FUND_SIP,
          status: data.status || InvestmentStatus.ACTIVE,
          name: data.name || '',
          startDate: data.startDate || new Date().toISOString().split('T')[0],
          endDate: data.endDate,
          investedAmount: data.investedAmount || 0,
          currentValue: data.currentValue,
          maturityValue: data.maturityValue,
          maturityDate: data.maturityDate,
          frequency: data.frequency,
          units: data.units,
          avgPrice: data.avgPrice,
          currentPrice: data.currentPrice,
          returns: data.returns,
          returnsPercentage: data.returnsPercentage,
          notes: data.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Calculate returns if current value is provided
        if (newInvestment.currentValue && newInvestment.status === InvestmentStatus.ACTIVE) {
          newInvestment.returns = newInvestment.currentValue - newInvestment.investedAmount;
          newInvestment.returnsPercentage = (newInvestment.returns / newInvestment.investedAmount) * 100;
        }

        this.investmentData.update(current => [newInvestment, ...current]);
        console.log('✅ Added investment:', newInvestment);
      }
    } catch (err) {
      console.error('❌ Error adding investment:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  // Update investment
  async updateInvestment(id: string, data: Partial<InvestmentEntry>): Promise<void> {
    this.loading.set(true);
    try {
      if (this.USE_DB) {
        // TODO: Supabase update
      } else {
        this.investmentData.update(current => 
          current.map(inv => {
            if (inv.id === id) {
              const updated = { ...inv, ...data, updatedAt: new Date().toISOString() };
              
              // Recalculate returns if values changed
              if (updated.currentValue && updated.status === InvestmentStatus.ACTIVE) {
                updated.returns = updated.currentValue - updated.investedAmount;
                updated.returnsPercentage = (updated.returns / updated.investedAmount) * 100;
              }
              
              return updated;
            }
            return inv;
          })
        );
        console.log('✅ Updated investment:', id);
      }
    } catch (err) {
      console.error('❌ Error updating investment:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  // Delete investment
  async deleteInvestment(id: string): Promise<void> {
    this.loading.set(true);
    try {
      if (this.USE_DB) {
        // TODO: Supabase soft delete
      } else {
        this.investmentData.update(current => current.filter(inv => inv.id !== id));
        console.log('✅ Deleted investment:', id);
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
}

// Mock data for testing
const MOCK_INVESTMENTS: InvestmentEntry[] = [
  // Active Investments
  {
    id: '1',
    type: InvestmentType.MUTUAL_FUND_SIP,
    status: InvestmentStatus.ACTIVE,
    name: 'HDFC Top 100 Fund',
    startDate: '2024-01-15',
    investedAmount: 120000,
    currentValue: 135000,
    returns: 15000,
    returnsPercentage: 12.5,
    frequency: 'Monthly',
    units: 1250,
    avgPrice: 96,
    currentPrice: 108,
    notes: 'Long-term wealth creation',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2026-03-22T10:00:00Z'
  },
  {
    id: '2',
    type: InvestmentType.STOCKS,
    status: InvestmentStatus.ACTIVE,
    name: 'Infosys Ltd',
    startDate: '2025-06-10',
    investedAmount: 85000,
    currentValue: 92000,
    returns: 7000,
    returnsPercentage: 8.24,
    units: 50,
    avgPrice: 1700,
    currentPrice: 1840,
    notes: 'IT sector growth stock',
    createdAt: '2025-06-10T10:00:00Z',
    updatedAt: '2026-03-22T10:00:00Z'
  },
  {
    id: '3',
    type: InvestmentType.PPF,
    status: InvestmentStatus.ACTIVE,
    name: 'PPF Account - SBI',
    startDate: '2023-04-01',
    investedAmount: 450000,
    currentValue: 485000,
    returns: 35000,
    returnsPercentage: 7.78,
    maturityDate: '2038-04-01',
    maturityValue: 950000,
    frequency: 'Yearly',
    notes: 'Tax-free retirement savings',
    createdAt: '2023-04-01T10:00:00Z',
    updatedAt: '2026-03-22T10:00:00Z'
  },
  {
    id: '4',
    type: InvestmentType.NPS,
    status: InvestmentStatus.ACTIVE,
    name: 'NPS Tier-I',
    startDate: '2024-07-01',
    investedAmount: 180000,
    currentValue: 195000,
    returns: 15000,
    returnsPercentage: 8.33,
    frequency: 'Monthly',
    notes: 'Retirement pension plan',
    createdAt: '2024-07-01T10:00:00Z',
    updatedAt: '2026-03-22T10:00:00Z'
  },
  {
    id: '5',
    type: InvestmentType.RD,
    status: InvestmentStatus.ACTIVE,
    name: 'Recurring Deposit - HDFC',
    startDate: '2025-09-01',
    investedAmount: 60000,
    currentValue: 62500,
    returns: 2500,
    returnsPercentage: 4.17,
    maturityDate: '2028-09-01',
    maturityValue: 75000,
    frequency: 'Monthly',
    notes: 'Fixed income investment',
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2026-03-22T10:00:00Z'
  },
  {
    id: '6',
    type: InvestmentType.PF,
    status: InvestmentStatus.ACTIVE,
    name: 'Employee Provident Fund',
    startDate: '2022-01-01',
    investedAmount: 650000,
    currentValue: 720000,
    returns: 70000,
    returnsPercentage: 10.77,
    notes: 'Company PF with matching contribution',
    createdAt: '2022-01-01T10:00:00Z',
    updatedAt: '2026-03-22T10:00:00Z'
  },
  // Past Investments
  {
    id: '7',
    type: InvestmentType.PHYSICAL_GOLD,
    status: InvestmentStatus.PAST,
    name: 'Gold - 50 grams',
    startDate: '2020-05-15',
    endDate: '2025-12-20',
    investedAmount: 220000,
    currentValue: 310000,
    returns: 90000,
    returnsPercentage: 40.91,
    units: 50,
    avgPrice: 4400,
    notes: 'Sold at peak price',
    createdAt: '2020-05-15T10:00:00Z',
    updatedAt: '2025-12-20T10:00:00Z'
  },
  // To-do Investments
  {
    id: '8',
    type: InvestmentType.LAND,
    status: InvestmentStatus.TODO,
    name: 'Agricultural Land - Planning',
    startDate: '2026-06-01',
    investedAmount: 0,
    notes: 'Researching locations in Tamil Nadu',
    createdAt: '2026-03-22T10:00:00Z',
    updatedAt: '2026-03-22T10:00:00Z'
  },
  {
    id: '9',
    type: InvestmentType.HOUSE,
    status: InvestmentStatus.TODO,
    name: 'Residential Property - Future',
    startDate: '2027-01-01',
    investedAmount: 0,
    notes: 'Saving for down payment',
    createdAt: '2026-03-22T10:00:00Z',
    updatedAt: '2026-03-22T10:00:00Z'
  }
];
