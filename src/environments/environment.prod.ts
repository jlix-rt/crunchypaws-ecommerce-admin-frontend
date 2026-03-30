/**
 * Producción: apiUrl suele ser `/api` si nginx hace proxy al admin-backend (puerto 4001).
 * direccionesApiUrl: path o URL del servicio tiendasgt-direcciones.
 * publicAppUrl: URL pública HTTPS del panel (emails de verificación / ADMIN_*_URL en el backend).
 * direccionesAdminKey: debe coincidir con la clave del servicio de direcciones en producción.
 */
export const environment = {
  production: true,
  apiUrl: '/api',
  direccionesApiUrl: '/tiendasgt-direcciones',
  direccionesAdminKey: '1234567890',
  /** Misma raíz pública HTTPS desde la que sirves el admin (para alinear con el enlace del correo de verificación). */
  publicAppUrl: 'https://admin.crunchypaws.tiendasgt.com',
};
