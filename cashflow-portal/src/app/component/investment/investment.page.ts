import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  InvestmentService, 
  InvestmentEntry, 
  ConsolidatedInvestment,
  InvestmentType, 
  InvestmentStatus 
} from '../../services/investment.service';

// Year Entry interface for multiple years
interface YearEntry {
  investment_id?: number;
  year: number;
  invested_amount: number;
  interest_earned: number;
}

@Component({
  selector: 'app-investment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './investment.page.html',
  styleUrl: './investment.page.scss'
})
export class InvestmentPage implements OnInit {
  // Inject service
  constructor(private investmentService: InvestmentService) {}

  // Enums for template
  protected readonly InvestmentType = InvestmentType;
  protected readonly InvestmentStatus = InvestmentStatus;
  protected readonly Math = Math;

  // Signals for UI state
  protected selectedTab = signal<'all' | 'active' | 'past' | 'todo'>('all');
  protected showAddModal = signal<boolean>(false);
  protected showEditModal = signal<boolean>(false);
  protected showDeleteModal = signal<boolean>(false);
  protected showDetailsModal = signal<boolean>(false);
  protected showYearlyDetailsModal = signal<boolean>(false);
  protected showSummaryModal = signal<boolean>(false);
  protected summaryModalType = signal<'invested' | 'value' | 'returns' | null>(null);
  protected selectedInvestment = signal<InvestmentEntry | null>(null);
  protected selectedConsolidated = signal<ConsolidatedInvestment | null>(null);
  protected toastMessage = signal<string>('');
  protected toastVisible = signal<boolean>(false);

  // Form data signals
  protected formType = signal<InvestmentType | ''>(InvestmentType.PPF);
  protected formStatus = signal<InvestmentStatus | ''>(InvestmentStatus.ACTIVE);
  protected formName = signal<string>('');
  protected formYear = signal<number>(new Date().getFullYear());
  protected formInvestedAmount = signal<number>(0);
  protected formInterestEarned = signal<number>(0);
  protected formNotes = signal<string>('');

  // Multiple years entries signal
  protected yearEntries = signal<YearEntry[]>([]);
  protected showMultipleYears = signal<boolean>(false);

  // Get data from service
  protected investments = computed(() => this.investmentService.investments());
  protected consolidatedInvestments = computed(() => this.investmentService.consolidatedInvestments());
  protected totalInvested = computed(() => this.investmentService.totalInvested());
  protected totalCurrentValue = computed(() => this.investmentService.totalCurrentValue());
  protected totalReturns = computed(() => this.investmentService.totalReturns());
  protected totalReturnsPercentage = computed(() => this.investmentService.totalReturnsPercentage());
  protected activeInvestments = computed(() => this.investmentService.activeInvestments());
  protected pastInvestments = computed(() => this.investmentService.pastInvestments());
  protected todoInvestments = computed(() => this.investmentService.todoInvestments());
  protected activeConsolidatedInvestments = computed(() => this.investmentService.activeConsolidatedInvestments());
  protected pastConsolidatedInvestments = computed(() => this.investmentService.pastConsolidatedInvestments());
  protected todoConsolidatedInvestments = computed(() => this.investmentService.todoConsolidatedInvestments());

  // Active + Past investments count (excluding To-do)
  protected activePastInvestmentsCount = computed(() => 
    this.activeInvestments().length + this.pastInvestments().length
  );

  // Count of unique investment types (Active + Past only)
  protected uniqueInvestmentTypesCount = computed(() => {
    const types = new Set<InvestmentType>();
    this.activeInvestments().forEach(inv => types.add(inv.type));
    this.pastInvestments().forEach(inv => types.add(inv.type));
    return types.size;
  });

  // Filtered investments based on selected tab (consolidated view)
  protected filteredConsolidatedInvestments = computed(() => {
    const tab = this.selectedTab();
    switch (tab) {
      case 'active':
        return this.activeConsolidatedInvestments();
      case 'past':
        return this.pastConsolidatedInvestments();
      case 'todo':
        return this.todoConsolidatedInvestments();
      default:
        return this.consolidatedInvestments();
    }
  });

