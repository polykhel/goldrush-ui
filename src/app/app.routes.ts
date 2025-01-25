import { Routes } from '@angular/router';
import { HomeComponent } from '@components/home/home.component';
import { InquiryFormComponent } from '@components/inquiry-form/inquiry-form.component';
import { PaymentSchedulerComponent } from '@components/payment-scheduler/payment-scheduler.component';
import { QuotationGeneratorComponent } from '@components/quotation-generator/quotation-generator.component';
import { ListToJsonComponent } from '@components/tools/list-to-json/list-to-json.component';
import { AuthCallbackComponent } from '@core/auth/auth-callback.component';
import { AuthGuard } from '@core/auth/auth.guard';
import { InquiryListComponent } from '@components/inquiry-list/inquiry-list.component';

export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'inquiries',
    component: InquiryListComponent,
  },
  {
    path: 'inquiries/new',
    component: InquiryFormComponent,
  },
  {
    path: 'inquiries/:id',
    component: InquiryFormComponent,
  },
  {
    path: 'payment-scheduler',
    component: PaymentSchedulerComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'quotation-generator',
    component: QuotationGeneratorComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'tools/list-to-json',
    component: ListToJsonComponent,
  },
  {
    path: 'auth/callback/google',
    component: AuthCallbackComponent,
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
