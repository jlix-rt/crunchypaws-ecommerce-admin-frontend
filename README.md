# CrunchyPaws — Admin (Angular)

## Arranque

1. API admin en `http://localhost:4001` (o el puerto que uses).
2. `npm install`
3. `ng serve` — el **proxy** reenvía `/api` → `http://localhost:4001` (ver `proxy.conf.json`).
4. Abre `http://localhost:4200/login` → tras login, `/admin/dashboard`.

## `environment.apiUrl`

- **Desarrollo:** `apiUrl: '/api'` (vía proxy).
- **Producción:** `apiUrl: '/api'` (configura el servidor para proxy al API).

Si llamas al API **sin proxy** (p. ej. CORS ya permitido), puedes poner en `environment.ts`:

```ts
apiUrl: 'http://localhost:4001';
```

Forma con prefijo explícito tipo documentación: `http://localhost:4001/api` solo si el backend publica rutas bajo `/api`.

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/login` | Inicio de sesión |
| `/admin/dashboard` | Bienvenida |
| `/admin/users` | Usuarios (solo ADMIN) |
| `/admin/categories` | Categorías en árbol |
| `/admin/products` | Productos e imágenes |

## E2E

```bash
npx playwright install chromium
npm run e2e
```

Con `ng serve` en marcha (proxy activo).
