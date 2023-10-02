import { Routes } from '@angular/router';
import { NoPageComponent } from './components/no-page/no-page.component';
import { userIsLogged, userLogged } from './users/services/users.service';
import { loggedMatchGuard } from './guards/logged-match.guard';

const getContact = (param:number): string => {
  const data = [
    'SYSTEM_ADMIN',
    'CLIENT_ADMIN',
    'CLIENT_EDITOR'
  ]
  return data[param];
}

export const appRoutes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./components/home/home.component').then((mod) => mod.HomeComponent),
  },
  {
    path:'whatsapp',
    loadChildren: () => import('./wapp/wapp.routes').then( mod => mod.WAPP_ROUTES)
  },
  {
    path: 'users',
    canMatch: [
      //() => userLogged().emailvalidated,
      //() => userIsLogged(),
    ],
    loadChildren: () => import('./users/users.routes')
                        .then(mod => mod.USERS_ROUTES)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    component: NoPageComponent,
  },
];
