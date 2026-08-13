# AGENTS.md

Plataforma de cursos online. Dos apps independientes, **sin `package.json` en la raíz**: `Backend/` (API REST Express 4 + Mongoose 6, CommonJS) y `FrontEnd/` (SPA React 19 + Vite, ESM). Código, UI y mensajes de respuesta en español.

## Comandos
- Backend: `cd Backend; npm run dev` (nodemon) o `npm start`. Puerto default `3977`.
- Frontend: `cd FrontEnd; npm run dev`. Verificación: `npm run build`, `npm run lint`. No hay tests.
- Seed (borra TODA la BD y recarga datos): `cd Backend; node seed.js`. Usuarios (pass `123456`): `carlos@test.com`, `ana@test.com` (instructor); `maria@test.com`, `juan@test.com` (estudiante). Imprime JWTs al final.
- Frontend requiere Node moderno: Vite 8 / ESLint 10 exigen Node ≥20.19 (o ≥22.12).

## Configuración / .env
- No hay `.env` en el repo (gitignored); hay plantillas `Backend/.env.example` y `FrontEnd/.env.example` (a `Backend/.gitignore` se le añadió `!.env.example`). La URI se arma en `Backend/index.js` desde `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_NAME`, `DB_OPTIONS` (o `MONGO_URI` directo); `constants.js` tiene defaults apuntando al cluster Atlas real, así que arranca y hace seed sin `.env`.
- El frontend lee la URL del backend de `import.meta.env.VITE_API_URL` (default `http://localhost:3977/api/v1`) en `FrontEnd/src/Api/axios.js`; `src/utils.js` deriva `imageUrl` del mismo env. Si cambias el puerto o despliegas, setea `VITE_API_URL`. No hay proxy de Vite.
- CORS en `Backend/app.js` lee `CORS_ORIGINS` (comas) con fallback a `localhost:3000` y `localhost:5173`. `constants.js` exporta `CORS_ORIGIN` pero app.js NO lo usa.
- Uploads: con `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` definidos usa `multer-storage-cloudinary` (URL completa en `req.file.path`); sin ellos cae a disco local (`Backend/uploads/images`). El middleware exporta `{ upload, handleUpload }` (NO cambió la API).
- Deploy: `FrontEnd/vercel.json` (rewrites SPA a `/index.html`). `README_CONFIGURACION.md` y `GUIA_CONFIGURACION.md` están desactualizados; confiar en `index.js` y `constants.js`.

## Arquitectura
- Backend: `router/` → `controllers/` → `models/`. Cuidado con la ñ: el modelo es `models/Reseñas.js` (con ñ) y los controllers hacen `require('../models/Reseñas')`; el archivo de rutas es `router/Resenas.js` (sin ñ). No renombrar el modelo.
- Auth: JWT en `localStorage` (`token`, `user`); el interceptor de axios agrega `Authorization: Bearer`, y un 401 limpia sesión y redirige a `/login`. Roles via `middlewares/roleMiddleware.js` (`esInstructor`, `esEstudiante`, `esInstructorOEstudiante`).
- Frontend: cada feature es una carpeta bajo `src/pages/<ruta>` con barrel `index.js` (p.ej. `pages/cursos/Form/index.js`); seguir ese patrón al agregar páginas.
- Uploads: multer, solo JPG/PNG/WEBP/GIF, máx 2MB. Con Cloudinary las URLs son completas (`https://res.cloudinary.com/...`) y `imageUrl()` las pasa tal cual; en disco local devuelve URLs relativas `/images/<archivo>` servidas por express.static. El dir local no está en git: imágenes referenciadas en BD pueden dar 404 tras un clon nuevo (y en Render se pierden en cada reinicio, por eso se migró a Cloudinary).
- Íconos: usar los SVG de `FrontEnd/src/components/Icons.jsx` (`StarIcon`, `Stars`, `PlayIcon`, `ChevronIcon`) y `SocialIcons.jsx`; NO usar caracteres Unicode (`★`, `▶`, `▲`) ni emojis como íconos (dieron problemas de codificación).

## Respuestas de la API
- Forma base `{ success, message?, ... }`: `success` siempre presente, pero la clave de payload varía por endpoint (`user`, `users`, `curso`, `resenas`, `token`, ...). No asumas una clave `data` fija.

## Gotchas
- `Backend/scripts/*` (`migrateLegacyPasswords.js`, `verifyLegacyLogins.js`) son utilidades de una sola vez con IDs hardcodeados; no correrlas por accidente. Igual `Backend/fix1.js` (paths absolutos de otra máquina).
- `Backend/scripts/fijarPassword.js` re-hashea la contraseña de un usuario por correo: `node scripts/fijarPassword.js <correo> <password>` (lee credenciales de `constants.js`/env). Uso intencional: reparar cuentas legacy cuyo hash no es bcrypt y rompen el login con 500.
- `FrontEnd/repomix-output.xml` es un export generado; no editar. La colección de endpoints está en `Insomnia_2026-07-10.yaml`.
- Raíz tiene un `package-lock.json` huérfano (sin `package.json`); no correr `npm install` en la raíz.