import { Routes } from '@angular/router';
import { ToDoListComponent } from './to-do-list/to-do-list.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'test',
    pathMatch: 'full',
  },
  {
    path: 'test',
    component: ToDoListComponent,
  },
];
