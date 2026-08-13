# Guía para explicar el proyecto al profesor

Chuleta para que entiendas y expliques **cada parte del proyecto** con tus propias palabras. Léela completa, y después practica con el "flujo de ejemplo" del final.

---

## 1. ¿Qué es Mentora?

Una **plataforma web de cursos en línea** hecha con el stack **MERN**:

- **M**ongoDB → la base de datos (guardamos usuarios, cursos, etc.).
- **E**xpress → el servidor que responde a las peticiones (API REST).
- **R**eact → la interfaz que ve el usuario en el navegador.
- **N**ode.js → el entorno donde corre el servidor.

Tiene **dos tipos de usuario (roles)**:
- **Instructor**: crea y administra sus cursos (secciones, lecciones, publicar, responder comentarios).
- **Estudiante**: explora, se inscribe, avanza en las lecciones, deja reseñas y obtiene un certificado.

---

## 2. Cómo viaja una petición de principio a fin

Ejemplo: **un instructor crea un curso**.

1. En el navegador (React), el instructor llena el formulario y presiona "Guardar".
2. **Axios** (librería del frontend) arma la petición `POST /api/v1/Cursos` y le agrega el encabezado `Authorization: Bearer <token>` (el token de la sesión).
3. Express recibe la petición y la envía al **router** de cursos (`router/Cursos.js`).
4. El router la pasa primero por los **middlewares**: `authMiddleware` (¿el token es válido?) y `esInstructor` (¿el usuario tiene rol instructor?).
5. Si todo está bien, llega al **controlador** (`CursosController.createCurso`), que contiene la lógica: validar datos, crear el documento y guardarlo en MongoDB.
6. El controlador responde JSON: `{ success: true, message, curso }`.
7. React recibe la respuesta y actualiza la pantalla (muestra el curso en el dashboard).

**Regla mnemotécnica:** `Ruta (router) → Middleware (control de acceso) → Controlador (lógica) → Modelo (BD)`.

---

## 3. La Base de Datos (MongoDB + Mongoose)

MongoDB guarda **documentos** (objetos JSON) dentro de **colecciones** (como tablas en SQL, pero flexibles). Mongoose es el "traductor" que define la estructura (esquema) y valida los datos.

**Las 7 colecciones:**

| Colección | Guarda... | Relaciones |
|---|---|---|
| `Usuarios` | nombre, correo, password (cifrada), rol, foto, redes | — |
| `Cursos` | título, descripción, categoría, nivel, precio, imagen, calificación, inscritos | `instructorID → Usuario` |
| `Secciones` | título, orden | `cursoID → Curso` |
| `Lecciones` | título, url de video, duración, orden | `seccionID → Seccion` |
| `Reseñas` | calificación (1–5), comentario | `estudiante_id → Usuario`, `curso_id → Curso`, `leccion_id → Leccion`, `respuesta_a → Reseña` (para hilos) |
| `Inscripciones` | progreso (lecciones completadas) y porcentaje | `estudiante_id → Usuario`, `curso_id → Curso` |
| `Certificados` | fecha de finalización | `usuario_id → Usuario`, `curso_id → Curso` |

**Cosas que puedes mencionar (dan puntos):**
- **Subdocumentos embebidos:** el `progreso` va **dentro** de la inscripción (no en una colección aparte); lo mismo las `redes_sociales` dentro del usuario. MongoDB permite anidar datos.
- **Índice único en Certificados:** `{ usuario_id, curso_id }` → un estudiante solo puede tener **un** certificado por curso (evita duplicados a nivel de BD).
- **Validadores:** el curso solo acepta un `instructorID` que exista y sea instructor; las reseñas exigen usuario estudiante/instructor; `nivel` solo permite `principiante/intermedio/avanzado` (enum).
- **`populate`:** cuando queremos el nombre del instructor junto a un curso, usamos `populate` para "traer" los datos de la otra colección (es como un JOIN de SQL).
- **MongoDB Atlas:** la BD está en la nube (no local), por eso el backend en Render puede conectarse a ella desde cualquier parte.

---

## 4. La seguridad (pregunta favorita de los profesores)

