# Presentación del Proyecto — Mentora (PPT)

Guía diapositiva por diapositiva: **qué texto poner** y **qué captura de pantalla (screenshot) tomar** para cada una.

> Cómo tomar los screenshots: usa las URLs indicadas con el servidor corriendo (local: `http://localhost:5173` con backend en `http://localhost:3977`, o el despliegue real). Presiona `Win + Shift + S` para recortar y pega en la diapositiva.

---

## 0. Portada

**Texto:**
- **MENTORA — Plataforma de Cursos Online**
- Stack: MERN (MongoDB · Express · React · Node.js)
- [Tu Nombre] · [Colegio] · [Materia]

**Screenshot:** la landing (`/`) con el diseño principal del sitio.

---

## 1. Empresa inspiradora · Problema resuelto · Objetivos

**Texto (viñetas):**
- **Empresa inspiradora:** Udemy / Coursera (plataformas de cursos en línea). Mentora replica su modelo: crear, vender y tomar cursos.
- **Problema resuelto:** no hay un lugar unificado donde los instructores organicen su contenido y los estudiantes midan su avance; hay que gestionar roles, inscripciones y certificados.
- **Objetivos:**
  - Plataforma web con dos roles (instructor y estudiante).
  - CRUD de cursos, secciones y lecciones.
  - Inscripción, progreso, reseñas y certificados.
  - Autenticación segura (JWT + bcrypt).

**Screenshots:**
- Landing (`/`).
- Página de explorar cursos (`/explorar`) mostrando las tarjetas de cursos.

---

## 2. Arquitectura final MERN

**Texto (viñetas):**
- **Frontend:** React 19 + Vite (SPA), desplegado en Vercel.
- **Backend:** API REST Express 4 + Mongoose 6, desplegado en Render.
- **Base de datos:** MongoDB Atlas (nube) — colección `Mentora_db`.
- **Flujo completo:** el navegador llama a la API con `Authorization: Bearer <JWT>`; el backend valida el token, ejecuta el controlador, consulta MongoDB y devuelve JSON.
- **Roles:** `instructor` (crea cursos) y `estudiante` (se inscribe y aprende).
- **Seguridad:** contraseñas con bcrypt, JWT con expiración de 8 h, middlewares de rol y verificación de propiedad (403 si no eres el dueño), CORS configurado, imágenes en Cloudinary.
- **API REST:** 12 routers bajo `/api/v1` (auth, usuarios, cursos, secciones, lecciones, reseñas, inscripciones, certificados, dashboard, uploads, instructores).

**Screenshots:**
- El diagrama de arquitectura (puedes dibujarlo a mano o usar el diagrama Mermaid/ASCII del informe).
- Árbol de carpetas del proyecto en VS Code (backend y frontend colapsados).
- Colección Insomnia/Postman con las peticiones (muestra que es una API REST).

---

## 3. Demostración funcional

**Texto (viñetas):**
- **Registro:** crear cuenta (solo correos Gmail).
- **Login JWT:** al entrar se genera un token que se guarda en el navegador y se manda en cada petición.
- **CRUD principal:** crear, editar, publicar y eliminar cursos, secciones y lecciones.
- **Roles:** instructor crea contenido; estudiante se inscribe y aprende.
- **Reportes / dashboards:** estadísticas del instructor (cursos, inscritos, ingresos) y del estudiante (avance, certificados).
- **Funcionalidades completas:** buscar cursos, inscribirse, pagar (simulado), ver lecciones, marcar progreso, dejar reseñas con respuestas, obtener certificado.

**Screenshots (en este orden):**
1. Página de registro (`/register`).
2. Página de login (`/login`).
3. Dashboard del estudiante (`/dashboard`) — tarjetas de cursos y progreso.
4. Dashboard del instructor (`/dashboard`) — lista de sus cursos y estadísticas.
5. Formulario de crear curso (`/cursos/nuevo`).
6. Edición de curso con secciones y lecciones (`/cursos/:id/editar`).
7. Vista del curso (`/cursos/:id`) con reseñas y botón de inscribirse.
8. Vista de aprendizaje (`/cursos/:id/aprender`) con temario y video.
9. Sección de comentarios/reseñas con hilos de respuestas.
10. Certificados (`/certificates`).
11. Modal de pago (al inscribirse).

