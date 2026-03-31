import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import type { CategoryNode, ProductListItem } from '../../core/models/admin.models';
import { ProductImageManagerComponent } from './product-image-manager/product-image-manager.component';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

type BulkDeleteResult = { id: string; ok: true } | { id: string; ok: false; error: unknown };

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductImageManagerComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);

  products = signal<ProductListItem[]>([]);
  tree = signal<CategoryNode[]>([]);
  err = signal<string | null>(null);
  expandedId = signal<string | null>(null);
  selectedIds = signal<Set<string>>(new Set());
  deletingSelected = signal(false);

  newName = '';
  newDesc = '';
  newPrice = '';
  newStock = '';
  newCategoryId = '';
  newSku = '';
  newIsVisible = true;
  newTracksStock = true;
  newIsPopular = false;

  editId: string | null = null;
  editName = '';
  editDesc = '';
  editPrice = '';
  editStock = '';
  editCategoryId = '';
  editSku = '';
  editIsVisible = true;
  editTracksStock = true;
  editIsPopular = false;

  ngOnInit(): void {
    this.loadProducts();
    this.categoryService.getTree().subscribe({
      next: (t) => this.tree.set(t),
      error: () => {},
    });
  }

  loadProducts(): void {
    this.productService.list().subscribe({
      next: (p) => this.products.set(p),
      error: () => this.err.set('Error al cargar productos.'),
    });
  }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  toggleSelected(id: string, checked: boolean): void {
    const next = new Set(this.selectedIds());
    if (checked) next.add(id);
    else next.delete(id);
    this.selectedIds.set(next);
  }

  allSelected(): boolean {
    const ids = this.products().map((p) => p.id);
    return ids.length > 0 && ids.every((id) => this.selectedIds().has(id));
  }

  toggleSelectAll(checked: boolean): void {
    if (!checked) {
      this.selectedIds.set(new Set());
      return;
    }
    this.selectedIds.set(new Set(this.products().map((p) => p.id)));
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  deleteSelected(): void {
    const ids = Array.from(this.selectedIds());
    if (ids.length === 0) return;
    if (!confirm(`¿Eliminar ${ids.length} producto(s) seleccionados?`)) return;

    this.err.set(null);
    this.deletingSelected.set(true);

    forkJoin(
      ids.map((id) =>
        this.productService.delete(id).pipe(
          // delete devuelve void → lo convertimos a un resultado tipado
          catchError((e) => of({ id, ok: false, error: e } satisfies BulkDeleteResult)),
        ),
      ),
    ).subscribe({
      next: (results) => {
        const normalized: BulkDeleteResult[] = results.map((r, idx) =>
          r == null ? ({ id: ids[idx]!, ok: true } as const) : (r as BulkDeleteResult),
        );
        const failed = normalized.filter((r) => r.ok === false);
        if (failed.length) {
          const first: any = failed[0]?.error;
          const msg = first?.error?.error ?? 'Error eliminando algunos productos.';
          this.err.set(`${msg} (fallaron ${failed.length}/${ids.length})`);
        } else {
          this.err.set(null);
        }
        this.clearSelection();
        this.loadProducts();
        this.deletingSelected.set(false);
      },
      error: () => {
        this.err.set('Error eliminando productos.');
        this.deletingSelected.set(false);
      },
    });
  }

  flatCats(nodes: CategoryNode[], depth = 0): { id: string; label: string }[] {
    let o: { id: string; label: string }[] = [];
    for (const n of nodes) {
      o.push({ id: n.id, label: `${'—'.repeat(depth)} ${n.name}`.trim() });
      o = o.concat(this.flatCats(n.children, depth + 1));
    }
    return o;
  }

  create(): void {
    if (!this.newName.trim() || !this.newCategoryId) {
      this.err.set('Nombre y categoría son obligatorios.');
      return;
    }
    this.err.set(null);
    this.productService
      .create({
        name: this.newName.trim(),
        description: this.newDesc.trim() || '—',
        price: Number(this.newPrice) || 0,
        stock: Number(this.newStock) || 0,
        categoryId: this.newCategoryId,
        sku: this.newSku.trim() || null,
        isVisible: this.newIsVisible,
        tracksStock: this.newTracksStock,
        isPopular: this.newIsPopular,
      })
      .subscribe({
        next: () => {
          this.newName = '';
          this.newDesc = '';
          this.newPrice = '';
          this.newStock = '';
          this.newCategoryId = '';
          this.newSku = '';
          this.newIsVisible = true;
          this.newTracksStock = true;
          this.newIsPopular = false;
          this.loadProducts();
        },
        error: (e) => this.err.set(e.error?.error ?? 'Error'),
      });
  }

  startEdit(p: ProductListItem): void {
    this.editId = p.id;
    this.editName = p.name;
    this.editDesc = p.description;
    this.editPrice = String(p.price);
    this.editStock = String(p.stock);
    this.editCategoryId = p.categoryId;
    this.editSku = p.sku ?? '';
    this.editIsVisible = p.isVisible ?? true;
    this.editTracksStock = p.tracksStock !== false;
    this.editIsPopular = p.isPopular === true;
  }

  saveEdit(): void {
    if (!this.editId) return;
    this.productService
      .update(this.editId, {
        name: this.editName.trim(),
        description: this.editDesc,
        price: Number(this.editPrice),
        stock: Number(this.editStock),
        categoryId: this.editCategoryId,
        sku: this.editSku.trim() || null,
        isVisible: this.editIsVisible,
        tracksStock: this.editTracksStock,
        isPopular: this.editIsPopular,
      })
      .subscribe({
        next: () => {
          this.editId = null;
          this.loadProducts();
        },
        error: (e) => this.err.set(e.error?.error ?? 'Error'),
      });
  }

  toggleVisible(p: ProductListItem): void {
    this.productService.update(p.id, { isVisible: !p.isVisible }).subscribe({
      next: () => this.loadProducts(),
      error: (e) => this.err.set(e.error?.error ?? 'Error'),
    });
  }

  toggleTracksStock(p: ProductListItem): void {
    const current = p.tracksStock !== false;
    this.productService.update(p.id, { tracksStock: !current }).subscribe({
      next: () => this.loadProducts(),
      error: (e) => this.err.set(e.error?.error ?? 'Error'),
    });
  }

  togglePopular(p: ProductListItem): void {
    this.productService.update(p.id, { isPopular: !p.isPopular }).subscribe({
      next: () => this.loadProducts(),
      error: (e) => this.err.set(e.error?.error ?? 'Error'),
    });
  }

  remove(id: string): void {
    if (!confirm('¿Eliminar producto?')) return;
    this.productService.delete(id).subscribe({
      next: () => this.loadProducts(),
      error: (e) => this.err.set(e.error?.error ?? 'Error'),
    });
  }

  toggleImages(id: string): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }
}
