import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { QuotationListComponent } from './pages/quotation-list/quotation-list.component';
import { QuotationGeneratorComponent } from './pages/quotation-generator/quotation-generator.component';

export const QUOTATION_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: QuotationListComponent,
      },
      {
        path: 'new',
        component: QuotationGeneratorComponent,
      },
      {
        path: ':id',
        component: QuotationGeneratorComponent,
      },
    ],
  },
];