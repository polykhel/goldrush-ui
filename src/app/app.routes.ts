import { Routes } from '@angular/router';
import { AuthCallbackComponent } from '@core/auth/auth-callback.component';
import { AuthGuard } from '@core/guards/auth.guard';
import { ForbiddenComponent } from '@shared/components/forbidden/forbidden.component';
import { HomeComponent } from './home/home.component';

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
    loadChildren: () =>
      import('./inquiry/inquiry.routes').then((m) => m.INQUIRY_ROUTES),
  },
  {
    path: 'quotations',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./quotation/quotation.routes').then((m) => m.QUOTATION_ROUTES),
  },
  {
    path: 'payments',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./payment/payment.routes').then((m) => m.PAYMENT_ROUTES),
  },
  {
    path: 'tools',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./tools/tools.routes').then((m) => m.TOOLS_ROUTES),
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
