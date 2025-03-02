import { Routes } from '@angular/router';
import { ListToJsonComponent } from './pages/list-to-json/list-to-json.component';

export const TOOLS_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'list-to-json',
        component: ListToJsonComponent,
      },
    ],
  },
];
