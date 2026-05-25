import { Routes } from '@angular/router';
import { LoginPage } from './component/login/login.page';
import { DashboardPage } from './component/dashboard/dashboard.page';
import { IncomePage } from './component/income/income.page';
import { ExpensePage } from './component/expense/expense.page';
import { CategoryPage } from './component/category/category.page';
import { InvestmentPage } from './component/investment/investment.page';
import { DebtsPage } from './component/debts/debts.page';
import { ReportPage } from './component/Report/report.page';
import { TaxPage } from './component/tax/tax.page';
import { LifelinePage } from './component/lifeline/lifeline.page';
import { HlaViewPage } from './component/hla-view/hla-view.page';
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
		component: DashboardPage,
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
		path: 'tax',
		component: TaxPage,
		canActivate: [authGuard]
	},
	{
		path: 'lifeline',
		component: LifelinePage,
		canActivate: [authGuard]
	},
	{
		path: 'hla-view',
		component: HlaViewPage,
		canActivate: [authGuard]
	},
	{
		path: '**',
		redirectTo: 'login'
	}
];
