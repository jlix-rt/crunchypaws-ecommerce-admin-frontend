/**
 * Producción: apiUrl = prefijo bajo el que nginx enruta al admin-backend (`…/api`).
 * direccionesApiUrl: mismo host con path al servicio direcciones (incluye `/api`).
 * publicAppUrl: URL pública HTTPS del panel (emails de verificación / ADMIN_*_URL en el backend).
 * direccionesAdminKey: debe coincidir con la clave del servicio de direcciones en producción.
 */
export const environment = {
  production: true,
  apiUrl: '/api',
  direccionesApiUrl: '/api/direcciones',
  direccionesAdminKey: 'F6e3kgCPSjCzoCUbm2M942UQ4nBqTxM=',
  /** Misma raíz pública HTTPS desde la que sirves el admin (para alinear con el enlace del correo de verificación). */
  publicAppUrl: 'https://crunchypaws-admin.tiendasgt.com',
};
