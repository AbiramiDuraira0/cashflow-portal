import { Injectable, inject, signal } from '@angular/core';
import { DebtService, DebtEntry } from './debt.service';
import { DebtCalculatorService } from './debt-calculator.service';

/**
 * Debt Auto-Update Service
 * 
 * Handles automatic monthly updates for debts on the 7th of each month.
 * Uses browser's localStorage to track last update and Angular's lifecycle.
 * No database triggers required - all logic in Angular!
 */
@Injectable({ providedIn: 'root' })
export class DebtAutoUpdateService {
  private debtService = inject(DebtService);
  private calculator = inject(DebtCalculatorService);

  private readonly STORAGE_KEY = 'debt_last_update';
  private readonly CUTOFF_DAY = 7; // 7th of each month
  private updateInProgress = signal<boolean>(false);

  constructor() {
    // Check for pending updates on service initialization
    this.checkAndRunMonthlyUpdate();
  }

  /**
   * Check if monthly update should run and execute if needed
   */
  async checkAndRunMonthlyUpdate(): Promise<void> {
    if (this.updateInProgress()) {
      console.log('Update already in progress, skipping...');
      return;
    }

    const today = new Date();
    const currentDay = today.getDate();

    // Only run on or after the 7th
    if (currentDay < this.CUTOFF_DAY) {
      console.log(`Not yet cutoff day. Today is ${currentDay}, cutoff is ${this.CUTOFF_DAY}`);
      return;
    }

    // Check if we already updated this month
    const lastUpdate = this.getLastUpdateDate();
    if (this.isSameMonth(today, lastUpdate)) {
      console.log('Already updated this month:', lastUpdate);
      return;
    }

    // Run the update
    console.log('🔄 Running automatic monthly update...');
    await this.runMonthlyUpdate();
  }

  /**
   * Manually trigger monthly update (can be called from UI)
   */
  async runMonthlyUpdate(): Promise<{
    success: boolean;
    updatedCount: number;
    message: string;
    details: Array<{
      debtId: number;
      loanName: string;
      oldPaid: number;
      newPaid: number;
      emiAmount: number;
    }>;
  }> {
    this.updateInProgress.set(true);

    try {
      const debts = this.debtService.getAllDebts();
      const today = new Date();
      const updatedDebts: Array<any> = [];

      for (const debt of debts) {
        // Only update if:
        // 1. Status is open
        // 2. Not deleted
        // 3. Has EMI amount
        // 4. Has EMI dates
        // 5. Current date is within EMI period
        if (
          debt.status === 'open' &&
          !debt.isDeleted &&
          debt.emiAmount &&
          debt.emiAmount > 0 &&
          debt.emiStartDate &&
          debt.emiEndDate
        ) {
          const startDate = new Date(debt.emiStartDate);
          const endDate = new Date(debt.emiEndDate);

          // Check if we're within the EMI period
          if (today >= startDate && today <= endDate) {
            const oldPaid = debt.amountPaid;
            const newPaid = oldPaid + debt.emiAmount;

            // Calculate new outstanding
            const breakdown = this.calculator.calculateDebtBreakdown(
              debt.principalAmount,
              debt.interestRate || 0,
              newPaid,
              debt.emiAmount,
              debt.emiStartDate,
              debt.emiEndDate
            );

            // Update the debt in database
            await this.debtService.updateDebt(debt.id, {
              type: debt.type,
              loanName: debt.loanName,
              bankOrPerson: debt.bankOrPerson,
              principalAmount: debt.principalAmount,
              interestRate: debt.interestRate,
              emiAmount: debt.emiAmount,
              emiStartDate: debt.emiStartDate,
              emiEndDate: debt.emiEndDate,
              amountPaid: newPaid,
              outstandingAmount: breakdown.outstanding,
              status: breakdown.status,
              notes: debt.notes
            });

            updatedDebts.push({
              debtId: debt.id,
              loanName: debt.loanName,
              oldPaid,
              newPaid,
              emiAmount: debt.emiAmount
            });

            console.log(`✅ Updated ${debt.loanName}: ₹${oldPaid.toLocaleString()} → ₹${newPaid.toLocaleString()}`);
          }
        }
      }

      // Mark this month as updated
      this.setLastUpdateDate(today);

      return {
        success: true,
        updatedCount: updatedDebts.length,
        message: updatedDebts.length > 0 
          ? `Successfully updated ${updatedDebts.length} debt(s)` 
          : 'No debts needed updating',
        details: updatedDebts
      };

    } catch (error: any) {
      console.error('Error during monthly update:', error);
      return {
        success: false,
        updatedCount: 0,
        message: `Update failed: ${error.message}`,
        details: []
      };
    } finally {
      this.updateInProgress.set(false);
    }
  }

