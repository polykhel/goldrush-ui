import { Routes } from '@angular/router';
import { BookingListComponent } from './pages/booking-list/booking-list.component';
import { BookingFormComponent } from './pages/booking-form/booking-form.component';
import { CanDeactivateGuard } from '../core/guards/can-deactivate.guard';

export const BOOKING_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: BookingListComponent,
      },
      {
        path: 'new',
        component: BookingFormComponent,
        canDeactivate: [CanDeactivateGuard]
      },
      {
        path: ':id',
        component: BookingFormComponent,
        canDeactivate: [CanDeactivateGuard]
      },
    ],
  },
]; 