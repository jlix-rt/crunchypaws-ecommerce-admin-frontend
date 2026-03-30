import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DepartamentoGt {
  id: string;
  nombre: string;
}

export interface MunicipioGt {
  id: string;
  nombre: string;
  departamento_id: string;
}

export interface ZonaGt {
  id: string;
  nombre: string;
  municipio_id: string;
  costo_envio: number | null;
  disponible_entrega: boolean;
}

@Injectable({ providedIn: 'root' })
export class DireccionesTiendasGtAdminService {
  private readonly http = inject(HttpClient);

  get configured(): boolean {
    return !!environment.direccionesApiUrl?.trim();
  }

  private base(): string {
    return environment.direccionesApiUrl!.replace(/\/$/, '');
  }

  private adminHeaders(): HttpHeaders {
    const k = environment.direccionesAdminKey?.trim();
    if (k) return new HttpHeaders({ 'x-admin-key': k });
    return new HttpHeaders();
  }

  getDepartamentos(): Observable<DepartamentoGt[]> {
    return this.http.get<DepartamentoGt[]>(`${this.base()}/departamentos`);
  }

  getMunicipios(departamentoId: string): Observable<MunicipioGt[]> {
    return this.http.get<MunicipioGt[]>(`${this.base()}/municipios`, {
      params: { departamentoId },
    });
  }

  getZonas(municipioId: string): Observable<ZonaGt[]> {
    return this.http.get<ZonaGt[]>(`${this.base()}/zonas`, { params: { municipioId } });
  }

  createZona(body: {
    municipioId: string;
    nombre: string;
    costo_envio?: number | null;
    disponible_entrega?: boolean;
  }): Observable<ZonaGt> {
    return this.http.post<ZonaGt>(`${this.base()}/zonas`, body, { headers: this.adminHeaders() });
  }

  patchZona(
    id: string,
    body: {
      nombre?: string;
      costo_envio?: number | null;
      disponible_entrega?: boolean;
    },
  ): Observable<ZonaGt> {
    return this.http.patch<ZonaGt>(`${this.base()}/zonas/${id}`, body, { headers: this.adminHeaders() });
  }

  deleteZona(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base()}/zonas/${id}`, { headers: this.adminHeaders() });
  }
}
