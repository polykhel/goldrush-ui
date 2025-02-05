import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { AuthCallbackComponent } from '@core/auth/auth-callback.component';
import { AuthGuard } from '@core/guards/auth.guard';
import { InquiryListComponent } from './features/inquiry/inquiry-list/inquiry-list.component';
import { InquiryFormComponent } from './features/inquiry/inquiry-form/inquiry-form.component';
import { QuotationListComponent } from './features/quotation/quotation-list/quotation-list.component';
import { QuotationGeneratorComponent } from './features/quotation/quotation-generator/quotation-generator.component';
import { PaymentSchedulerComponent } from './features/payment/payment-scheduler/payment-scheduler.component';
import { ListToJsonComponent } from './features/tools/list-to-json/list-to-json.component';

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
        path: 'callback/google',
        component: AuthCallbackComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
