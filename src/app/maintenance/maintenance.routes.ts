import { Routes } from '@angular/router';
import { CountriesComponent } from './countries/countries.component';
import { ProvidersComponent } from './providers/providers.component';

export const MAINTENANCE_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'countries',
        component: CountriesComponent
      },
      {
        path: 'providers',
        component: ProvidersComponent
      }
    ]
  }
];
