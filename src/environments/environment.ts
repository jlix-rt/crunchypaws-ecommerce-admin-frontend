/**
 * Desarrollo: `apiUrl` = origen + `/api`; con `ng serve` puedes usar `http://localhost:4201/api` y proxy → 4001.
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4001/api',
  /** tiendasgt-direcciones: base con `/api` (proxy `/tiendasgt-direcciones` → 4010). */
  direccionesApiUrl: 'http://localhost:4010/api',
  /** Header x-admin-key si el servicio define ADMIN_API_KEY. */
  direccionesAdminKey: 'F6e3kgCPSjCzoCUbm2M942UQ4nBqTxM=',
  /**
   * URL raíz del panel admin (sin barra final).
   * Debe coincidir con ADMIN_VERIFICATION_FRONTEND_BASE_URL / ADMIN_FRONTEND_URL en crunchypaws-ecommerce-admin-backend.
   */
  publicAppUrl: 'http://localhost:4201',
};
