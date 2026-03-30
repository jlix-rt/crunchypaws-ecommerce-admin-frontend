import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

const staffRoles = ['ADMIN', 'SELLER', 'COLLABORATOR'];
const orderStaffRoles = ['ADMIN', 'SELLER'];

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'admin' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./pages/users/users.component').then((m) => m.UsersComponent),
      },
      {
        path: 'categories',
        canActivate: [roleGuard],
        data: { roles: staffRoles },
        loadComponent: () =>
          import('./pages/categories/categories.component').then((m) => m.CategoriesComponent),
      },
      {
        path: 'products',
        canActivate: [roleGuard],
        data: { roles: staffRoles },
        loadComponent: () =>
          import('./pages/products/products.component').then((m) => m.ProductsComponent),
      },
      {
        path: 'direcciones-gt',
        canActivate: [roleGuard],
        data: { roles: staffRoles },
        loadComponent: () =>
          import('./pages/direcciones-mantenimiento/direcciones-mantenimiento.component').then(
            (m) => m.DireccionesMantenimientoComponent,
          ),
      },
      {
        path: 'mantenimiento/pedidos',
        canActivate: [roleGuard],
        data: { roles: orderStaffRoles },
        loadComponent: () =>
          import('./pages/pedidos-admin/pedidos-admin.component').then((m) => m.PedidosAdminComponent),
      },
      {
        path: 'mantenimiento/pedidos/estados',
        canActivate: [roleGuard],
        data: { roles: orderStaffRoles },
        loadComponent: () =>
          import('./pages/pedidos-estados-admin/pedidos-estados-admin.component').then(
            (m) => m.PedidosEstadosAdminComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'admin' },
];
