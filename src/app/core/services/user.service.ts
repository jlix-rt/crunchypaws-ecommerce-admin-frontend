import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { StaffRole, UserListItem } from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  private api(path: string): string {
    const base = environment.apiUrl.replace(/\/$/, '');
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
  }

  list(): Observable<UserListItem[]> {
    return this.http.get<UserListItem[]>(this.api('/users'));
  }

  create(body: {
    email: string;
    password: string;
    fullName: string;
    role: StaffRole | 'CUSTOMER';
  }): Observable<UserListItem> {
    return this.http.post<UserListItem>(this.api('/users'), body);
  }

  updateRole(userId: string, role: StaffRole | 'CUSTOMER'): Observable<UserListItem> {
    return this.http.patch<UserListItem>(this.api(`/users/${userId}/role`), { role });
  }

  updateDetails(
    userId: string,
    input: {
      alias?: string | null;
      free_shipping?: boolean | null;
    },
  ): Observable<UserListItem> {
    return this.http.patch<UserListItem>(this.api(`/users/${userId}`), input);
  }
}
