import { Routes } from '@angular/router';
import { CategoryPage } from './feature/category/category.page';

export const routes: Routes = [
	{
		path: 'category',
		component: CategoryPage
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'category'
	},
	{
		path: '**',
		redirectTo: 'category'
	}
];
