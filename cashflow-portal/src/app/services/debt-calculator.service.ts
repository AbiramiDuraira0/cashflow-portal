import { Injectable } from '@angular/core';

/**
 * Debt Calculator Service
 * 
 * Pure calculation service for debt outstanding amounts.
 * No database dependencies - all calculations done in memory.
 */
@Injectable({ providedIn: 'root' })
export class DebtCalculatorService {

  /**
   * Calculate total interest based on EMI details or interest rate
   * 
   * @param principal - Original loan amount
   * @param interestRate - Annual interest rate (percentage)
   * @param emiStartDate - EMI start date (optional)
   * @param emiEndDate - EMI end date (optional)
   * @param emiAmount - Monthly EMI amount (optional)
   * @returns Total interest amount
   */
  calculateTotalInterest(
    principal: number,
    interestRate: number,
    emiStartDate?: string,
    emiEndDate?: string,
    emiAmount?: number
  ): number {
    if (!interestRate || interestRate === 0) {
      return 0;
    }

    // Method 1: Calculate from EMI details (most accurate)
    if (emiAmount && emiAmount > 0 && emiStartDate && emiEndDate) {
      const start = new Date(emiStartDate);
      const end = new Date(emiEndDate);
      
      // Calculate number of months
      const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                     (end.getMonth() - start.getMonth());
      
      if (months > 0) {
        const totalEmiAmount = emiAmount * months;
        const totalInterest = totalEmiAmount - principal;
        return Math.max(0, totalInterest);
      }
    }

    // Method 2: Fallback to simple interest for 1 year
    const simpleInterest = (principal * interestRate * 1) / 100;
    return Math.max(0, simpleInterest);
  }

  /**
   * Calculate outstanding amount
   * 
   * For AMORTIZING LOANS (reducing balance with EMI):
   *   Outstanding = Principal - Principal Component Paid
   *   We use the EMI schedule to calculate this properly
   * 
   * For SIMPLE LOANS (flat interest):
   *   Outstanding = Principal + Total Interest - Amount Paid
   * 
   * @param principal - Original loan amount
   * @param totalInterest - Total interest amount
   * @param amountPaid - Amount paid so far
   * @param emiAmount - Monthly EMI (if present, uses amortizing method)
   * @param interestRate - Annual interest rate
   * @returns Outstanding amount (never negative)
   */
  calculateOutstanding(
    principal: number, 
    totalInterest: number, 
    amountPaid: number,
    emiAmount?: number,
    interestRate?: number
  ): number {
    // If we have EMI details and interest rate, this is an AMORTIZING loan
    if (emiAmount && emiAmount > 0 && interestRate && interestRate > 0) {
      // Calculate number of EMIs paid
      const numberOfEMIsPaid = Math.floor(amountPaid / emiAmount);
      
      // Calculate principal paid using reducing balance method
      const monthlyRate = interestRate / 12 / 100;
      let remainingPrincipal = principal;
      
      for (let i = 0; i < numberOfEMIsPaid; i++) {
        const interestForMonth = remainingPrincipal * monthlyRate;
        const principalForMonth = emiAmount - interestForMonth;
        remainingPrincipal -= principalForMonth;
      }
      
      // Outstanding = Remaining Principal
      return Math.max(0, remainingPrincipal);
    }
    
    // For SIMPLE/FLAT interest loans (no EMI schedule)
    // Outstanding = Principal + Total Interest - Amount Paid
    const outstanding = principal + totalInterest - amountPaid;
    return Math.max(0, outstanding);
  }

  /**
   * Calculate total payable amount (Principal + Interest)
   * 
   * @param principal - Original loan amount
   * @param totalInterest - Total interest amount
   * @returns Total amount to be paid
   */
  calculateTotalPayable(principal: number, totalInterest: number): number {
    return principal + totalInterest;
  }

  /**
   * Calculate percentage paid
   * 
   * @param amountPaid - Amount paid so far
   * @param principal - Original loan amount
   * @returns Percentage paid (0-100)
   */
  calculatePercentPaid(amountPaid: number, principal: number): number {
    if (principal <= 0) return 0;
    return Math.min(100, (amountPaid / principal) * 100);
  }

  /**
   * Calculate interest paid (portion of amount paid that went to interest)
   * 
   * @param amountPaid - Total amount paid
   * @param principal - Original loan amount
   * @param outstandingAmount - Current outstanding amount
   * @returns Interest paid so far
   */
  calculateInterestPaid(amountPaid: number, principal: number, outstandingAmount: number): number {
    const principalRepaid = principal - outstandingAmount;
    const interestPaid = amountPaid - principalRepaid;
    return Math.max(0, interestPaid);
  }

  /**
   * Calculate principal paid (portion of amount paid that reduced principal)
   * 
   * @param principal - Original loan amount
   * @param outstandingAmount - Current outstanding amount
   * @returns Principal paid so far
   */
  calculatePrincipalPaid(principal: number, outstandingAmount: number): number {
    return Math.max(0, principal - outstandingAmount);
  }

  /**
   * Determine debt status based on outstanding amount
   * 
   * @param outstandingAmount - Current outstanding
   * @param amountPaid - Amount paid so far
   * @returns 'closed' if fully paid, 'open' otherwise
   */
  determineStatus(outstandingAmount: number, amountPaid: number): 'open' | 'closed' {
    return outstandingAmount === 0 && amountPaid > 0 ? 'closed' : 'open';
  }

