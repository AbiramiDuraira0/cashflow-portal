import { Component, signal, computed, OnInit, inject } from '@angular/core';
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
  private investmentService = inject(InvestmentService);

  // Loading state from service
  protected loading = this.investmentService.getLoadingSignal();

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
  protected summaryModalType = signal<'invested' | 'interest' | 'gross' | null>(null);
  protected selectedInvestment = signal<InvestmentEntry | null>(null);
  protected selectedConsolidated = signal<ConsolidatedInvestment | null>(null);
  protected toastMessage = signal<string>('');
  protected toastVisible = signal<boolean>(false);

  // Sorting signals for tables
  protected sortInvestedByType = signal<'asc' | 'desc' | null>(null);
  protected sortInvestedByYear = signal<'asc' | 'desc' | null>(null);
  protected sortInvestedByTypeName = signal<'asc' | 'desc' | null>(null);  // Sort by Type name
  protected sortInvestedByYearValue = signal<'asc' | 'desc' | null>(null); // Sort by Year value
  protected sortInterestByType = signal<'asc' | 'desc' | null>(null);
  protected sortInterestByYear = signal<'asc' | 'desc' | null>(null);
  protected sortInterestByTypeName = signal<'asc' | 'desc' | null>(null);  // Sort by Type name
  protected sortInterestByYearValue = signal<'asc' | 'desc' | null>(null); // Sort by Year value
  protected sortGrossByType = signal<'asc' | 'desc' | null>(null);
  protected sortGrossByTypeName = signal<'asc' | 'desc' | null>(null);      // Sort by Type name
  protected sortGrossByInvested = signal<'asc' | 'desc' | null>(null);      // Sort by Amount Invested
  protected sortGrossByInterest = signal<'asc' | 'desc' | null>(null);      // Sort by Interest Earned

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

  // Count of unique investment types (Active + Past + Todo - ALL)
  protected uniqueInvestmentTypesCount = computed(() => {
    const types = new Set<InvestmentType>();
    this.activeConsolidatedInvestments().forEach(inv => types.add(inv.type));
    this.pastConsolidatedInvestments().forEach(inv => types.add(inv.type));
    this.todoConsolidatedInvestments().forEach(inv => types.add(inv.type));
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

    let result = Array.from(breakdown.entries()).map(([type, data]) => ({
      type,
      ...data,
      percentage: (data.invested / this.totalInvested()) * 100
    }));

    // Apply sorting for Amount column
    const sortDirAmount = this.sortInvestedByType();
    const sortDirType = this.sortInvestedByTypeName();
    
    if (sortDirType === 'asc') {
      result.sort((a, b) => a.type.localeCompare(b.type));
    } else if (sortDirType === 'desc') {
      result.sort((a, b) => b.type.localeCompare(a.type));
    } else if (sortDirAmount === 'asc') {
      result.sort((a, b) => a.invested - b.invested);
    } else if (sortDirAmount === 'desc') {
      result.sort((a, b) => b.invested - a.invested);
    } else {
      result.sort((a, b) => b.invested - a.invested); // Default: highest first
    }

    return result;
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

    let result = Array.from(breakdown.entries()).map(([year, data]) => ({
      year,
      ...data
    }));

    // Apply sorting for Amount column or Year column
    const sortDirAmount = this.sortInvestedByYear();
    const sortDirYear = this.sortInvestedByYearValue();
    
    if (sortDirYear === 'asc') {
      result.sort((a, b) => a.year - b.year);
    } else if (sortDirYear === 'desc') {
      result.sort((a, b) => b.year - a.year);
    } else if (sortDirAmount === 'asc') {
      result.sort((a, b) => a.invested - b.invested);
    } else if (sortDirAmount === 'desc') {
      result.sort((a, b) => b.invested - a.invested);
    } else {
      result.sort((a, b) => b.year - a.year); // Default: newest year first
    }

    return result;
  });

  // Investment types array for dropdown
  protected investmentTypes = Object.values(InvestmentType);
  protected investmentStatuses = Object.values(InvestmentStatus);

  ngOnInit(): void {
    console.log('📊 Investment Page Initialized');
  }

  // Refresh data
  protected async refreshData(): Promise<void> {
    await this.investmentService.loadInvestmentData();
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
  protected openSummaryModal(type: 'invested' | 'interest' | 'gross'): void {
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
  protected async addYearEntry(): Promise<void> {
    console.log('🎯 addYearEntry called');
    console.log('📋 Current state:', {
      formYear: this.formYear(),
      formInvestedAmount: this.formInvestedAmount(),
      showEditModal: this.showEditModal(),
      showAddModal: this.showAddModal()
    });
    
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
        console.log('⚠️ Year already exists');
        return;
      }

      // If in edit mode, save to database immediately
      if (this.showEditModal()) {
        console.log('🔍 Edit Mode Detected - Saving to database...');
        console.log('📝 Data to save:', {
          type: this.formType(),
          status: this.formStatus(),
          name: this.formName(),
          year: newEntry.year,
          invested_amount: newEntry.invested_amount,
          interest_earned: newEntry.interest_earned
        });
        
        try {
          const savedInvestment = await this.investmentService.addInvestment({
            type: this.formType() as InvestmentType,
            status: this.formStatus() as InvestmentStatus,
            name: this.formName(),
            year: newEntry.year,
            invested_amount: newEntry.invested_amount,
            interest_earned: newEntry.interest_earned || undefined,
            notes: this.formNotes()
          });
          
          console.log('✅ Saved to database:', savedInvestment);
          
          // Add the investment_id to the entry
          newEntry.investment_id = savedInvestment.investment_id;
          
          this.showToast(`✅ Year ${newEntry.year} added to database (ID: ${savedInvestment.investment_id})!`);
        } catch (err) {
          this.showToast('❌ Failed to add year to database');
          console.error('❌ Database save error:', err);
          return;
        }
      }
      
      this.yearEntries.set([...this.yearEntries(), newEntry]);
      this.showMultipleYears.set(true);
      
      // Reset only year-specific fields
      this.formYear.set(this.formYear() + 1);
      this.formInvestedAmount.set(0);
      this.formInterestEarned.set(0);
      
      if (!this.showEditModal()) {
        this.showToast('✅ Year added! Add more or save all.');
      }
    } else {
      this.showToast('⚠️ Please fill year and invested amount');
    }
  }

  // Remove year entry
  protected async removeYearEntry(index: number): Promise<void> {
    const entry = this.yearEntries()[index];
    
    // If entry has investment_id, it exists in database - delete it
    if (entry.investment_id) {
      try {
        await this.investmentService.deleteInvestment(entry.investment_id);
        this.showToast('✅ Year deleted from database');
      } catch (err) {
        this.showToast('❌ Failed to delete year');
        console.error(err);
        return; // Don't remove from UI if DB delete failed
      }
    }
    
    // Remove from local array
    const entries = this.yearEntries().filter((_, i) => i !== index);
    this.yearEntries.set(entries);
    
    if (entries.length === 0) {
      this.showMultipleYears.set(false);
      // If we deleted all years in edit mode, close the modal
      if (this.showEditModal()) {
        this.closeModals();
        this.showToast('⚠️ All years deleted. Investment removed.');
      }
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
      let updatedCount = 0;
      let insertedCount = 0;
      
      // Process all year entries
      for (const entry of this.yearEntries()) {
        if (entry.investment_id) {
          // Update existing year
          console.log('📝 Updating existing investment:', entry.investment_id);
          await this.investmentService.updateInvestment(entry.investment_id, {
            type: this.formType(),
            status: this.formStatus(),
            name: this.formName(),
            year: entry.year,
            invested_amount: entry.invested_amount,
            interest_earned: entry.interest_earned || undefined,
            notes: this.formNotes()
          });
          updatedCount++;
        } else {
          // Insert new year (no investment_id means it's a new row)
          console.log('➕ Inserting new investment for year:', entry.year);
          const savedInvestment = await this.investmentService.addInvestment({
            type: this.formType() as InvestmentType,
            status: this.formStatus() as InvestmentStatus,
            name: this.formName(),
            year: entry.year,
            invested_amount: entry.invested_amount,
            interest_earned: entry.interest_earned || undefined,
            notes: this.formNotes()
          });
          
          // Update the entry with the new investment_id
          entry.investment_id = savedInvestment.investment_id;
          insertedCount++;
          console.log('✅ New investment created with ID:', savedInvestment.investment_id);
        }
      }

      const message = insertedCount > 0 
        ? `✅ ${updatedCount} updated, ${insertedCount} new year(s) added!`
        : `✅ ${updatedCount} year(s) updated successfully!`;
      
      this.showToast(message);
      this.closeModals();
    } catch (err) {
      this.showToast('❌ Failed to update investment');
      console.error('❌ Update error:', err);
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

  // Get all investments (flattened list for modal tables)
  protected getAllInvestments(): InvestmentEntry[] {
    return this.investments().sort((a, b) => {
      // Sort by type, then by year
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type);
      }
      return b.year - a.year; // Newest first
    });
  }

  // Get all investments grouped by type (for Total Gross modal)
  protected getAllInvestmentsGroupedByType(): InvestmentEntry[] {
    return this.investments().sort((a, b) => {
      // Primary sort: by type alphabetically
      const typeCompare = a.type.localeCompare(b.type);
      if (typeCompare !== 0) {
        return typeCompare;
      }
      // Secondary sort: by year (newest first within same type)
      return b.year - a.year;
    });
  }

  // Get consolidated investment breakdown by type (for Total Gross modal table)
  protected getConsolidatedInvestmentsByType(): Array<{
    type: InvestmentType;
    invested: number;
    interest: number;
    gross: number;
    count: number;
  }> {
    const breakdown = new Map<InvestmentType, { invested: number, interest: number, gross: number, count: number }>();
    
    this.investments().forEach(inv => {
      const existing = breakdown.get(inv.type) || { invested: 0, interest: 0, gross: 0, count: 0 };
      existing.invested += inv.invested_amount;
      existing.interest += inv.interest_earned || 0;
      existing.gross += inv.invested_amount + (inv.interest_earned || 0);
      existing.count += 1;
      breakdown.set(inv.type, existing);
    });

    let result = Array.from(breakdown.entries())
      .map(([type, data]) => ({ type, ...data }));

    // Apply sorting for multiple columns
    const sortDirGross = this.sortGrossByType();
    const sortDirType = this.sortGrossByTypeName();
    const sortDirInvested = this.sortGrossByInvested();
    const sortDirInterest = this.sortGrossByInterest();
    
    if (sortDirType === 'asc') {
      result.sort((a, b) => a.type.localeCompare(b.type));
    } else if (sortDirType === 'desc') {
      result.sort((a, b) => b.type.localeCompare(a.type));
    } else if (sortDirInvested === 'asc') {
      result.sort((a, b) => a.invested - b.invested);
    } else if (sortDirInvested === 'desc') {
      result.sort((a, b) => b.invested - a.invested);
    } else if (sortDirInterest === 'asc') {
      result.sort((a, b) => a.interest - b.interest);
    } else if (sortDirInterest === 'desc') {
      result.sort((a, b) => b.interest - a.interest);
    } else if (sortDirGross === 'asc') {
      result.sort((a, b) => a.gross - b.gross);
    } else if (sortDirGross === 'desc') {
      result.sort((a, b) => b.gross - a.gross);
    } else {
      result.sort((a, b) => a.type.localeCompare(b.type)); // Default: alphabetically by type
    }

    return result;
  }

  // Get interest breakdown by type (for Total Interest modal)
  protected getInterestByType(): Array<{
    type: InvestmentType;
    interest: number;
  }> {
    const breakdown = new Map<InvestmentType, number>();
    
    this.investments().forEach(inv => {
      const interest = inv.interest_earned || 0;
      if (interest > 0) {
        const existing = breakdown.get(inv.type) || 0;
        breakdown.set(inv.type, existing + interest);
      }
    });

    let result = Array.from(breakdown.entries())
      .map(([type, interest]) => ({ type, interest }));

    // Apply sorting for Interest Amount column or Type column
    const sortDirAmount = this.sortInterestByType();
    const sortDirType = this.sortInterestByTypeName();
    
    if (sortDirType === 'asc') {
      result.sort((a, b) => a.type.localeCompare(b.type));
    } else if (sortDirType === 'desc') {
      result.sort((a, b) => b.type.localeCompare(a.type));
    } else if (sortDirAmount === 'asc') {
      result.sort((a, b) => a.interest - b.interest);
    } else if (sortDirAmount === 'desc') {
      result.sort((a, b) => b.interest - a.interest);
    } else {
      result.sort((a, b) => b.interest - a.interest); // Default: highest first
    }

    return result;
  }

  // Get interest breakdown by year (for Total Interest modal)
  protected getInterestByYear(): Array<{
    year: number;
    interest: number;
  }> {
    const breakdown = new Map<number, number>();
    
    this.investments().forEach(inv => {
      const interest = inv.interest_earned || 0;
      if (interest > 0) {
        const existing = breakdown.get(inv.year) || 0;
        breakdown.set(inv.year, existing + interest);
      }
    });

    let result = Array.from(breakdown.entries())
      .map(([year, interest]) => ({ year, interest }));

    // Apply sorting for Interest Amount column or Year column
    const sortDirAmount = this.sortInterestByYear();
    const sortDirYear = this.sortInterestByYearValue();
    
    if (sortDirYear === 'asc') {
      result.sort((a, b) => a.year - b.year);
    } else if (sortDirYear === 'desc') {
      result.sort((a, b) => b.year - a.year);
    } else if (sortDirAmount === 'asc') {
      result.sort((a, b) => a.interest - b.interest);
    } else if (sortDirAmount === 'desc') {
      result.sort((a, b) => b.interest - a.interest);
    } else {
      result.sort((a, b) => b.year - a.year); // Default: newest year first
    }

    return result;
  }

  // Get highest earning investment type
  protected getHighestEarningType(): string {
    const breakdown = this.investmentTypeBreakdown();
    if (breakdown.length === 0) return 'N/A';
    
    const highest = breakdown.reduce((max, item) => 
      item.interest > max.interest ? item : max
    );
    
    return `${this.getTypeIcon(highest.type)} ${highest.type}`;
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

  // Sorting toggle methods
  protected toggleSortInvestedByType(): void {
    const current = this.sortInvestedByType();
    this.sortInvestedByType.set(current === 'desc' ? 'asc' : 'desc');
  }

  protected toggleSortInvestedByTypeName(): void {
    const current = this.sortInvestedByTypeName();
    this.sortInvestedByTypeName.set(current === 'desc' ? 'asc' : 'desc');
  }

  protected toggleSortInvestedByYear(): void {
    const current = this.sortInvestedByYear();
    this.sortInvestedByYear.set(current === 'desc' ? 'asc' : 'desc');
  }

  protected toggleSortInvestedByYearValue(): void {
    const current = this.sortInvestedByYearValue();
    this.sortInvestedByYearValue.set(current === 'desc' ? 'asc' : 'desc');
  }

  protected toggleSortInterestByType(): void {
    const current = this.sortInterestByType();
    this.sortInterestByType.set(current === 'desc' ? 'asc' : 'desc');
  }

  protected toggleSortInterestByTypeName(): void {
    const current = this.sortInterestByTypeName();
    this.sortInterestByTypeName.set(current === 'desc' ? 'asc' : 'desc');
  }

  protected toggleSortInterestByYear(): void {
    const current = this.sortInterestByYear();
    this.sortInterestByYear.set(current === 'desc' ? 'asc' : 'desc');
  }

  protected toggleSortInterestByYearValue(): void {
    const current = this.sortInterestByYearValue();
    this.sortInterestByYearValue.set(current === 'desc' ? 'asc' : 'desc');
  }

  protected toggleSortGrossByType(): void {
    const current = this.sortGrossByType();
    this.sortGrossByType.set(current === 'desc' ? 'asc' : 'desc');
  }

  protected toggleSortGrossByTypeName(): void {
    const current = this.sortGrossByTypeName();
    this.sortGrossByTypeName.set(current === 'desc' ? 'asc' : 'desc');
  }

  protected toggleSortGrossByInvested(): void {
    const current = this.sortGrossByInvested();
    this.sortGrossByInvested.set(current === 'desc' ? 'asc' : 'desc');
  }

  protected toggleSortGrossByInterest(): void {
    const current = this.sortGrossByInterest();
    this.sortGrossByInterest.set(current === 'desc' ? 'asc' : 'desc');
  }
}
