import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { CategoryNode } from '../models/admin.models';

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);

  private api(path: string): string {
    const base = environment.apiUrl.replace(/\/$/, '');
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
  }

  getTree(): Observable<CategoryNode[]> {
    return this.http.get<CategoryNode[]>(this.api('/categories/tree'));
  }

  create(body: { name: string; parentId?: string | null; description?: string }): Observable<CategoryDto> {
    return this.http.post<CategoryDto>(this.api('/categories'), body);
  }

  update(
    id: string,
    body: Partial<{ name: string; description: string | null; parentId: string | null; isVisible: boolean }>,
  ): Observable<CategoryDto> {
    return this.http.patch<CategoryDto>(this.api(`/categories/${id}`), body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.api(`/categories/${id}`));
  }
}