### Contraseñas con bcrypt
- La contraseña **nunca se guarda en texto plano**.
- En el modelo `Usuario` hay un hook `pre("save")` que, **antes de guardar**, genera un *salt* (aleatoriedad) y calcula el hash:
  ```js
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  ```
- Para verificar el login usamos `bcrypt.compare`, que compara la contraseña escrita con el hash guardado **sin necesidad de descifrarlo** (bcrypt es de un solo sentido).
- **Detalle extra:** `compararPassword` está envuelto en `try/catch` → si una cuenta vieja tiene un hash corrupto, el login devuelve `401` en vez de romper con `500`.

### Tokens JWT
- Al hacer login/registro, el servidor **firma** un token con `jwt.sign`:
  ```js
  jwt.sign({ id, correo, rol, nombre }, JWT_SECRET, { expiresIn: "8h" });
  ```
- El token contiene datos del usuario (payload) y una **firma** hecha con una clave secreta (`JWT_SECRET`). Si alguien lo modifica, la firma deja de coincidir y el token se invalida.
- **Expira en 8 horas.** El navegador lo guarda en `localStorage` y lo envía en cada petición en el encabezado `Authorization: Bearer <token>`.
- El `authMiddleware` hace `jwt.verify(token, JWT_SECRET)`. Si expiró → 401; si es inválido → 401; si es correcto → pone `req.user` y continúa.

### Roles (middleware de rol)
- `roleMiddleware` expone: `esInstructor`, `esEstudiante`, `esInstructorOEstudiante`.
- Devuelve **401** si no hay token y **403** si el rol no corresponde.

### Protección por propietario (muy buena para explicar)
- Aunque el rol sea instructor, un instructor **no puede** editar el curso de otro. Los controladores comparan:
  ```js
  if (curso.instructorID.toString() !== req.user.id) → 403
  ```
- Esto se llama *authorization a nivel de recurso*: además de "¿quién eres?", preguntamos "¿te pertenece esto?".

### Otras medidas
- **CORS:** el backend acepta peticiones del frontend (y de cualquier origen si `CORS_ORIGINS` está vacía).
- **Validación de correo:** solo se permiten registros con `@gmail.com`.
- **Uploads:** solo imágenes JPG/PNG/WEBP/GIF de máximo 2 MB (multer); se guardan en **Cloudinary**.
- **Formato de errores:** todas las respuestas usan `{ success, message }` con códigos HTTP correctos.

---

## 5. El frontend (React + Axios)

- **React** divide la interfaz en **componentes** (cajitas reutilizables) y usa **React Router** para las páginas (`/login`, `/cursos/:id`, `/dashboard`...).
- **Cada funcionalidad** está en su carpeta con un `index.js` (patrón "barrel"): por ejemplo `pages/cursos/Form/`.
- **Axios** es el cliente HTTP. Lo más importante es su configuración en `src/Api/axios.js`:
  - `baseURL = VITE_API_URL` (la URL del backend, configurable por entorno).
  - **Interceptor de peticiones:** agrega automáticamente `Authorization: Bearer <token>` a **todas** las peticiones. Así no repetimos el token en cada llamada.
  - **Interceptor de respuestas:** si el servidor responde **401** (token expirado), borra la sesión y redirige a `/login`. Es el "logout automático".
- **Sesión:** el token y los datos del usuario viven en `localStorage`. El `AuthContext` (contexto de React) expone `user`, `login`, `register`, `logout` a toda la app.
- **`imageUrl()`** en `utils.js` resuelve las imágenes: si la URL es completa (Cloudinary) la usa tal cual; si es local (`/images/...`) le antepone el origen del backend.

---

## 6. Los uploads (Cloudinary)

- Cuando el instructor sube una foto/portada, **multer** (middleware de Node) recibe el archivo.
- Si `CLOUDINARY_CLOUD_NAME` está definida, usa `multer-storage-cloudinary`: el archivo se sube a **Cloudinary** (nube) y guardamos la URL completa (`https://res.cloudinary.com/...`).
- Ventaja clave: en Render los archivos del disco **se pierden** al reiniciar; en Cloudinary no. Por eso las imágenes nuevas están en la nube.
- Si no hay credenciales, cae a disco local (`uploads/images`) — útil para desarrollo.

---

## 7. Despliegue

