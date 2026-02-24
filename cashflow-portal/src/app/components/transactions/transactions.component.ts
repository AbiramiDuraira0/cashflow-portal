import { Component, OnInit } from '@angular/core';
import { TransactionsService } from '../../services/transactions.service';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  filterType: string = 'all';

  constructor(private transactionsService: TransactionsService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.transactionsService.getAllTransactions().subscribe((data: Transaction[]) => {
      this.transactions = data;
      this.applyFilter();
    });
  }

  applyFilter(): void {
    if (this.filterType === 'income') {
      this.filteredTransactions = this.transactions.filter(t => t.type === 'income');
    } else if (this.filterType === 'expense') {
      this.filteredTransactions = this.transactions.filter(t => t.type === 'expense');
    } else {
      this.filteredTransactions = this.transactions;
    }
  }

  onFilterChange(type: string): void {
    this.filterType = type;
    this.applyFilter();
  }
}