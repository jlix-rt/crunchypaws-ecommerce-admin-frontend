import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DireccionesTiendasGtAdminService,
  type DepartamentoGt,
  type MunicipioGt,
  type ZonaGt,
} from '../../core/services/direcciones-tiendasgt-admin.service';

@Component({
  selector: 'app-direcciones-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './direcciones-mantenimiento.component.html',
  styleUrl: './direcciones-mantenimiento.component.scss',
})
export class DireccionesMantenimientoComponent implements OnInit {
  readonly dir = inject(DireccionesTiendasGtAdminService);

  err = signal<string | null>(null);
  busy = signal(false);

  departamentos = signal<DepartamentoGt[]>([]);
  municipios = signal<MunicipioGt[]>([]);
  zonas = signal<ZonaGt[]>([]);

  depId = '';
  munId = '';

  nuevaZonaNombre = '';
  nuevaZonaCosto: number | null = null;
  nuevaZonaDisponible = true;

  editZona: ZonaGt | null = null;
  editZonaNombre = '';
  editZonaCosto: number | null = null;
  editZonaDisponible = true;

  ngOnInit(): void {
    if (!this.dir.configured) {
      this.err.set('Configura `direccionesApiUrl` en environment (API tiendasgt-direcciones).');
      return;
    }
    this.dir.getDepartamentos().subscribe({
      next: (d) => this.departamentos.set(d),
      error: () => this.err.set('No se pudieron cargar departamentos.'),
    });
  }

  onDepChange(): void {
    this.municipios.set([]);
    this.zonas.set([]);
    this.munId = '';
    this.err.set(null);
    if (!this.depId) return;
    this.dir.getMunicipios(this.depId).subscribe({
      next: (m) => this.municipios.set(m),
      error: () => this.err.set('No se pudieron cargar municipios.'),
    });
  }

  onMunChange(): void {
    this.zonas.set([]);
    this.err.set(null);
    if (!this.munId) return;
    this.loadZonas();
  }

  loadZonas(): void {
    if (!this.munId) return;
    this.dir.getZonas(this.munId).subscribe({
      next: (z) => this.zonas.set(z),
      error: () => this.err.set('No se pudieron cargar zonas.'),
    });
  }

  crearZona(): void {
    const n = this.nuevaZonaNombre.trim();
    if (!this.munId || !n) {
      this.err.set('Elige municipio y escribe nombre de zona.');
      return;
    }
    this.busy.set(true);
    this.err.set(null);
    this.dir
      .createZona({
        municipioId: this.munId,
        nombre: n,
        costo_envio: this.nuevaZonaCosto,
        disponible_entrega: this.nuevaZonaDisponible,
      })
      .subscribe({
        next: () => {
          this.nuevaZonaNombre = '';
          this.nuevaZonaCosto = null;
          this.nuevaZonaDisponible = true;
          this.busy.set(false);
          this.loadZonas();
        },
        error: (e) => {
          this.busy.set(false);
          this.err.set(e.error?.error ?? e.error?.message ?? 'Error al crear zona');
        },
      });
  }

  openEditZona(z: ZonaGt): void {
    this.editZona = z;
    this.editZonaNombre = z.nombre;
    this.editZonaCosto = z.costo_envio;
    this.editZonaDisponible = z.disponible_entrega;
  }

  guardarZona(): void {
    if (!this.editZona) return;
    const zonaId = this.editZona.id;
    const n = this.editZonaNombre.trim();
    if (!n) return;
    this.busy.set(true);
    this.err.set(null);
    this.dir
      .patchZona(zonaId, {
        nombre: n,
        costo_envio: this.editZonaCosto,
        disponible_entrega: this.editZonaDisponible,
      })
      .subscribe({
        next: () => {
          this.editZona = null;
          this.busy.set(false);
          this.loadZonas();
        },
        error: (e) => {
          this.busy.set(false);
          this.err.set(e.error?.error ?? e.error?.message ?? 'Error al actualizar zona');
        },
      });
  }

  eliminarZona(z: ZonaGt): void {
    if (!confirm(`¿Eliminar zona "${z.nombre}"? (Se eliminan también colonias asociadas en el catálogo si existen.)`)) return;
    this.busy.set(true);
    this.err.set(null);
    this.dir.deleteZona(z.id).subscribe({
      next: () => {
        this.busy.set(false);
        this.loadZonas();
      },
      error: (e) => {
        this.busy.set(false);
        this.err.set(e.error?.error ?? e.error?.message ?? 'Error al eliminar zona');
      },
    });
  }
}
