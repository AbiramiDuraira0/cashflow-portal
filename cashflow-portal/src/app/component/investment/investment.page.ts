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
  protected selectedInvestment = signal<InvestmentEntry | null>(null);
  protected selectedConsolidated = signal<ConsolidatedInvestment | null>(null);
  protected toastMessage = signal<string>('');
  protected toastVisible = signal<boolean>(false);

  // Form data signals
  protected formType = signal<InvestmentType>(InvestmentType.PPF);
  protected formStatus = signal<InvestmentStatus>(InvestmentStatus.ACTIVE);
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

  // Open edit modal
  protected openEditModal(investment: InvestmentEntry): void {
    this.selectedInvestment.set(investment);
    this.formType.set(investment.type);
    this.formStatus.set(investment.status);
    this.formName.set(investment.name);
    this.formYear.set(investment.year);
    this.formInvestedAmount.set(investment.invested_amount);
    this.formInterestEarned.set(investment.interest_earned || 0);
    this.formNotes.set(investment.notes || '');
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
    this.selectedInvestment.set(null);
    this.selectedConsolidated.set(null);
  }

  // Reset form
  protected resetForm(): void {
    this.formType.set(InvestmentType.PPF);
    this.formStatus.set(InvestmentStatus.ACTIVE);
    this.formName.set('');
    this.formYear.set(new Date().getFullYear());
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

  // Save investment (add)
  protected async saveInvestment(): Promise<void> {
    if (!this.formName() || (!this.yearEntries().length && this.formInvestedAmount() <= 0)) {
      this.showToast('⚠️ Please fill required fields');
      return;
    }

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
            type: this.formType(),
            status: this.formStatus(),
            name: this.formName(),
            year: entry.year,
            invested_amount: entry.invested_amount,
            interest_earned: entry.interest_earned || undefined,
            notes: this.formNotes()
          });
        }
        
        this.showToast(`✅ ${this.yearEntries().length} year(s) added successfully!`);
      } else {
        // Save single year entry
        await this.investmentService.addInvestment({
          type: this.formType(),
          status: this.formStatus(),
          name: this.formName(),
          year: this.formYear(),
          invested_amount: this.formInvestedAmount(),
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

  // Update investment
  protected async updateInvestment(): Promise<void> {
    const investment = this.selectedInvestment();
    if (!investment) return;

    if (!this.formName() || this.formInvestedAmount() <= 0) {
      this.showToast('⚠️ Please fill required fields');
      return;
    }

    try {
      await this.investmentService.updateInvestment(investment.investment_id, {
        type: this.formType(),
        status: this.formStatus(),
        name: this.formName(),
        year: this.formYear(),
        invested_amount: this.formInvestedAmount(),
        interest_earned: this.formInterestEarned() || undefined,
        notes: this.formNotes()
      });

      this.showToast('✅ Investment updated successfully!');
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
