import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ProductListItem } from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  private api(path: string): string {
    const base = environment.apiUrl.replace(/\/$/, '');
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
  }

  list(): Observable<ProductListItem[]> {
    return this.http.get<ProductListItem[]>(this.api('/products'));
  }

  create(body: {
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
    sku?: string | null;
    isVisible?: boolean;
    tracksStock?: boolean;
    isPopular?: boolean;
  }): Observable<ProductListItem> {
    return this.http.post<ProductListItem>(this.api('/products'), body);
  }

  update(
    id: string,
    body: Partial<{
      name: string;
      description: string;
      price: number;
      stock: number;
      categoryId: string;
      sku: string | null;
      imageUrl: string | null;
      isVisible: boolean;
      tracksStock?: boolean;
      isPopular?: boolean;
    }>,
  ): Observable<ProductListItem> {
    return this.http.patch<ProductListItem>(this.api(`/products/${id}`), body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.api(`/products/${id}`));
  }

  uploadImage(productId: string, file: File): Observable<{ id: string; imageUrl: string }> {
    const fd = new FormData();
    fd.append('image', file);
    return this.http.post<{ id: string; imageUrl: string }>(
      this.api(`/products/${productId}/images`),
      fd,
    );
  }

  replaceImage(
    productId: string,
    imageId: string,
    file: File,
  ): Observable<{ id: string; imageUrl: string }> {
    const fd = new FormData();
    fd.append('image', file);
    return this.http.patch<{ id: string; imageUrl: string }>(
      this.api(`/products/${productId}/images/${imageId}`),
      fd,
    );
  }

  deleteImage(productId: string, imageId: string): Observable<void> {
    return this.http.delete<void>(this.api(`/products/${productId}/images/${imageId}`));
  }
}
