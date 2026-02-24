export class ExpensesComponent {
  expenses: any[] = []; // Array to hold expense entries

  constructor() {
    // Initialize the component
  }

  addExpense(expense: any) {
    // Method to add a new expense
    this.expenses.push(expense);
  }

  removeExpense(expenseId: number) {
    // Method to remove an expense by its ID
    this.expenses = this.expenses.filter(expense => expense.id !== expenseId);
  }

  getExpenses() {
    // Method to retrieve all expenses
    return this.expenses;
  }
}