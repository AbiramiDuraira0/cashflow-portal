export interface Transaction {
    id: number;
    type: 'income' | 'expense';
    amount: number;
    date: Date;
    description: string;
}