/**
 * Desarrollo con `ng serve`: usa `/api` y proxy.conf.json → http://localhost:4001
 * (equivalente a base `http://localhost:4001/api` si el API publica bajo /api).
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4001',
  /** API tiendasgt-direcciones (proxy dev: /tiendasgt-direcciones). Producción: URL absoluta. */
  direccionesApiUrl: 'http://localhost:4011',
  /** Header x-admin-key si el servicio define ADMIN_API_KEY. */
  direccionesAdminKey: '1234567890',
  /**
   * URL raíz del panel admin (sin barra final).
   * Debe coincidir con ADMIN_VERIFICATION_FRONTEND_BASE_URL / ADMIN_FRONTEND_URL en crunchypaws-ecommerce-admin-backend.
   */
  publicAppUrl: 'http://localhost:4201',
};
