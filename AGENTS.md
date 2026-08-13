# AGENTS.md

Plataforma de cursos online. Dos apps independientes, **sin `package.json` en la raíz**: `Backend/` (API REST Express 4 + Mongoose 6, CommonJS) y `FrontEnd/` (SPA React 19 + Vite, ESM). Código, UI y mensajes de respuesta en español.

## Comandos
- Backend: `cd Backend; npm run dev` (nodemon) o `npm start`. Puerto default `3977`.
- Frontend: `cd FrontEnd; npm run dev`. Verificación: `npm run build`, `npm run lint`.
- No hay tests.
- Seed (borra TODA la BD y recarga datos): `cd Backend; node seed.js`. Usuarios (pass `123456`): `carlos@test.com`, `ana@test.com` (instructor); `maria@test.com`, `juan@test.com` (estudiante). Imprime JWTs al final.

## Configuración / .env
- `.env` vive en `Backend/` (ya existe). La URI se arma en `Backend/index.js` desde `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_NAME`, `DB_OPTIONS` (o `MONGO_URI` directo). `constants.js` tiene defaults apuntando al cluster Atlas real, así que arranca sin `.env`.
- El frontend hardcodea la URL del backend en `FrontEnd/src/Api/axios.js` (`baseURL`) y `src/utils.js` (`http://localhost:3977`); si cambias el puerto, actualiza ambos. No hay proxy de Vite.
- CORS está hardcodeado en `Backend/app.js` a `localhost:3000` y `localhost:5173`.
- `README_CONFIGURACION.md` y `GUIA_CONFIGURACION.md` están desactualizados (rutas `/workspace/Mentora/...` y layouts de `.env` inconsistentes). Confiar en `index.js` y `constants.js`.

## Arquitectura
- Backend: `router/` → `controllers/` → `models/`. El modelo de reseñas es `models/Reseñas.js` (con ñ); `require('../models/Resenas.js')` falla. No renombrar.
- Auth: JWT en `localStorage` (`token`, `user`); el interceptor de axios agrega `Authorization: Bearer`, y un 401 limpia sesión y redirige a `/login`. Roles `instructor`/`estudiante` via `middlewares/roleMiddleware.js` (`esInstructor`, `esEstudiante`).
- Frontend: cada feature es una carpeta bajo `src/pages/<ruta>` con barrel `index.js` (p.ej. `pages/cursos/Form/index.js`); seguir ese patrón al agregar páginas.
- Uploads: multer, solo JPG/PNG/WEBP/GIF, máx 2MB, a `Backend/uploads/images` (se crea al arrancar). Devuelven URLs relativas `/images/<archivo>` servidas por express.static; el frontend las completa con `http://localhost:3977`. El dir no está en git: imágenes referenciadas en BD pueden dar 404 tras un clon nuevo.

## Gotchas
- `Backend/scripts/*` (`migrateLegacyPasswords.js`, `verifyLegacyLogins.js`) son utilidades de una sola vez con IDs hardcodeados; no correrlas por accidente.
- `FrontEnd/repomix-output.xml` es un export generado; no editar. La colección de endpoints está en `Insomnia_2026-07-10.yaml`.
- Respuestas del backend: `{ success, message, data }`. Mantener esa forma.
- Raíz tiene un `package-lock.json` huérfano (sin `package.json`); no correr `npm install` en la raíz.
- Requiere Node 16+.