  // Breakdown by investment type for modals
  protected investmentTypeBreakdown = computed(() => {
    const breakdown = new Map<InvestmentType, { invested: number, interest: number, value: number, count: number }>();
    
    this.activeInvestments().forEach(inv => {
      const existing = breakdown.get(inv.type) || { invested: 0, interest: 0, value: 0, count: 0 };
      existing.invested += inv.invested_amount;
      existing.interest += inv.interest_earned || 0;
      existing.value += inv.invested_amount + (inv.interest_earned || 0);
      existing.count += 1;
      breakdown.set(inv.type, existing);
    });

    return Array.from(breakdown.entries()).map(([type, data]) => ({
      type,
      ...data,
      percentage: (data.invested / this.totalInvested()) * 100
    })).sort((a, b) => b.invested - a.invested);
  });

  // Year-wise breakdown
  protected yearWiseBreakdown = computed(() => {
    const breakdown = new Map<number, { invested: number, interest: number, count: number }>();
    
    this.activeInvestments().forEach(inv => {
      const existing = breakdown.get(inv.year) || { invested: 0, interest: 0, count: 0 };
      existing.invested += inv.invested_amount;
      existing.interest += inv.interest_earned || 0;
      existing.count += 1;
      breakdown.set(inv.year, existing);
    });

    return Array.from(breakdown.entries()).map(([year, data]) => ({
      year,
      ...data
    })).sort((a, b) => b.year - a.year);
  });

  // Investment types array for dropdown
  protected investmentTypes = Object.values(InvestmentType);
  protected investmentStatuses = Object.values(InvestmentStatus);

  ngOnInit(): void {
    console.log('📊 Investment Page Initialized');
  }

  // Open add modal
  protected openAddModal(): void {
    this.resetForm();
    this.showAddModal.set(true);
  }

  // Open edit modal - now shows all years for the investment
  protected openEditModal(investment: InvestmentEntry): void {
    this.selectedInvestment.set(investment);
    this.formType.set(investment.type);
    this.formStatus.set(investment.status);
    this.formName.set(investment.name);
    this.formNotes.set(investment.notes || '');
    
    // Find all years for this investment (same name and type)
    const allYears = this.investments().filter(inv => 
      inv.name === investment.name && 
      inv.type === investment.type
    ).sort((a, b) => a.year - b.year);
    
    // Populate yearEntries with all years
    this.yearEntries.set(allYears.map(inv => ({
      investment_id: inv.investment_id,
      year: inv.year,
      invested_amount: inv.invested_amount,
      interest_earned: inv.interest_earned || 0
    })));
    
    this.showEditModal.set(true);
  }

  // Open delete confirmation
  protected openDeleteModal(investment: InvestmentEntry): void {
    this.selectedInvestment.set(investment);
    this.showDeleteModal.set(true);
  }

  // Open details modal
  protected openDetailsModal(investment: InvestmentEntry): void {
    this.selectedInvestment.set(investment);
    this.showDetailsModal.set(true);
  }

  // Open yearly details modal for consolidated investment
  protected openYearlyDetailsModal(consolidated: ConsolidatedInvestment): void {
    this.selectedConsolidated.set(consolidated);
    this.showYearlyDetailsModal.set(true);
  }

  // Close all modals
  protected closeModals(): void {
    this.showAddModal.set(false);
    this.showEditModal.set(false);
    this.showDeleteModal.set(false);
    this.showDetailsModal.set(false);
    this.showYearlyDetailsModal.set(false);
    this.showSummaryModal.set(false);
    this.summaryModalType.set(null);
    this.selectedInvestment.set(null);
    this.selectedConsolidated.set(null);
  }

  // Open summary modal
  protected openSummaryModal(type: 'invested' | 'value' | 'returns'): void {
    this.summaryModalType.set(type);
    this.showSummaryModal.set(true);
  }

  // Reset form - clear all fields including Type and Status
  protected resetForm(): void {
    this.formType.set('');
    this.formStatus.set('');
    this.formName.set('');
    this.formYear.set(0);
    this.formInvestedAmount.set(0);
    this.formInterestEarned.set(0);
    this.formNotes.set('');
    this.yearEntries.set([]);
    this.showMultipleYears.set(false);
  }

