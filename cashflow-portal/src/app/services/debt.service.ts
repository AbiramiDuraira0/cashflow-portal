import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export enum LoanName {
  BOB_EDUCATION_LOAN = 'BOB Education Loan',
  SBI_GOLD_LOAN = 'SBI Gold Loan',
  HDFC_PERSONAL_LOAN = 'HDFC Personal Loan',
  HDFC_PERSONAL_LOAN_TOP_UP = 'HDFC Personal Loan - Top Up',
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

@Injectable({ providedIn: 'root' })
export class DebtService {
  private supabase = inject(SupabaseService);
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
}
