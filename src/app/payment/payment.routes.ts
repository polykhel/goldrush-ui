import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { PaymentSchedulerComponent } from './pages/payment-scheduler/payment-scheduler.component';

export const PAYMENT_ROUTES: Routes = [
  {
    path: '',
    component: PaymentSchedulerComponent,
    canActivate: [AuthGuard],
  },
];