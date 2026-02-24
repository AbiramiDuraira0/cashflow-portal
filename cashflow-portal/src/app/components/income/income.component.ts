import { Component } from '@angular/core';

@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.css']
})
export class IncomeComponent {
  incomeEntries: { id: number; source: string; amount: number; date: Date }[] = [];
  newIncomeSource: string = '';
  newIncomeAmount: number | null = null;

  addIncome() {
    if (this.newIncomeSource && this.newIncomeAmount) {
      const newEntry = {
        id: this.incomeEntries.length + 1,
        source: this.newIncomeSource,
        amount: this.newIncomeAmount,
        date: new Date()
      };
      this.incomeEntries.push(newEntry);
      this.newIncomeSource = '';
      this.newIncomeAmount = null;
    }
  }

  removeIncome(id: number) {
    this.incomeEntries = this.incomeEntries.filter(entry => entry.id !== id);
  }
}