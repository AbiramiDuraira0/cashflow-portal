import { Injectable, signal, computed } from '@angular/core';

// Debt types enum
export enum DebtType {
  EDUCATION_LOAN = 'Education Loan',
  GOLD_LOAN = 'Gold Loan',
  PERSONAL_LOAN = 'Personal Loan',
  HOME_LOAN = 'Home Loan',
  CAR_LOAN = 'Car Loan',
  CREDIT_CARD = 'Credit Card',
  OTHER = 'Other'
}

// Debt status enum
export enum DebtStatus {
  OPEN = 'Open',
  CLOSED = 'Closed'
}

// Payment frequency enum
export enum PaymentFrequency {
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  YEARLY = 'Yearly',
  ONE_TIME = 'One-time'
}

// Debt Entry interface
export interface DebtEntry {
  id: string;
  type: DebtType;
  status: DebtStatus;
  lenderName: string; // Bank/Institution name
  accountNumber?: string;
  principalAmount: number; // Original loan amount
  interestRate: number; // Annual interest rate %
  tenure?: number; // In months
  emiAmount?: number; // Monthly EMI
  startDate: string; // Loan start date
  endDate?: string; // Expected/actual end date
  totalPaid: number; // Amount paid so far
  outstandingAmount: number; // Remaining amount
  totalInterest?: number; // Total interest to be paid/paid
  frequency: PaymentFrequency;
  nextPaymentDate?: string;
  closedDate?: string; // Actual closure date (for closed loans)
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Payment history interface
export interface PaymentHistory {
  id: string;
  debtId: string;
  paymentDate: string;
  amount: number;
  principalPaid: number;
  interestPaid: number;
  outstandingAfterPayment: number;
  notes?: string;
}

// Database format (for future Supabase integration)
export interface DbDebtEntry {
  debt_id: string;
  type: string;
  status: string;
  lender_name: string;
  account_number: string | null;
  principal_amount: number;
  interest_rate: number;
  tenure: number | null;
  emi_amount: number | null;
  start_date: string;
  end_date: string | null;
  total_paid: number;
  outstanding_amount: number;
  total_interest: number | null;
  frequency: string;
  next_payment_date: string | null;
  closed_date: string | null;
  notes: string | null;
  is_delete: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class DebtService {
  // Signal-based state management
  private debtData = signal<DebtEntry[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Public computed signals
  public readonly debts = computed(() => this.debtData());
  public readonly isLoading = computed(() => this.loading());
  public readonly errorMessage = computed(() => this.error());

  // Computed analytics
  public readonly totalPrincipal = computed(() => 
    this.debtData().reduce((sum, debt) => sum + debt.principalAmount, 0)
  );

  public readonly totalPaid = computed(() => 
    this.debtData().reduce((sum, debt) => sum + debt.totalPaid, 0)
  );

  public readonly totalOutstanding = computed(() => 
    this.debtData()
      .filter(debt => debt.status === DebtStatus.OPEN)
      .reduce((sum, debt) => sum + debt.outstandingAmount, 0)
  );

  public readonly totalMonthlyEMI = computed(() => 
    this.debtData()
      .filter(debt => debt.status === DebtStatus.OPEN && debt.emiAmount)
      .reduce((sum, debt) => sum + (debt.emiAmount || 0), 0)
  );

  public readonly openDebts = computed(() => 
    this.debtData().filter(debt => debt.status === DebtStatus.OPEN)
  );

  public readonly closedDebts = computed(() => 
    this.debtData().filter(debt => debt.status === DebtStatus.CLOSED)
  );

  public readonly debtFreePercentage = computed(() => {
    const total = this.totalPrincipal();
    if (total === 0) return 100;
    return (this.totalPaid() / total) * 100;
  });

  // Toggle between mock data and real DB
  private readonly USE_DB = false;

  private nextMockId = 300;

  constructor() {
    // Auto-load on service initialization
    this.loadDebtData().catch(err => {
      console.error('❌ Failed to auto-load debts:', err);
    });
  }

  // Load debt data (mock or from DB)
  async loadDebtData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      if (this.USE_DB) {
        // TODO: Implement Supabase integration when table is ready
        console.log('🏦 Loading from database...');
        // const { data, error } = await supabase.from('debts').select('*');
      } else {
        // Use mock data
        console.log('🏦 Loading debt mock data...');
        this.debtData.set(MOCK_DEBTS);
        console.log('✅ Loaded mock debts:', MOCK_DEBTS.length);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.error.set(message);
      console.error('❌ Error loading debts:', err);
    } finally {
      this.loading.set(false);
    }
  }

  // Add new debt
  async addDebt(data: Partial<DebtEntry>): Promise<void> {
    this.loading.set(true);
    try {
      if (this.USE_DB) {
        // TODO: Supabase insert
      } else {
        const newDebt: DebtEntry = {
          id: String(this.nextMockId++),
          type: data.type || DebtType.PERSONAL_LOAN,
          status: data.status || DebtStatus.OPEN,
          lenderName: data.lenderName || '',
          accountNumber: data.accountNumber,
          principalAmount: data.principalAmount || 0,
          interestRate: data.interestRate || 0,
          tenure: data.tenure,
          emiAmount: data.emiAmount,
          startDate: data.startDate || new Date().toISOString().split('T')[0],
          endDate: data.endDate,
          totalPaid: data.totalPaid || 0,
          outstandingAmount: data.outstandingAmount || data.principalAmount || 0,
          totalInterest: data.totalInterest,
          frequency: data.frequency || PaymentFrequency.MONTHLY,
          nextPaymentDate: data.nextPaymentDate,
          closedDate: data.closedDate,
          notes: data.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        this.debtData.update(current => [newDebt, ...current]);
        console.log('✅ Added debt:', newDebt);
      }
    } catch (err) {
      console.error('❌ Error adding debt:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  // Update debt
  async updateDebt(id: string, data: Partial<DebtEntry>): Promise<void> {
    this.loading.set(true);
    try {
      if (this.USE_DB) {
        // TODO: Supabase update
      } else {
        this.debtData.update(current => 
          current.map(debt => 
            debt.id === id 
              ? { ...debt, ...data, updatedAt: new Date().toISOString() }
              : debt
          )
        );
        console.log('✅ Updated debt:', id);
      }
    } catch (err) {
      console.error('❌ Error updating debt:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  // Delete debt
  async deleteDebt(id: string): Promise<void> {
    this.loading.set(true);
    try {
      if (this.USE_DB) {
        // TODO: Supabase soft delete
      } else {
        this.debtData.update(current => current.filter(debt => debt.id !== id));
        console.log('✅ Deleted debt:', id);
      }
    } catch (err) {
      console.error('❌ Error deleting debt:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  // Calculate EMI
  calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
    if (annualRate === 0) return principal / tenureMonths;
    
    const monthlyRate = annualRate / 12 / 100;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    return Math.round(emi * 100) / 100;
  }

  // Get debts signal for reactive updates
  getDebtsSignal() {
    return this.debts;
  }
}

// Mock data for testing
const MOCK_DEBTS: DebtEntry[] = [
  // Closed Debts (for tracking)
  {
    id: '1',
    type: DebtType.EDUCATION_LOAN,
    status: DebtStatus.CLOSED,
    lenderName: 'SBI Education Loan',
    accountNumber: 'EDU123456789',
    principalAmount: 500000,
    interestRate: 8.5,
    tenure: 60,
    emiAmount: 10282,
    startDate: '2018-07-01',
    endDate: '2023-06-30',
    closedDate: '2023-06-15',
    totalPaid: 616920,
    outstandingAmount: 0,
    totalInterest: 116920,
    frequency: PaymentFrequency.MONTHLY,
    notes: 'MBA loan - Closed early with prepayment',
    createdAt: '2018-07-01T10:00:00Z',
    updatedAt: '2023-06-15T10:00:00Z'
  },
  {
    id: '2',
    type: DebtType.GOLD_LOAN,
    status: DebtStatus.CLOSED,
    lenderName: 'Muthoot Finance',
    accountNumber: 'GOLD987654321',
    principalAmount: 200000,
    interestRate: 12.0,
    tenure: 12,
    emiAmount: 17775,
    startDate: '2023-01-15',
    endDate: '2024-01-14',
    closedDate: '2024-01-10',
    totalPaid: 213300,
    outstandingAmount: 0,
    totalInterest: 13300,
    frequency: PaymentFrequency.MONTHLY,
    notes: 'Emergency gold loan - Fully repaid',
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  // Open Debt
  {
    id: '3',
    type: DebtType.PERSONAL_LOAN,
    status: DebtStatus.OPEN,
    lenderName: 'HDFC Personal Loan',
    accountNumber: 'PL555666777',
    principalAmount: 300000,
    interestRate: 11.5,
    tenure: 36,
    emiAmount: 9881,
    startDate: '2024-06-01',
    endDate: '2027-05-31',
    totalPaid: 88929, // 9 months paid
    outstandingAmount: 211071,
    totalInterest: 55716,
    frequency: PaymentFrequency.MONTHLY,
    nextPaymentDate: '2026-04-01',
    notes: 'Home renovation loan',
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2026-03-22T10:00:00Z'
  }
];