  /**
   * Calculate outstanding for a debt entry (without saving)
   */
  calculateOutstandingForDebt(debt: DebtEntry): number {
    const breakdown = this.calculator.calculateDebtBreakdown(
      debt.principalAmount,
      debt.interestRate || 0,
      debt.amountPaid,
      debt.emiAmount,
      debt.emiStartDate,
      debt.emiEndDate
    );
    return breakdown.outstanding;
  }

  /**
   * Get complete breakdown for a debt
   */
  getDebtBreakdown(debt: DebtEntry) {
    return this.calculator.calculateDebtBreakdown(
      debt.principalAmount,
      debt.interestRate || 0,
      debt.amountPaid,
      debt.emiAmount,
      debt.emiStartDate,
      debt.emiEndDate
    );
  }

  /**
   * Add a manual payment to a debt
   */
  async addPayment(debt: DebtEntry, paymentAmount: number): Promise<void> {
    const newPaid = debt.amountPaid + paymentAmount;

    const breakdown = this.calculator.calculateDebtBreakdown(
      debt.principalAmount,
      debt.interestRate || 0,
      newPaid,
      debt.emiAmount,
      debt.emiStartDate,
      debt.emiEndDate
    );

    await this.debtService.updateDebt(debt.id, {
      type: debt.type,
      loanName: debt.loanName,
      bankOrPerson: debt.bankOrPerson,
      principalAmount: debt.principalAmount,
      interestRate: debt.interestRate,
      emiAmount: debt.emiAmount,
      emiStartDate: debt.emiStartDate,
      emiEndDate: debt.emiEndDate,
      amountPaid: newPaid,
      outstandingAmount: breakdown.outstanding,
      status: breakdown.status,
      notes: debt.notes
    });
  }

  /**
   * Sync all debts - recalculate outstanding for all debts
   * Useful for data migration or fixing inconsistencies
   */
  async syncAllDebts(): Promise<{
    success: boolean;
    syncedCount: number;
    message: string;
  }> {
    try {
      const debts = this.debtService.getAllDebts();
      let syncedCount = 0;

      for (const debt of debts) {
        if (!debt.isDeleted) {
          const breakdown = this.calculator.calculateDebtBreakdown(
            debt.principalAmount,
            debt.interestRate || 0,
            debt.amountPaid,
            debt.emiAmount,
            debt.emiStartDate,
            debt.emiEndDate
          );

          // Only update if outstanding is different
          if (Math.abs(debt.outstandingAmount - breakdown.outstanding) > 0.01) {
            await this.debtService.updateDebt(debt.id, {
              type: debt.type,
              loanName: debt.loanName,
              bankOrPerson: debt.bankOrPerson,
              principalAmount: debt.principalAmount,
              interestRate: debt.interestRate,
              emiAmount: debt.emiAmount,
              emiStartDate: debt.emiStartDate,
              emiEndDate: debt.emiEndDate,
              amountPaid: debt.amountPaid,
              outstandingAmount: breakdown.outstanding,
              status: breakdown.status,
              notes: debt.notes
            });
            syncedCount++;
          }
        }
      }

      return {
        success: true,
        syncedCount,
        message: `Synced ${syncedCount} debt(s)`
      };
    } catch (error: any) {
      return {
        success: false,
        syncedCount: 0,
        message: `Sync failed: ${error.message}`
      };
    }
  }

  /**
   * Get last update date from localStorage
   */
  private getLastUpdateDate(): Date | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? new Date(stored) : null;
  }

  /**
   * Save last update date to localStorage
   */
  private setLastUpdateDate(date: Date): void {
    localStorage.setItem(this.STORAGE_KEY, date.toISOString());
  }

  /**
   * Check if two dates are in the same month
   */
  private isSameMonth(date1: Date, date2: Date | null): boolean {
    if (!date2) return false;
    return date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
  }

  /**
   * Get status of auto-update
   */
  getUpdateStatus(): {
    lastUpdate: Date | null;
    nextUpdate: Date;
    isUpdateDue: boolean;
    daysUntilUpdate: number;
  } {
    const today = new Date();
    const lastUpdate = this.getLastUpdateDate();
    
    // Calculate next update date (7th of next month if already updated this month)
    let nextUpdate = new Date(today.getFullYear(), today.getMonth(), this.CUTOFF_DAY);
    if (this.isSameMonth(today, lastUpdate) || today.getDate() >= this.CUTOFF_DAY) {
      nextUpdate.setMonth(nextUpdate.getMonth() + 1);
    }

    const isUpdateDue = today.getDate() >= this.CUTOFF_DAY && !this.isSameMonth(today, lastUpdate);
    const daysUntilUpdate = Math.ceil((nextUpdate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      lastUpdate,
      nextUpdate,
      isUpdateDue,
      daysUntilUpdate
    };
  }

  /**
   * Reset update tracking (for testing)
   */
  resetUpdateTracking(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('Update tracking reset');
  }
}
