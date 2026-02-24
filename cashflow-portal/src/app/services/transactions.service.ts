import { Injectable } from '@angular/core';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private transactions: Transaction[] = [];

  constructor() { }

  getAllTransactions(): Transaction[] {
    return this.transactions;
  }

  addTransaction(transaction: Transaction): void {
    this.transactions.push(transaction);
  }

  deleteTransaction(id: number): void {
    this.transactions = this.transactions.filter(transaction => transaction.id !== id);
  }

  filterTransactions(type: 'income' | 'expense'): Transaction[] {
    return this.transactions.filter(transaction => transaction.type === type);
  }
}