- **Backend → Render**: un servicio que ejecuta el servidor Node 24/7. Lee variables de entorno del panel (BD, JWT, Cloudinary).
- **Frontend → Vercel**: hostea los archivos estáticos que genera el build de React (Vite). La variable `VITE_API_URL` le dice al frontend **cuál es la URL del backend** (si no, apuntaría a `localhost` y fallaría en producción).
- **MongoDB Atlas** y **Cloudinary** son los servicios externos en la nube.
- URLs actuales:
  - Backend: `https://backend-render-bobx.onrender.com/api/v1`
  - Frontend: `https://frontend-vercel-sage.vercel.app`

---

## 8. Flujo de ejemplo completo (practica este recorrido)

> "María entra a la plataforma y quiere aprender Node.js."

1. **Registro** (`POST /auth/register`): María crea su cuenta con Gmail. El hook de bcrypt cifra su contraseña y el servidor le firma un JWT de 8 h.
2. **Login** (`POST /auth/login`): si la contraseña coincide, recibe otro token. React lo guarda en `localStorage`.
3. **Explorar** (`GET /Cursos`): María ve los cursos publicados (público, sin token).
4. **Inscribirse** (`POST /Inscripciones`): el interceptor manda el Bearer token; el `esEstudiante` valida el rol; el controlador crea la inscripción con `progreso: []`.
5. **Aprender** (`PATCH /Inscripciones/:id/lecciones/:leccionId`): al terminar cada lección, se marca completada y se recalcula `porcentaje`.
6. **Reseñar** (`POST /Resenas`): deja su calificación y comentario; el instructor puede responderle (campo `respuesta_a`).
7. **Certificado** (`POST /Certificados`): al llegar al 100 % se emite un certificado (el índice único impide duplicados).

---

## 9. Posibles preguntas del profesor (con respuesta)

**¿Por qué JWT y no sesiones tradicionales?**
Porque no guardamos estado en el servidor: el token es autónomo (contiene identidad + firma). Sirve para APIs y es escalable: cualquier servidor puede validar el token con la misma clave secreta.

**¿Qué pasa si el token expira?**
El servidor responde `401`. El interceptor de axios lo detecta, borra `localStorage` y manda al usuario a `/login`. También existe `POST /auth/refresh` para renovar el token.

**¿Cómo sé que el token no está falsificado?**
Por la firma: el servidor verifica con `jwt.verify(token, JWT_SECRET)`. Si alguien cambia el payload, la firma no coincide y se rechaza.

**¿Dónde se guarda la contraseña?**
Nunca en texto plano. Solo un hash bcrypt (con salt). Ni siquiera el admin del sistema puede verla.

**¿Cómo se relacionan las colecciones en una BD no relacional?**
Con **referencias por ObjectId** (guardamos el `_id` de otra colección) y `populate` para traer los datos al consultar. Además usamos **subdocumentos** cuando el dato pertenece al padre (el `progreso` dentro de la inscripción).

**¿Qué pasa si borro un curso con secciones/lecciones?**
El controlador de eliminar curso se encarga de borrar en cascada sus secciones, lecciones, inscripciones, reseñas y certificados relacionados.

**¿Por qué MongoDB Atlas y no la BD local?**
Para que el backend desplegado en Render se conecte desde la nube, sin depender de la máquina local.

**¿Cómo verificaste que funciona?**
Pruebas manuales con Insomnia (37 peticiones), `curl` para CORS/deploy, y el build (`npm run build`) del frontend. Documenté errores reales y sus soluciones (el 500 de cuentas legacy, el CORS, las imágenes locales).

---

## 10. Errores y soluciones que puedes contar (muestran que entendiste)

| Problema | Causa | Solución |
|---|---|---|
| Login daba **500** en cuentas antiguas | hash de contraseña no-bcrypt roto | `compararPassword` con `try/catch` + script `fijarPassword.js` para re-hashear |
| **CORS** bloqueaba al frontend desplegado | solo se permitía `localhost` | si `CORS_ORIGINS` está vacía se refleja cualquier origen |
| **Imágenes 404** en Render | se guardaban en disco local que no persiste | migración de subidas a Cloudinary |
| Reseñas de lección no se refrescaban al editar | `cargar()` no actualizaba el estado | fix en `useResenasPorLeccion` (`setResenas` + `actualizarResena`) |
