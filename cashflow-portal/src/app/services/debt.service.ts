import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { DebtCalculatorService } from './debt-calculator.service';
import { MOCK_DEBT_DATA } from './mock-data';

export enum LoanName {
  BOB_EDUCATION_LOAN = 'Education Loan',
  SBI_GOLD_LOAN = 'Gold Loan',
  HDFC_PERSONAL_LOAN = 'Personal Loan',
  HDFC_PERSONAL_LOAN_TOP_UP = 'Personal Loan - Top Up',
  HOME_LOAN = 'Home Loan',
  CAR_LOAN = 'Car Loan',
  CREDIT_CARD = 'Credit Card',
  PERSONAL_LOAN = 'Personal Loan',
  OTHER = 'Other'
}

export type DebtType = 'debt' | 'receivable';
export type DebtStatus = 'open' | 'closed';

export type DbDebtEntry = {
  debt_id: number;
  debt_type: DebtType;
  loan_name: string;
  bank_or_person: string;
  principal_amount: number;
  interest_rate: number | null;
  emi_amount: number | null;
  emi_start_date: string | null;
  emi_end_date: string | null;
  outstanding_amount: number;
  amount_paid: number;
  status: DebtStatus;
  notes: string | null;
  is_delete: boolean;
  created_at: string;
  updated_at: string;
};

