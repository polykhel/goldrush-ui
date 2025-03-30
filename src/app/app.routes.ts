import { Routes } from '@angular/router';
import { authGuardFn } from '@auth0/auth0-angular';
import { HomeComponent } from './home/home.component';
import { ForbiddenComponent } from './pages/forbidden/forbidden.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'inquiries',
    canActivate: [authGuardFn],
    loadChildren: () =>
      import('./inquiry/inquiry.routes').then((m) => m.INQUIRY_ROUTES)
  },
  {
    path: 'bookings',
    canActivate: [authGuardFn],
    loadChildren: () =>
      import('./booking/booking.routes').then((m) => m.BOOKING_ROUTES)
  },
  {
    path: 'payments',
    canActivate: [authGuardFn],
    loadChildren: () =>
      import('./payment/payment.routes').then((m) => m.PAYMENT_ROUTES)
  },
  {
    path: 'reports',
    canActivate: [authGuardFn],
    loadChildren: () =>
      import('./reports/reports.routes').then((m) => m.REPORTS_ROUTES)
  },
  {
    path: 'tools',
    canActivate: [authGuardFn],
    loadChildren: () =>
      import('./tools/tools.routes').then((m) => m.TOOLS_ROUTES)
  },
  {
    path: 'maintenance',
    canActivate: [authGuardFn],
    loadChildren: () =>
      import('./maintenance/maintenance.routes').then((m) => m.MAINTENANCE_ROUTES)
  },
  {
    path: 'forbidden',
    component: ForbiddenComponent
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];
