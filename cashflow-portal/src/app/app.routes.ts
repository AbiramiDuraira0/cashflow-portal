import { Routes } from '@angular/router';
import { LoginPage } from './component/login/login.page';
import { HomePage } from './component/home/home.page';
import { IncomePage } from './component/income/income.page';
import { ExpensePage } from './component/expense/expense.page';
import { CategoryPage } from './component/category/category.page';
import { InvestmentPage } from './component/investment/investment.page';
import { DebtsPage } from './component/debts/debts.page';
import { ReportPage } from './component/Report/report.page';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
	{
		path: 'login',
		component: LoginPage
	},
	{
		path: '',
		redirectTo: 'login',
		pathMatch: 'full'
	},
	{
		path: 'dashboard',
		component: HomePage,
		canActivate: [authGuard]
	},
	{
		path: 'income',
		component: IncomePage,
		canActivate: [authGuard]
	},
	{
		path: 'expense',
		component: ExpensePage,
		canActivate: [authGuard]
	},
	{
		path: 'category',
		component: CategoryPage,
		canActivate: [authGuard]
	},
	{
		path: 'investment',
		component: InvestmentPage,
		canActivate: [authGuard]
	},
	{
		path: 'debts',
		component: DebtsPage,
		canActivate: [authGuard]
	},
	{
		path: 'report',
		component: ReportPage,
		canActivate: [authGuard]
	},
	{
		path: '**',
		redirectTo: 'login'
	}
];
