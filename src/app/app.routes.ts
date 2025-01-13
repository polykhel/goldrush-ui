import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PaymentSchedulerComponent } from './components/payment-scheduler/payment-scheduler.component';

export const routes: Routes = [
  {
    path: '', redirectTo: 'home', pathMatch: 'full'
  },
  {
    path: 'home', component: HomeComponent
  },
  {
    path: 'payment-scheduler', component: PaymentSchedulerComponent
  }
];
