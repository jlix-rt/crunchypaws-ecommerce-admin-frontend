import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { AuthUser } from '../models/admin.models';

const TOKEN_KEY = 'cp_admin_token';
const USER_KEY = 'cp_admin_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private api(path: string): string {
    const base = environment.apiUrl.replace(/\/$/, '');
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
  }

  login(email: string, password: string): Observable<{ token: string; user: AuthUser }> {
    return this.http
      .post<{ token: string; user: AuthUser }>(this.api('/auth/login'), { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.token);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    void this.router.navigateByUrl('/login');
  }

  getToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  getUser(): AuthUser | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null') as AuthUser | null;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasAnyRole(...roles: string[]): boolean {
    const r = this.getUser()?.role;
    return r != null && roles.includes(r);
  }
}
