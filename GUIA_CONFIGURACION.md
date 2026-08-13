# Guía de Configuración del Proyecto Mentora

## Requisitos Previos

- Node.js (versión 16 o superior)
- npm o yarn
- MongoDB Atlas (cuenta gratuita disponible en https://www.mongodb.com/cloud/atlas)

## Variables de Entorno (.env)

Crea un archivo `.env` en la carpeta `Backend/` con el siguiente contenido:

```env
# Base de datos MongoDB
DB_USER=tu_usuario_mongodb
DB_PASSWORD=tu_password_mongodb
DB_HOST_CLEAN=cluster_host_mongodb
DB_NAME=Mentora_db
DB_OPTIONS=ssl=true&replicaSet=atlas-mgo7m3-shard-0&authSource=admin&appName=Cluster0

# Servidor
PORT=3977
IP_SERVER=localhost
API_VERSION=v1

# JWT
JWT_SECRET=9bceee966f8aeffddfa560fc270c6e8e319807028f056ce4c13cced9f30f59e4
JWT_EXPIRATION=8h
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Explicación de Variables

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_USER` | Usuario de MongoDB Atlas | `mentora_user` |
| `DB_PASSWORD` | Contraseña del usuario MongoDB | `admin123` |
| `DB_HOST_CLEAN` | Host del cluster MongoDB (sin credenciales) | `ac-hbkkpqh-shard-00-00.bpfzaub.mongodb.net:27017,ac-hbkkpqh-shard-00-01.bpfzaub.mongodb.net:27017,ac-hbkkpqh-shard-00-02.bpfzaub.mongodb.net:27017` |
| `DB_NAME` | Nombre de la base de datos | `Mentora_db` |
| `DB_OPTIONS` | Opciones de conexión SSL | `ssl=true&replicaSet=atlas-mgo7m3-shard-0&authSource=admin&appName=Cluster0` |
| `PORT` | Puerto del servidor backend | `3977` |
| `IP_SERVER` | IP del servidor | `localhost` |
| `API_VERSION` | Versión de la API | `v1` |
| `JWT_SECRET` | Clave secreta para JWT (genera una única) | `tu_clave_secreta_aqui` |
| `JWT_EXPIRATION` | Duración del token JWT | `8h` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `CORS_ORIGIN` | URL del frontend para CORS | `http://localhost:5173` |

## Instalación y Ejecución

### Backend

```bash
cd Mentora/Backend
npm install
npm run dev
```

El servidor se ejecutará en `http://localhost:3977/api/v1`

### Frontend

```bash
cd Mentora/FrontEnd
npm install
npm run dev
```

El frontend se ejecutará en `http://localhost:5173`

## Scripts de Windows

Si estás en Windows, puedes usar estos comandos:

```batch
REM Backend
cd "C:\ruta\a\tu\proyecto\Mentora\Backend"
npm install
npm run dev

REM Frontend (en otra terminal)
cd "C:\ruta\a\tu\proyecto\Mentora\FrontEnd"
npm install
npm run dev
```

## Solución de Problemas Comunes

### Error: "total_estudiantes is not defined"

Este error ocurre cuando los cursos no tienen los campos `total_inscritos` o `calificacion_promedio` inicializados. El modelo ya incluye un middleware pre-save que asegura estos valores.

**Solución:** Reinicia el backend después de actualizar el modelo `Cursos.js`.

### Error al subir imágenes

1. Verifica que el directorio `Backend/uploads/images` existe
2. Asegúrate de que las imágenes sean JPG, PNG, WEBP o GIF
3. El tamaño máximo es 2MB

### Error de conexión a MongoDB

1. Verifica que las credenciales en `.env` son correctas
2. Asegúrate de que tu IP está permitida en MongoDB Atlas
3. Revisa que el cluster esté activo

### Error CORS

Asegúrate de que `CORS_ORIGIN` en `.env` coincida con la URL donde se ejecuta el frontend (por defecto `http://localhost:5173`).

## Endpoints Principales

### Autenticación
- `POST /api/v1/auth/register` - Registro de usuario
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Obtener usuario actual

### Cursos
- `GET /api/v1/Cursos` - Listar cursos
- `POST /api/v1/Cursos` - Crear curso (instructor)
- `GET /api/v1/Cursos/:id` - Obtener curso por ID
- `PUT /api/v1/Cursos/:id` - Actualizar curso (instructor)
- `PATCH /api/v1/Cursos/:id/publicar` - Publicar/despublicar curso

### Inscripciones
- `POST /api/v1/Inscripciones` - Inscribirse a curso gratuito
- `GET /api/v1/Inscripciones/mis-cursos` - Ver mis inscripciones
- `POST /api/v1/Inscripciones/pagar` - Pagar curso (simulado)

### Dashboard
- `GET /api/v1/Dashboard/instructor` - Dashboard instructor
- `GET /api/v1/Dashboard/estudiante` - Dashboard estudiante

### Uploads
- `POST /api/v1/uploads/profile-photo` - Subir foto de perfil
- `POST /api/v1/uploads/course-cover` - Subir portada de curso

## Notas Importantes

1. **Imágenes**: El sistema acepta JPG, PNG, WEBP y GIF con máximo 2MB
2. **Videos**: Solo URLs de YouTube o Vimeo (no se almacenan videos)
3. **JWT**: Los tokens expiran después de 8 horas
4. **Roles**: Hay dos roles - `instructor` y `estudiante`
5. **Cursos gratuitos**: Precio = 0 permite inscripción inmediata
6. **Cursos pagados**: Requieren paso adicional de pago simulado
