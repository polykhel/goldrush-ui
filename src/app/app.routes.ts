import { Routes } from '@angular/router';
import { authGuardFn } from '@auth0/auth0-angular';
import { ForbiddenComponent } from '@shared/components/forbidden/forbidden.component';
import { HomeComponent } from './home/home.component';

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
    path: 'payments',
    canActivate: [authGuardFn],
    loadChildren: () =>
      import('./payment/payment.routes').then((m) => m.PAYMENT_ROUTES)
  },
  {
    path: 'tools',
    canActivate: [authGuardFn],
    loadChildren: () =>
      import('./tools/tools.routes').then((m) => m.TOOLS_ROUTES)
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
