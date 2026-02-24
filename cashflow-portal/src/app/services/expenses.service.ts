import { Injectable } from '@angular/core';
import { Expense } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {
  private expenses: Expense[] = [];

  constructor() { }

  getExpenses(): Expense[] {
    return this.expenses;
  }

  addExpense(expense: Expense): void {
    this.expenses.push(expense);
  }

  deleteExpense(id: number): void {
    this.expenses = this.expenses.filter(expense => expense.id !== id);
  }
}