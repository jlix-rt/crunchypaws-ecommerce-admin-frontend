import { Component, input, output, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { CategoryNode } from '../../../core/models/admin.models';

@Component({
  selector: 'app-category-tree-node',
  standalone: true,
  imports: [CommonModule, forwardRef(() => CategoryTreeNodeComponent)],
  templateUrl: './category-tree-node.component.html',
  styleUrl: './category-tree-node.component.scss',
})
export class CategoryTreeNodeComponent {
  readonly node = input.required<CategoryNode>();
  readonly editRequest = output<CategoryNode>();
  readonly deleteRequest = output<CategoryNode>();
  readonly addChildRequest = output<CategoryNode>();
  readonly toggleVisibleRequest = output<CategoryNode>();
  readonly toggleSelectedRequest = output<{ node: CategoryNode; selected: boolean }>();
  readonly selectedIds = input<Set<string>>(new Set());

  isSelected(): boolean {
    return this.selectedIds().has(this.node().id);
  }
}
