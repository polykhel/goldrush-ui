import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { InquiryListComponent } from './pages/inquiry-list/inquiry-list.component';
import { InquiryFormComponent } from './pages/inquiry-form/inquiry-form.component';

export const INQUIRY_ROUTES: Routes = [
  {
    path: '',
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
];