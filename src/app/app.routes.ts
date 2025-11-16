import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'auth' },
	{
		path: 'auth',
		loadComponent: () => import('./pages/auth/auth.component').then(m => m.AuthComponent)
	},
	{
		path: 'home',
		canActivate: [authGuard],
		loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
	},
	{
		path: 'statistics',
		canActivate: [authGuard],
		loadComponent: () => import('./pages/statistics/statistics.component').then(m => m.StatisticsComponent)
	},
	{
		path: 'quiz',
		canActivate: [authGuard],
		loadComponent: () => import('./pages/quiz/quiz.component').then(m => m.QuizComponent)
	},
	{
		path: 'results',
		canActivate: [authGuard],
		loadComponent: () => import('./pages/results/results.component').then(m => m.ResultsComponent)
	},
	{ path: '**', redirectTo: 'auth' }
];
