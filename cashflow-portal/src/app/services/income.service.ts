export class IncomeService {
    private incomes: any[] = [];

    constructor() {}

    getIncomes() {
        return this.incomes;
    }

    addIncome(income: any) {
        this.incomes.push(income);
    }

    deleteIncome(incomeId: number) {
        this.incomes = this.incomes.filter(income => income.id !== incomeId);
    }
}