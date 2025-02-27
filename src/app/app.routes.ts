import { Routes } from '@angular/router';
import { AuthCallbackComponent } from '@core/auth/auth-callback.component';
import { AuthGuard } from '@core/guards/auth.guard';
import { ForbiddenComponent } from '@shared/components/forbidden/forbidden.component';
import { HomeComponent } from './home/home.component';
import { InquiryListComponent } from './inquiry/pages/inquiry-list/inquiry-list.component';
import { InquiryFormComponent } from './inquiry/pages/inquiry-form/inquiry-form.component';
import { QuotationListComponent } from './quotation/pages/quotation-list/quotation-list.component';
import { QuotationGeneratorComponent } from './quotation/pages/quotation-generator/quotation-generator.component';
import { PaymentSchedulerComponent } from './payment/pages/payment-scheduler/payment-scheduler.component';
import { ListToJsonComponent } from './tools/pages/list-to-json/list-to-json.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'inquiries',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: InquiryListComponent,
      },
      {
        path: 'new',
        component: InquiryFormComponent,
      },
      {
        path: ':id',
        component: InquiryFormComponent,
      },
    ],
  },
  {
    path: 'quotations',
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
  {
    path: 'payments',
    component: PaymentSchedulerComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'tools',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'list-to-json',
        component: ListToJsonComponent,
      },
    ],
  },
  {
    path: 'auth',
    children: [
      {
        path: 'callback',
        component: AuthCallbackComponent,
      },
    ],
  },
  {
    path: 'forbidden',
    component: ForbiddenComponent,
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
