import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import type { CategoryNode } from '../../core/models/admin.models';
import { CategoryTreeNodeComponent } from './category-tree-node/category-tree-node.component';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

type BulkDeleteResult = { id: string; ok: true } | { id: string; ok: false; error: unknown };

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, CategoryTreeNodeComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);

  tree = signal<CategoryNode[]>([]);
  err = signal<string | null>(null);
  selectedIds = signal<Set<string>>(new Set());
  deletingSelected = signal(false);
  rootName = '';
  childName = '';
  childParentId: string | null = null;
  editId: string | null = null;
  editName = '';
  editDesc = '';
  showChildForm = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.err.set(null);
    this.categoryService.getTree().subscribe({
      next: (t) => this.tree.set(t),
      error: () => this.err.set('Error al cargar categorías.'),
    });
  }

  createRoot(): void {
    const n = this.rootName.trim();
    if (!n) return;
    this.categoryService.create({ name: n }).subscribe({
      next: () => {
        this.rootName = '';
        this.load();
      },
      error: (e) => this.err.set(e.error?.error ?? 'Error'),
    });
  }

  createChild(): void {
    const name = this.childName.trim();
    const pid = this.childParentId;
    if (!name || !pid) {
      this.err.set('Elige padre y escribe nombre.');
      return;
    }
    this.categoryService.create({ name, parentId: pid }).subscribe({
      next: () => {
        this.childName = '';
        this.childParentId = null;
        this.showChildForm.set(false);
        this.load();
      },
      error: (e) => this.err.set(e.error?.error ?? 'Error'),
    });
  }

  onEdit(n: CategoryNode): void {
    this.editId = n.id;
    this.editName = n.name;
    this.editDesc = n.description ?? '';
  }

  saveEdit(): void {
    if (!this.editId) return;
    this.categoryService
      .update(this.editId, {
        name: this.editName.trim(),
        description: this.editDesc.trim() || null,
      })
      .subscribe({
        next: () => {
          this.editId = null;
          this.load();
        },
        error: (e) => this.err.set(e.error?.error ?? 'Error'),
      });
  }

  onDelete(n: CategoryNode): void {
    if (!confirm(`¿Eliminar «${n.name}»?`)) return;
    this.categoryService.delete(n.id).subscribe({
      next: () => this.load(),
      error: (e) => this.err.set(e.error?.error ?? 'Error'),
    });
  }

  onToggleSelected(e: { node: CategoryNode; selected: boolean }): void {
    const next = new Set(this.selectedIds());
    if (e.selected) next.add(e.node.id);
    else next.delete(e.node.id);
    this.selectedIds.set(next);
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  deleteSelected(): void {
    const ids = Array.from(this.selectedIds());
    if (ids.length === 0) return;
    if (!confirm(`¿Eliminar ${ids.length} categoría(s) seleccionadas?`)) return;

    this.err.set(null);
    this.deletingSelected.set(true);

    forkJoin(
      ids.map((id) =>
        this.categoryService.delete(id).pipe(
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
          const msg = first?.error?.error ?? 'Error eliminando algunas categorías.';
          this.err.set(`${msg} (fallaron ${failed.length}/${ids.length})`);
        } else {
          this.err.set(null);
        }
        this.clearSelection();
        this.load();
        this.deletingSelected.set(false);
      },
      error: () => {
        this.err.set('Error eliminando categorías.');
        this.deletingSelected.set(false);
      },
    });
  }

  onAddChild(n: CategoryNode): void {
    this.childParentId = n.id;
    this.childName = '';
    this.showChildForm.set(true);
    this.err.set(null);
  }

  onToggleVisible(n: CategoryNode): void {
    this.categoryService.update(n.id, { isVisible: !n.isVisible }).subscribe({
      next: () => this.load(),
      error: (e) => this.err.set(e.error?.error ?? 'Error'),
    });
  }

  flatParents(nodes: CategoryNode[], depth = 0): { id: string; label: string }[] {
    let o: { id: string; label: string }[] = [];
    for (const n of nodes) {
      o.push({ id: n.id, label: `${'—'.repeat(depth)} ${n.name}`.trim() });
      o = o.concat(this.flatParents(n.children, depth + 1));
    }
    return o;
  }
}
