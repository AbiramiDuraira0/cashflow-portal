import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LifelineService, LifelineEntry } from '../../services/lifeline.service';

@Component({
  selector: 'app-lifeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lifeline.page.html',
  styleUrls: ['./lifeline.page.scss']
})
export class LifelinePage implements OnInit {
  private lifelineService = inject(LifelineService);
  
  // State signals
  protected lifelineEntries = this.lifelineService.getEntriesSignal();
  protected showAddForm = signal(false);
  protected showDeleteConfirm = signal(false);
  protected editingEntry = signal<LifelineEntry | null>(null);
  protected deletingEntry = signal<LifelineEntry | null>(null);
  protected isLoading = signal(false);
  
  // Toast notification state
  protected showToast = signal(false);
  protected toastMessage = signal('');
  protected toastType = signal<'success' | 'error' | 'info'>('success');
  
  // Form fields
  protected entryDate = signal<string>('');
  protected amount = signal<number>(0);
  protected notes = signal<string>('');

  // Computed values
  protected totalAmount = computed(() => {
    return this.lifelineEntries().reduce((sum, entry) => sum + entry.amount, 0);
  });

  protected entriesCount = computed(() => {
    return this.lifelineEntries().length;
  });

  protected sortedEntries = computed(() => {
    return [...this.lifelineEntries()].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    try {
      await this.lifelineService.loadLifelineData();
    } catch (error) {
      this.showToastMessage('Failed to load data', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Form Methods
  openAddForm(): void {
    this.resetForm();
    this.editingEntry.set(null);
    this.showAddForm.set(true);
  }

  closeAddForm(): void {
    this.showAddForm.set(false);
    this.resetForm();
    this.editingEntry.set(null);
  }

  resetForm(): void {
    const today = new Date().toISOString().split('T')[0];
    this.entryDate.set(today);
    this.amount.set(0);
    this.notes.set('');
  }

  // Edit Methods
  editEntry(entry: LifelineEntry): void {
    this.editingEntry.set(entry);
    this.entryDate.set(entry.date);
    this.amount.set(entry.amount);
    this.notes.set(entry.notes || '');
    this.showAddForm.set(true);
  }

  // Delete Methods
  confirmDelete(entry: LifelineEntry): void {
    this.deletingEntry.set(entry);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.deletingEntry.set(null);
    this.showDeleteConfirm.set(false);
  }

  async deleteEntry(): Promise<void> {
    const entry = this.deletingEntry();
    if (!entry) return;

    this.isLoading.set(true);
    try {
      await this.lifelineService.deleteEntry(entry.id);
      this.showToastMessage('Entry deleted successfully', 'success');
      this.cancelDelete();
    } catch (error) {
      this.showToastMessage('Failed to delete entry', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Save Methods
  async saveEntry(): Promise<void> {
    const date = this.entryDate();
    const amount = this.amount();
    const notes = this.notes();

    // Validation
    if (!date) {
      this.showToastMessage('Please select a date', 'error');
      return;
    }
    if (amount <= 0) {
      this.showToastMessage('Please enter a valid amount', 'error');
      return;
    }

    this.isLoading.set(true);
    const editing = this.editingEntry();

    try {
      if (editing) {
        // Update existing entry
        await this.lifelineService.updateEntry(editing.id, {
          date,
          amount,
          notes: notes || undefined
        });
        this.showToastMessage('Entry updated successfully', 'success');
      } else {
        // Add new entry
        await this.lifelineService.addEntry({
          date,
          amount,
          notes: notes || undefined
        });
        this.showToastMessage('Entry added successfully', 'success');
      }
      this.closeAddForm();
    } catch (error) {
      this.showToastMessage(editing ? 'Failed to update entry' : 'Failed to add entry', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Utility Methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  // Toast Methods
  showToastMessage(message: string, type: 'success' | 'error' | 'info'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    
    setTimeout(() => {
      this.showToast.set(false);
    }, 3000);
  }

  closeToast(): void {
    this.showToast.set(false);
  }

  // Refresh data
  async refreshData(): Promise<void> {
    await this.loadData();
    this.showToastMessage('Data refreshed', 'info');
  }
}