  /**
   * Calculate EMI amount using reducing balance method
   * Formula: EMI = [P × R × (1+R)^N] / [(1+R)^N-1]
   * 
   * @param principal - Loan amount
   * @param annualRate - Annual interest rate (percentage)
   * @param tenureMonths - Loan tenure in months
   * @returns Monthly EMI amount
   */
  calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
    if (principal <= 0 || tenureMonths <= 0) {
      return 0;
    }

    if (annualRate === 0) {
      // No interest - simple division
      return principal / tenureMonths;
    }

    // Convert annual rate to monthly rate
    const monthlyRate = annualRate / 12 / 100;
    
    // EMI calculation
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    
    return Math.round(emi);
  }

  /**
   * Calculate how much should be paid by current date based on EMI schedule
   * 
   * @param emiAmount - Monthly EMI
   * @param emiStartDate - EMI start date
   * @param currentDate - Current date (default: today)
   * @returns Expected amount paid by current date
   */
  calculateExpectedPaidAmount(
    emiAmount: number,
    emiStartDate: string,
    currentDate: Date = new Date()
  ): number {
    if (!emiAmount || !emiStartDate) {
      return 0;
    }

    const startDate = new Date(emiStartDate);
    
    // If current date is before start date, nothing should be paid
    if (currentDate < startDate) {
      return 0;
    }

    // Calculate number of months elapsed
    const monthsElapsed = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
                          (currentDate.getMonth() - startDate.getMonth());

    // If we're past the start day of the month, count this month
    const dayOfMonth = currentDate.getDate();
    const startDayOfMonth = startDate.getDate();
    const completedMonths = dayOfMonth >= startDayOfMonth ? monthsElapsed + 1 : monthsElapsed;

    return Math.max(0, completedMonths * emiAmount);
  }

  /**
   * Check if payment is due for current month
   * 
   * @param emiStartDate - EMI start date
   * @param lastPaidDate - Last payment date (optional)
   * @param cutoffDay - Day of month for payment (default: 7)
   * @param currentDate - Current date (default: today)
   * @returns True if payment is due
   */
  isPaymentDue(
    emiStartDate: string,
    lastPaidDate: string | undefined,
    cutoffDay: number = 7,
    currentDate: Date = new Date()
  ): boolean {
    const startDate = new Date(emiStartDate);
    
    // If we haven't reached start date, no payment due
    if (currentDate < startDate) {
      return false;
    }

    // Check if today is on or after cutoff day
    if (currentDate.getDate() < cutoffDay) {
      return false;
    }

    // If no last paid date, payment is due
    if (!lastPaidDate) {
      return true;
    }

    const lastPaid = new Date(lastPaidDate);
    
    // Check if we're in a different month than last payment
    const isDifferentMonth = currentDate.getMonth() !== lastPaid.getMonth() || 
                            currentDate.getFullYear() !== lastPaid.getFullYear();

    return isDifferentMonth;
  }

  /**
   * Get next payment due date
   * 
   * @param emiStartDate - EMI start date
   * @param lastPaidDate - Last payment date (optional)
   * @param currentDate - Current date (default: today)
   * @returns Next payment due date
   */
  getNextPaymentDate(
    emiStartDate: string,
    lastPaidDate: string | undefined,
    currentDate: Date = new Date()
  ): Date {
    const startDate = new Date(emiStartDate);
    const paymentDay = startDate.getDate();

    let nextPaymentDate: Date;

    if (!lastPaidDate) {
      nextPaymentDate = new Date(startDate);
    } else {
      const lastPaid = new Date(lastPaidDate);
      nextPaymentDate = new Date(lastPaid);
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    }

    // Ensure it's on the correct day of month
    nextPaymentDate.setDate(paymentDay);

    return nextPaymentDate;
  }

  /**
   * Calculate complete debt breakdown
   * Returns all calculated values for a debt
   * 
   * @param principal - Original loan amount
   * @param interestRate - Annual interest rate
   * @param amountPaid - Amount paid so far
   * @param emiAmount - Monthly EMI amount (optional)
   * @param emiStartDate - EMI start date (optional)
   * @param emiEndDate - EMI end date (optional)
   * @returns Complete debt breakdown
   */
  calculateDebtBreakdown(
    principal: number,
    interestRate: number,
    amountPaid: number,
    emiAmount?: number,
    emiStartDate?: string,
    emiEndDate?: string
  ): {
    principal: number;
    totalInterest: number;
    totalPayable: number;
    amountPaid: number;
    outstanding: number;
    percentPaid: number;
    interestPaid: number;
    principalPaid: number;
    status: 'open' | 'closed';
  } {
    const totalInterest = this.calculateTotalInterest(
      principal, 
      interestRate, 
      emiStartDate, 
      emiEndDate, 
      emiAmount
    );

    const totalPayable = this.calculateTotalPayable(principal, totalInterest);
    
    // Pass EMI details and interest rate to calculateOutstanding for amortizing loan calculation
    const outstanding = this.calculateOutstanding(
      principal, 
      totalInterest, 
      amountPaid,
      emiAmount,
      interestRate
    );
    
    const percentPaid = this.calculatePercentPaid(amountPaid, totalPayable);
    const principalPaid = this.calculatePrincipalPaid(principal, outstanding);
    const interestPaid = this.calculateInterestPaid(amountPaid, principal, outstanding);
    const status = this.determineStatus(outstanding, amountPaid);

    return {
      principal,
      totalInterest,
      totalPayable,
      amountPaid,
      outstanding,
      percentPaid,
      interestPaid,
      principalPaid,
      status
    };
  }
}