---

## 4. Base de datos

**Texto (viñetas):**
- **Colecciones (7):** Usuarios, Cursos, Secciones, Lecciones, Reseñas, Inscripciones, Certificados.
- **Relaciones:**
  - Curso → instructor (1 a N).
  - Curso → Secciones → Lecciones.
  - Reseñas → usuario + curso (+ lección opcional) y autoreferencia para respuestas (`respuesta_a`).
  - Inscripciones → usuario + curso (con `progreso` embebido y `porcentaje`).
  - Certificados → usuario + curso (índice único por par usuario-curso).
- **MongoDB Atlas/local:** se usa Atlas (nube). Los esquemas se definen en Mongoose con validadores, `enum` y relaciones resueltas con `populate`.

**Screenshots:**
- MongoDB Compass: listado de las colecciones de `Mentora_db`.
- MongoDB Atlas: vista de cluster (Dashboard).
- (Opcional) Captura de `models/` en VS Code.

---

## 5. Pruebas

**Texto (viñetas):**
- **Casos de prueba:** registro (Gmail/no-Gmail), login correcto/incorrecto, acceso por roles (estudiante no puede crear cursos → 403), editar curso ajeno → 403, inscribirse, completar lecciones, subir imagen > 2 MB → 413, petición desde Vercel (CORS).
- **Errores encontrados y soluciones:**
  - **500 al iniciar sesión** en cuentas antiguas (hash no-bcrypt) → `compararPassword` defensivo + script `fijarPassword.js`.
  - **CORS bloqueado** en producción → permitir cualquier origen si `CORS_ORIGINS` está vacía.
  - **Imágenes 404 en Render** (disco local no persiste) → migración a Cloudinary.
  - **Comentarios de lección que no se refrescaban** → fix en `useResenasPorLeccion`.

**Screenshots:**
- Insomnia: colección de peticiones + una petición exitosa (GET `/Cursos`).
- Consola con el error 500 ANTES de la solución y el mismo login funcionando DESPUÉS (401/200).
- Terminal con el `curl` de verificación de CORS (mostrando el header `access-control-allow-origin`).

---

## 6. Código

**Texto (viñetas):**
- **Organización:** backend `router → controllers → models`; frontend con barrels por feature (`pages/<ruta>/index.js`).
- **Comentarios:** código documentado en español.
- **Buenas prácticas:** validadores de Mongoose, `populate` para relaciones, hooks `pre("save")` para bcrypt, variables de entorno, componentes reutilizables.
- **Manejo de errores:** respuestas JSON uniformes `{ success, message }`, códigos HTTP correctos (400/401/403/404/413/500), interceptores en axios.

**Screenshots (VS Code):**
- `authMiddleware.js` (verificación del JWT).
- `usuarioSchema.pre("save")` (hash con bcrypt).
- `roleMiddleware.js` (control de roles).
- `axios.js` (interceptores de petición/respuesta).
- `compararPassword` con `try/catch` (manejo defensivo de errores).

---

## 7. Conclusiones

**Texto (viñetas):**
- **Logros:** API completa y funcional; autenticación segura; frontend que cubre todo el flujo; aplicación desplegada en la nube (Render + Vercel + Atlas + Cloudinary).
- **Dificultades:** cuentas legacy con 500; CORS entre servicios; el modelo con `ñ` (`Reseñas.js`); falta de tests automatizados.
- **Mejoras futuras:** tests automatizados, login con Google (OAuth), pagos reales, certificados en PDF, panel de administración.

**Screenshot:** captura del producto final corriendo (landing o dashboard) como cierre. También puedes poner una frase de cierre: *"Mentora: una plataforma de cursos completa, segura y desplegada en la nube."*
