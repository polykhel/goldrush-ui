import { Routes } from '@angular/router';
import { CountriesComponent } from './countries/countries.component';

export const MAINTENANCE_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'countries',
        component: CountriesComponent
      }
    ]
  }
];
