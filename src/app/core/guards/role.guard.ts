import { inject } from '@angular/core';
import { Router, type CanActivateFn, type ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

function snapshotRoles(route: ActivatedRouteSnapshot): string[] {
  const data = route.data['roles'] as string[] | undefined;
  if (data?.length) return data;
  let p = route.parent;
  while (p) {
    const d = p.data['roles'] as string[] | undefined;
    if (d?.length) return d;
    p = p.parent;
  }
  return [];
}

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowed = snapshotRoles(route);
  if (!allowed.length) {
    return true;
  }
  const role = auth.getUser()?.role;
  if (role && allowed.includes(role)) {
    return true;
  }
  return router.createUrlTree(['/admin/dashboard']);
};
