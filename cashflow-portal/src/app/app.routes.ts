import { Routes } from '@angular/router';
import { HomePage } from './component/home/home.page';
import { IncomePage } from './component/income/income.page';
import { ExpensePage } from './component/expense/expense.page';
import { CategoryPage } from './component/category/category.page';
import { InvestmentPage } from './component/investment/investment.page';
import { DebtsPage } from './component/debts/debts.page';
import { ReportPage } from './component/Report/report.page';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		component: HomePage
	},
	{
		path: 'income',
		component: IncomePage
	},
	{
		path: 'expense',
		component: ExpensePage
	},
	{
		path: 'category',
		component: CategoryPage
	},
	{
		path: 'investment',
		component: InvestmentPage
	},
	{
		path: 'debts',
		component: DebtsPage
	},
	{
		path: 'report',
		component: ReportPage
	},
	{
		path: '**',
		redirectTo: ''
	}
];
