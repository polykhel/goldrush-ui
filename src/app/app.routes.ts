import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { InquiryFormComponent } from './features/inquiry/pages/inquiry-form/inquiry-form.component';
import { PaymentSchedulerComponent } from './features/payment/payment-scheduler/payment-scheduler.component';
import { QuotationGeneratorComponent } from './features/quotation/pages/quotation-generator/quotation-generator.component';
import { ListToJsonComponent } from './features/tools/pages/list-to-json/list-to-json.component';
import { AuthCallbackComponent } from '@core/auth/auth-callback.component';
import { AuthGuard } from '@core/guards/auth.guard';
import { InquiryListComponent } from './features/inquiry/pages/inquiry-list/inquiry-list.component';

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
    path: 'quotation',
    component: QuotationGeneratorComponent,
    canActivate: [AuthGuard],
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
