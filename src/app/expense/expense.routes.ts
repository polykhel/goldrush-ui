import { Routes } from '@angular/router';
import { ExpenseListComponent } from './pages/expense-list/expense-list.component';
import { ExpenseFormComponent } from './pages/expense-form/expense-form.component';

export const EXPENSE_ROUTES: Routes = [
  {
    path: '',
    component: ExpenseListComponent,
  },
  {
    path: 'new',
    component: ExpenseFormComponent,
  },
  {
    path: ':id',
    component: ExpenseFormComponent,
  },
];
