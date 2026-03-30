/**
 * Ejemplo (enunciado): si tu API responde en http://localhost:4001/api/...
 * y no usas proxy, reemplaza el contenido de environment.ts por:
 *
 * export const environment = {
 *   production: false,
 *   apiUrl: 'http://localhost:4001/api',
 * };
 *
 * Asegura CORS en el servidor. Con `ng serve` + proxy, usa apiUrl: '/api'.
 */
export const environmentExample = {
  production: false,
  apiUrl: 'http://localhost:4001/api',
};
