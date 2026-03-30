import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-image-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-image-manager.component.html',
  styleUrl: './product-image-manager.component.scss',
})
export class ProductImageManagerComponent {
  private readonly productService = inject(ProductService);

  readonly productId = input.required<string>();
  readonly images = input.required<{ id: string; imageUrl: string }[]>();
  readonly imagesChanged = output<void>();

  err = signal<string | null>(null);
  uploadPreview = signal<string | null>(null);
  private uploadFile: File | null = null;

  onUploadPick(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file?.type.startsWith('image/')) {
      this.err.set('Selecciona una imagen válida.');
      return;
    }
    this.err.set(null);
    this.uploadFile = file;
    const r = new FileReader();
    r.onload = () => this.uploadPreview.set(r.result as string);
    r.readAsDataURL(file);
  }

  submitUpload(): void {
    const f = this.uploadFile;
    if (!f) {
      this.err.set('Elige un archivo.');
      return;
    }
    this.productService.uploadImage(this.productId(), f).subscribe({
      next: () => {
        this.uploadFile = null;
        this.uploadPreview.set(null);
        this.imagesChanged.emit();
      },
      error: (e) => this.err.set(e.error?.error ?? 'Error al subir'),
    });
  }

  onReplacePick(imageId: string, ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file?.type.startsWith('image/')) return;
    this.err.set(null);
    this.productService.replaceImage(this.productId(), imageId, file).subscribe({
      next: () => this.imagesChanged.emit(),
      error: (e) => this.err.set(e.error?.error ?? 'Error al reemplazar'),
    });
  }

  deleteImage(imageId: string): void {
    if (!confirm('¿Quitar esta imagen?')) return;
    this.productService.deleteImage(this.productId(), imageId).subscribe({
      next: () => this.imagesChanged.emit(),
      error: (e) => this.err.set(e.error?.error ?? 'Error'),
    });
  }

  cancelUploadPreview(): void {
    this.uploadFile = null;
    this.uploadPreview.set(null);
  }
}
