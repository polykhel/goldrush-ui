import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { ListToJsonComponent } from './pages/list-to-json/list-to-json.component';

export const TOOLS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'list-to-json',
        component: ListToJsonComponent,
      },
    ],
  },
];