  // Add current form data to year entries
  protected addYearEntry(): void {
    if (this.formYear() && this.formInvestedAmount() > 0) {
      const newEntry: YearEntry = {
        year: this.formYear(),
        invested_amount: this.formInvestedAmount(),
        interest_earned: this.formInterestEarned()
      };
      
      // Check if year already exists
      const existingIndex = this.yearEntries().findIndex(e => e.year === newEntry.year);
      if (existingIndex >= 0) {
        this.showToast('⚠️ Year already added! Edit or remove it first.');
        return;
      }
      
      this.yearEntries.set([...this.yearEntries(), newEntry]);
      this.showMultipleYears.set(true);
      
      // Reset only year-specific fields
      this.formYear.set(this.formYear() + 1);
      this.formInvestedAmount.set(0);
      this.formInterestEarned.set(0);
      
      this.showToast('✅ Year added! Add more or save all.');
    } else {
      this.showToast('⚠️ Please fill year and invested amount');
    }
  }

  // Remove year entry
  protected removeYearEntry(index: number): void {
    const entries = this.yearEntries().filter((_, i) => i !== index);
    this.yearEntries.set(entries);
    if (entries.length === 0) {
      this.showMultipleYears.set(false);
    }
  }

  // Edit year entry
  protected editYearEntry(index: number): void {
    const entry = this.yearEntries()[index];
    this.formYear.set(entry.year);
    this.formInvestedAmount.set(entry.invested_amount);
    this.formInterestEarned.set(entry.interest_earned);
    this.removeYearEntry(index);
  }

  // Update year entry value (for table editing)
  protected updateYearEntryValue(index: number, field: keyof YearEntry, value: any): void {
    const entries = [...this.yearEntries()];
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    entries[index] = { ...entries[index], [field]: numValue };
    this.yearEntries.set(entries);
  }

  // Add new year in edit mode
  protected addNewYearInEdit(): void {
    const currentYears = this.yearEntries().map(e => e.year);
    const latestYear = currentYears.length > 0 ? Math.max(...currentYears) : new Date().getFullYear();
    const newYear = latestYear + 1;
    
    // Check if year already exists
    if (currentYears.includes(newYear)) {
      this.showToast('⚠️ Year ' + newYear + ' already exists!');
      return;
    }

    const newEntry: YearEntry = {
      year: newYear,
      invested_amount: 0,
      interest_earned: 0
    };

    this.yearEntries.set([...this.yearEntries(), newEntry]);
    this.showToast('✅ New year ' + newYear + ' added!');
  }

  // Save investment (add)
  protected async saveInvestment(): Promise<void> {
    // Validate required fields
    if (!this.formType() || !this.formStatus()) {
      this.showToast('⚠️ Please select Investment Type and Status');
      return;
    }

    // Validate required fields based on status
    const isTodo = this.formStatus() === InvestmentStatus.TODO;
    
    if (!isTodo && (!this.formName() || (!this.yearEntries().length && this.formInvestedAmount() <= 0))) {
      this.showToast('⚠️ Please fill required fields');
      return;
    }

    // For To-do status, only name is required (set defaults for year and amount)
    const yearToSave = this.formYear() || new Date().getFullYear();
    const amountToSave = this.formInvestedAmount() || 0;

    try {
      // If there are multiple year entries, save them all
      if (this.yearEntries().length > 0) {
        // Add current form entry if it has data
        if (this.formYear() && this.formInvestedAmount() > 0) {
          this.yearEntries.set([...this.yearEntries(), {
            year: this.formYear(),
            invested_amount: this.formInvestedAmount(),
            interest_earned: this.formInterestEarned()
          }]);
        }

        // Save all year entries
        for (const entry of this.yearEntries()) {
          await this.investmentService.addInvestment({
            type: this.formType() as InvestmentType,
            status: this.formStatus() as InvestmentStatus,
            name: this.formName(),
            year: entry.year || new Date().getFullYear(),
            invested_amount: entry.invested_amount || 0,
            interest_earned: entry.interest_earned || undefined,
            notes: this.formNotes()
          });
        }
        
        this.showToast(`✅ ${this.yearEntries().length} year(s) added successfully!`);
      } else {
        // Save single year entry
        await this.investmentService.addInvestment({
          type: this.formType() as InvestmentType,
          status: this.formStatus() as InvestmentStatus,
          name: this.formName(),
          year: yearToSave,
          invested_amount: amountToSave,
          interest_earned: this.formInterestEarned() || undefined,
          notes: this.formNotes()
        });
        
        this.showToast('✅ Investment added successfully!');
      }
      
      this.closeModals();
    } catch (err) {
      this.showToast('❌ Failed to add investment');
      console.error(err);
    }
  }