export type DebtEntry = {
  id: number;
  type: DebtType;
  loanName: string;
  bankOrPerson: string;
  principalAmount: number;
  interestRate?: number;
  emiAmount?: number;
  emiStartDate?: string;
  emiEndDate?: string;
  outstandingAmount: number;
  amountPaid: number;
  status: DebtStatus;
  notes?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DebtFormData = {
  type: DebtType;
  loanName: string;
  bankOrPerson: string;
  principalAmount: number;
  interestRate?: number;
  emiAmount?: number;
  emiStartDate?: string;
  emiEndDate?: string;
  outstandingAmount: number;
  amountPaid: number;
  status: DebtStatus;
  notes?: string;
};

export type DebtSummary = {
  totalDebts: number;
  totalReceivables: number;
  netPosition: number;
  debtCount: number;
  receivableCount: number;
  openCount: number;
  closedCount: number;
  totalOutstanding: number;
  totalInterestPaid: number;
  totalReceivableOutstanding: number;
};

export type DbRepaymentSchedule = {
  schedule_id: number;
  debt_id: number;
  installment_number: number;
  due_date: string;
  installment_amount: number;
  principal_amount: number;
  interest_amount: number;
  outstanding_principal: number;
  is_paid: boolean;
  paid_date: string | null;
  paid_amount: number | null;
  is_delete: boolean;
  created_at: string;
  updated_at: string;
};

export type RepaymentSchedule = {
  id: number;
  debtId: number;
  installmentNumber: number;
  dueDate: string;
  installmentAmount: number;
  principalAmount: number;
  interestAmount: number;
  outstandingPrincipal: number;
  isPaid: boolean;
  paidDate?: string;
  paidAmount?: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

@Injectable({ providedIn: 'root' })
export class DebtService {
  private supabase = inject(SupabaseService);
  private calculator = inject(DebtCalculatorService);
  private debtData = signal<DebtEntry[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);
  private readonly USE_DB = true;

  constructor() {
    this.loadDebtData().catch(err => console.error('Failed to load debts:', err));
  }

  getDebtsSignal() { return this.debtData; }
  getLoadingSignal() { return this.loading; }
  getErrorSignal() { return this.error; }

  private transformDbToApp(dbEntry: DbDebtEntry): DebtEntry {
    return {
      id: dbEntry.debt_id,
      type: dbEntry.debt_type,
      loanName: dbEntry.loan_name,
      bankOrPerson: dbEntry.bank_or_person,
      principalAmount: Number(dbEntry.principal_amount),
      interestRate: dbEntry.interest_rate ? Number(dbEntry.interest_rate) : undefined,
      emiAmount: dbEntry.emi_amount ? Number(dbEntry.emi_amount) : undefined,
      emiStartDate: dbEntry.emi_start_date || undefined,
      emiEndDate: dbEntry.emi_end_date || undefined,
      outstandingAmount: Number(dbEntry.outstanding_amount),
      amountPaid: Number(dbEntry.amount_paid),
      status: dbEntry.status,
      notes: dbEntry.notes || undefined,
      isDeleted: dbEntry.is_delete,
      createdAt: dbEntry.created_at,
      updatedAt: dbEntry.updated_at
    };
  }

  async loadDebtData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      // QA MOCK MODE: Return mock data instead of DB calls
      if (this.supabase.isMockMode) {
        console.log('🧪 [QA MODE] Loading MOCK debt data...');
        await new Promise(resolve => setTimeout(resolve, 300));
        const entries: DebtEntry[] = MOCK_DEBT_DATA.map(this.transformDbToApp.bind(this));
        this.debtData.set(entries);
        console.log('✅ Loaded mock debt entries:', entries.length);
        return;
      }

      if (this.USE_DB) {
        // Load ALL records including deleted ones (soft delete)
        const { data, error } = await this.supabase.db.from('debts').select('*').order('is_delete', { ascending: true }).order('status', { ascending: true }).order('created_at', { ascending: false });
        if (error) throw error;
        const entries: DebtEntry[] = (data || []).map(this.transformDbToApp.bind(this));
        this.debtData.set(entries);
      }
    } catch (err: any) {
      this.error.set(err.message || 'Failed to load debt data');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async addDebt(data: DebtFormData): Promise<DebtEntry> {
    this.loading.set(true);
    try {
      // QA MOCK MODE: Simulate add without DB
      if (this.supabase.isMockMode) {
        console.log('🧪 [QA MODE] Simulating debt add...');
        await new Promise(resolve => setTimeout(resolve, 200));
        const mockEntry: DebtEntry = {
          id: Date.now(), type: data.type, loanName: data.loanName, bankOrPerson: data.bankOrPerson,
          principalAmount: data.principalAmount, interestRate: data.interestRate, emiAmount: data.emiAmount,
          emiStartDate: data.emiStartDate, emiEndDate: data.emiEndDate, outstandingAmount: data.outstandingAmount,
          amountPaid: data.amountPaid, status: data.status, notes: data.notes,
          isDeleted: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        };
        this.debtData.set([...this.debtData(), mockEntry]);
        return mockEntry;
      }

      const newEntry = { debt_type: data.type, loan_name: data.loanName, bank_or_person: data.bankOrPerson, principal_amount: data.principalAmount, interest_rate: data.interestRate || null, emi_amount: data.emiAmount || null, emi_start_date: data.emiStartDate || null, emi_end_date: data.emiEndDate || null, outstanding_amount: data.outstandingAmount, amount_paid: data.amountPaid, status: data.status, notes: data.notes || null, is_delete: false };
      const { data: dbData, error } = await this.supabase.db.from('debts').insert([newEntry]).select().single();
      if (error) throw error;
      const addedEntry = this.transformDbToApp(dbData);
      this.debtData.set([...this.debtData(), addedEntry]);
      return addedEntry;
    } finally {
      this.loading.set(false);
    }
  }

  async updateDebt(id: number, data: DebtFormData): Promise<DebtEntry> {
    this.loading.set(true);
    try {
      const dbUpdates = { debt_type: data.type, loan_name: data.loanName, bank_or_person: data.bankOrPerson, principal_amount: data.principalAmount, interest_rate: data.interestRate || null, emi_amount: data.emiAmount || null, emi_start_date: data.emiStartDate || null, emi_end_date: data.emiEndDate || null, outstanding_amount: data.outstandingAmount, amount_paid: data.amountPaid, status: data.status, notes: data.notes || null };
      const { data: dbData, error } = await this.supabase.db.from('debts').update(dbUpdates).eq('debt_id', id).eq('is_delete', false).select().single();
      if (error) throw error;
      if (!dbData) throw new Error('Debt entry not found');
      const updatedEntry = this.transformDbToApp(dbData);
      const currentEntries = this.debtData();
      const index = currentEntries.findIndex(e => e.id === id);
      if (index !== -1) {
        const newEntries = [...currentEntries];
        newEntries[index] = updatedEntry;
        this.debtData.set(newEntries);
      }
      return updatedEntry;
    } finally {
      this.loading.set(false);
    }
  }

  async deleteDebt(id: number): Promise<boolean> {
    this.loading.set(true);
    try {
      // QA MOCK MODE: Simulate delete without DB
      if (this.supabase.isMockMode) {
        console.log('🧪 [QA MODE] Simulating debt delete...');
        await new Promise(resolve => setTimeout(resolve, 200));
        this.debtData.set(this.debtData().map(debt => debt.id === id ? { ...debt, isDeleted: true } : debt));
        return true;
      }

      const { error } = await this.supabase.db.from('debts').update({ is_delete: true }).eq('debt_id', id);
      if (error) throw error;
      
      // Mark as deleted in local state instead of removing
      this.debtData.set(
        this.debtData().map(debt => 
          debt.id === id ? { ...debt, isDeleted: true } : debt
        )
      );
      return true;
    } finally {
      this.loading.set(false);
    }
  }

  async reactivateDebt(id: number): Promise<boolean> {
    this.loading.set(true);
    try {
      const { error } = await this.supabase.db.from('debts').update({ is_delete: false }).eq('debt_id', id);
      if (error) throw error;
      
      // Mark as active in local state
      this.debtData.set(
        this.debtData().map(debt => 
          debt.id === id ? { ...debt, isDeleted: false } : debt
        )
      );
      return true;
    } finally {
      this.loading.set(false);
    }
  }

  getAllDebts(): DebtEntry[] { return this.debtData(); }
  getDebtsByType(type: DebtType): DebtEntry[] { return this.debtData().filter(d => d.type === type); }
  getDebtsByStatus(status: DebtStatus): DebtEntry[] { return this.debtData().filter(d => d.status === status); }
  getOpenDebts(): DebtEntry[] { return this.getDebtsByStatus('open'); }
  getClosedDebts(): DebtEntry[] { return this.getDebtsByStatus('closed'); }
  getActiveDebts(): DebtEntry[] { return this.debtData().filter(d => !d.isDeleted); }
  getDeletedDebts(): DebtEntry[] { return this.debtData().filter(d => d.isDeleted); }
  
  getSummary(): DebtSummary {
    const debts = this.debtData().filter(d => !d.isDeleted);
    const debtTypeDebts = debts.filter(d => d.type === 'debt');
    const receivables = debts.filter(d => d.type === 'receivable');
    const openDebts = debts.filter(d => d.status === 'open');
    const closedDebts = debts.filter(d => d.status === 'closed');
    
    const totalDebtsAmount = debtTypeDebts.reduce((sum, d) => sum + d.outstandingAmount, 0);
    const totalReceivablesAmount = receivables.reduce((sum, d) => sum + d.outstandingAmount, 0);
    
    // Calculate total interest paid
    // Interest Paid = Amount Paid - (Principal - Outstanding)
    const totalInterestPaid = debts.reduce((sum, d) => {
      const principalRepaid = d.principalAmount - d.outstandingAmount;
      const interestPaid = d.amountPaid - principalRepaid;
      return sum + (interestPaid > 0 ? interestPaid : 0);
    }, 0);
    
    return {
      totalDebts: totalDebtsAmount,
      totalReceivables: totalReceivablesAmount,
      netPosition: totalReceivablesAmount - totalDebtsAmount, // Positive = net receivables, Negative = net debts
      debtCount: debtTypeDebts.length,
      receivableCount: receivables.length,
      openCount: openDebts.length,
      closedCount: closedDebts.length,
      totalOutstanding: totalDebtsAmount,
      totalReceivableOutstanding: totalReceivablesAmount,
      totalInterestPaid: totalInterestPaid
    };
  }

  async reloadData(): Promise<void> { await this.loadDebtData(); }

  // Get enriched debt data from CSV for Personal Loan - Top Up
  async getEnrichedDebtFromCSV(debtId: number): Promise<DebtEntry | null> {
    try {
      const debt = this.debtData().find(d => d.id === debtId);
      if (!debt || debt.loanName !== 'Personal Loan - Top Up') {
        return null;
      }

      // Load CSV schedule
      const schedules = await this.getRepaymentSchedule(debtId);
      if (schedules.length === 0) {
        return debt; // Return original if CSV not available
      }

      // Find the last paid installment based on current date
      const today = new Date();
      const paidSchedules = schedules.filter(s => new Date(s.dueDate) < today);
      const lastPaidSchedule = paidSchedules.length > 0 ? paidSchedules[paidSchedules.length - 1] : null;

      if (!lastPaidSchedule) {
        // No payments made yet
        return {
          ...debt,
          amountPaid: 0,
          outstandingAmount: debt.principalAmount,
        };
      }

      // Calculate values from CSV
      const totalPaid = paidSchedules.reduce((sum, s) => sum + s.installmentAmount, 0);
      const totalPrincipalPaid = paidSchedules.reduce((sum, s) => sum + s.principalAmount, 0);
      const totalInterestPaid = paidSchedules.reduce((sum, s) => sum + s.interestAmount, 0);
      const outstanding = lastPaidSchedule.outstandingPrincipal;

      // Return enriched debt data from CSV
      return {
        ...debt,
        amountPaid: totalPaid,
        outstandingAmount: outstanding,
        // Store additional CSV data in the object
        principalAmount: debt.principalAmount,
      };
    } catch (error) {
      console.error('Failed to enrich debt from CSV:', error);
      return null;
    }
  }

  // Get summary from CSV for Personal Loan - Top Up
  async getCSVSummary(debtId: number): Promise<{
    totalPaid: number;
    principalPaid: number;
    interestPaid: number;
    outstanding: number;
    percentPaid: number;
    numberOfEMIsPaid: number;
  } | null> {
    try {
      const debt = this.debtData().find(d => d.id === debtId);
      if (!debt) return null;

      const schedules = await this.getRepaymentSchedule(debtId);
      if (schedules.length === 0) return null;

      const today = new Date();
      const paidSchedules = schedules.filter(s => new Date(s.dueDate) < today);

      const totalPaid = paidSchedules.reduce((sum, s) => sum + s.installmentAmount, 0);
      const principalPaid = paidSchedules.reduce((sum, s) => sum + s.principalAmount, 0);
      const interestPaid = paidSchedules.reduce((sum, s) => sum + s.interestAmount, 0);
      const lastPaid = paidSchedules.length > 0 ? paidSchedules[paidSchedules.length - 1] : null;
      const outstanding = lastPaid ? lastPaid.outstandingPrincipal : debt.principalAmount;
      const percentPaid = debt.principalAmount > 0 ? (principalPaid / debt.principalAmount) * 100 : 0;

      return {
        totalPaid,
        principalPaid,
        interestPaid,
        outstanding,
        percentPaid,
        numberOfEMIsPaid: paidSchedules.length
      };
    } catch (error) {
      console.error('Failed to get CSV summary:', error);
      return null;
    }
  }

  // Auto-calculate and update outstanding for a debt entry
  autoCalculateOutstanding(data: DebtFormData): DebtFormData {
    const breakdown = this.calculator.calculateDebtBreakdown(
      data.principalAmount,
      data.interestRate || 0,
      data.amountPaid,
      data.emiAmount,
      data.emiStartDate,
      data.emiEndDate
    );

    return {
      ...data,
      outstandingAmount: breakdown.outstanding,
      status: breakdown.status
    };
  }

  // Repayment Schedule Methods - Using CSV Data
  async getRepaymentSchedule(debtId: number): Promise<RepaymentSchedule[]> {
    try {
      // Load CSV file from public folder
      console.log('Fetching repayment schedule CSV...');
      const response = await fetch('/repayment_schedule.csv');
      
      if (!response.ok) {
        console.error('Failed to fetch CSV:', response.status, response.statusText);
        throw new Error(`Failed to load CSV: ${response.status}`);
      }
      
      const csvText = await response.text();
      console.log('CSV loaded, length:', csvText.length);
      
      // Parse CSV
      const lines = csvText.split('\n').filter(line => line.trim());
      console.log('Total lines in CSV:', lines.length);
      const schedules: RepaymentSchedule[] = [];
      
      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length < 6) continue;
        
        const installmentNumber = parseInt(values[0]);
        const dueDate = this.parseDateFromCSV(values[1]);
        const installmentAmount = parseFloat(values[2]);
        const principalAmount = parseFloat(values[3]);
        const interestAmount = parseFloat(values[4]);
        const outstandingPrincipal = parseFloat(values[5]);
        
        // Determine if paid based on current date
        const today = new Date();
        const dueDateObj = new Date(dueDate);
        const isPaid = dueDateObj < today;
        
        schedules.push({
          id: i,
          debtId: debtId,
          installmentNumber: installmentNumber,
          dueDate: dueDate,
          installmentAmount: installmentAmount,
          principalAmount: principalAmount,
          interestAmount: interestAmount,
          outstandingPrincipal: outstandingPrincipal,
          isPaid: isPaid,
          paidDate: isPaid ? dueDate : undefined,
          paidAmount: isPaid ? installmentAmount : undefined,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      return schedules;
    } catch (err: any) {
      console.error('Failed to load repayment schedule from CSV:', err);
      return [];
    }
  }

  private parseDateFromCSV(dateStr: string): string {
    // Format: "07/07/2024" to "2024-07-07"
    const parts = dateStr.trim().split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  }

  getScheduleSummary(schedules: RepaymentSchedule[]): {
    totalPaid: number;
    totalPending: number;
    principalPaid: number;
    interestPaid: number;
    paidCount: number;
    pendingCount: number;
    nextDueDate?: string;
    nextDueAmount?: number;
  } {
    const paidSchedules = schedules.filter(s => s.isPaid);
    const pendingSchedules = schedules.filter(s => !s.isPaid);
    
    const totalPaid = paidSchedules.reduce((sum, s) => sum + s.installmentAmount, 0);
    const principalPaid = paidSchedules.reduce((sum, s) => sum + s.principalAmount, 0);
    const interestPaid = paidSchedules.reduce((sum, s) => sum + s.interestAmount, 0);
    const totalPending = pendingSchedules.reduce((sum, s) => sum + s.installmentAmount, 0);
    
    const nextInstallment = pendingSchedules.length > 0 ? pendingSchedules[0] : undefined;
    
    return {
      totalPaid,
      totalPending,
      principalPaid,
      interestPaid,
      paidCount: paidSchedules.length,
      pendingCount: pendingSchedules.length,
      nextDueDate: nextInstallment?.dueDate,
      nextDueAmount: nextInstallment?.installmentAmount
    };
  }
}
