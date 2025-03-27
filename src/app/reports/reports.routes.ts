import { Routes } from '@angular/router';
import { CommissionReportComponent } from './pages/commission-report/commission-report.component';
import { PaymentMethodReportComponent } from './pages/payment-method-report/payment-method-report.component';
import { RevenueReportComponent } from './pages/revenue-report/revenue-report.component';
import { ServiceFeeReportComponent } from './pages/service-fee-report/service-fee-report.component';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'revenue',
        component: RevenueReportComponent,
      },
      {
        path: 'service-fees',
        component: ServiceFeeReportComponent,
      },
      {
        path: 'payment-methods',
        component: PaymentMethodReportComponent,
      },
      {
        path: 'commissions',
        component: CommissionReportComponent,
      },
    ],
  },
];