  // Update investment - now updates all years
  protected async updateInvestment(): Promise<void> {
    if (!this.formName() || this.yearEntries().length === 0) {
      this.showToast('⚠️ Please fill required fields');
      return;
    }

    try {
      // Update all year entries
      for (const entry of this.yearEntries()) {
        if (entry.investment_id) {
          // Update existing year
          await this.investmentService.updateInvestment(entry.investment_id, {
            type: this.formType(),
            status: this.formStatus(),
            name: this.formName(),
            year: entry.year,
            invested_amount: entry.invested_amount,
            interest_earned: entry.interest_earned || undefined,
            notes: this.formNotes()
          });
        }
      }

      this.showToast(`✅ ${this.yearEntries().length} year(s) updated successfully!`);
      this.closeModals();
    } catch (err) {
      this.showToast('❌ Failed to update investment');
      console.error(err);
    }
  }

  // Delete investment
  protected async deleteInvestment(): Promise<void> {
    const investment = this.selectedInvestment();
    if (!investment) return;

    try {
      await this.investmentService.deleteInvestment(investment.investment_id);
      this.showToast('✅ Investment deleted successfully!');
      this.closeModals();
    } catch (err) {
      this.showToast('❌ Failed to delete investment');
      console.error(err);
    }
  }

  // Show toast notification
  protected showToast(message: string): void {
    this.toastMessage.set(message);
    this.toastVisible.set(true);
    setTimeout(() => this.toastVisible.set(false), 3000);
  }

  // Get status icon
  protected getStatusIcon(status: InvestmentStatus): string {
    switch (status) {
      case InvestmentStatus.ACTIVE:
        return '✅';
      case InvestmentStatus.PAST:
        return '📦';
      case InvestmentStatus.TODO:
        return '📋';
      default:
        return '📊';
    }
  }

  // Get type icon
  protected getTypeIcon(type: InvestmentType): string {
    switch (type) {
      case InvestmentType.PHYSICAL_GOLD:
        return '🪙';
      case InvestmentType.MUTUAL_FUND_SIP:
        return '📈';
      case InvestmentType.STOCKS:
        return '💹';
      case InvestmentType.PPF:
        return '🏛️';
      case InvestmentType.PF:
        return '💼';
      case InvestmentType.NPS:
        return '🎯';
      case InvestmentType.RD:
        return '💰';
      case InvestmentType.LAND:
        return '🏞️';
      case InvestmentType.HOUSE:
        return '🏠';
      default:
        return '📊';
    }
  }

  // Format currency
  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Calculate total invested amount from year entries
  protected getTotalInvestedAmount(): number {
    return this.yearEntries().reduce((sum, entry) => sum + entry.invested_amount, 0);
  }

  // Calculate total interest earned from year entries
  protected getTotalInterestEarned(): number {
    return this.yearEntries().reduce((sum, entry) => sum + (entry.interest_earned || 0), 0);
  }

  // Calculate total current value from year entries
  protected getTotalCurrentValue(): number {
    return this.yearEntries().reduce((sum, entry) => sum + entry.invested_amount + (entry.interest_earned || 0), 0);
  }

  // Format year
  protected formatYear(year: number): string {
    return year.toString();
  }

  // Get returns color class
  protected getReturnsColorClass(interestEarned: number | undefined): string {
    if (!interestEarned || interestEarned === 0) return 'neutral';
    return interestEarned >= 0 ? 'positive' : 'negative';
  }

  // Calculate returns percentage
  protected calculateReturnsPercentage(interestEarned: number, investedAmount: number): number {
    if (investedAmount === 0) return 0;
    return (interestEarned / investedAmount) * 100;
  }
}
