# Guía de Configuración y Ejecución - Mentora

## Requisitos Previos
- Node.js versión 16 o superior
- npm o yarn instalado
- Conexión a MongoDB Atlas (ya configurada en el proyecto)

## Estructura del Proyecto
```
Mentora/
├── Backend/          # API REST con Express + MongoDB
└── FrontEnd/         # Aplicación React con Vite
```

## Variables de Entorno

El archivo `.env` ya está creado en `/workspace/Mentora/Backend/.env` con los siguientes valores:

```env
DB_USER=60823286_db_user2
DB_PASSWORD=admin
DB_HOST=ac-hbkkpqh-shard-00-00.bpfzaub.mongodb.net:27017,ac-hbkkpqh-shard-00-01.bpfzaub.mongodb.net:27017,ac-hbkkpqh-shard-00-02.bpfzaub.mongodb.net:27017/?ssl=true&replicaSet=atlas-mgo7m3-shard-0&authSource=admin&appName=Cluster0
DB_NAME=Mentora_db
API_VERSION=v1
IP_SERVER=localhost
JWT_SECRET=9bceee966f8aeffddfa560fc270c6e8e319807028f056ce4c13cced9f30f59e4
JWT_EXPIRATION=8h
NODE_ENV=development
PORT=3977
CORS_ORIGIN=http://localhost:5173
```

## Pasos para Levantar el Proyecto

### 1. Instalar dependencias (si no están instaladas)

```bash
# Backend
cd /workspace/Mentora/Backend
npm install

# FrontEnd
cd /workspace/Mentora/FrontEnd
npm install
```

### 2. Iniciar el Backend

```bash
cd /workspace/Mentora/Backend
npm run dev
```

Esperar a que aparezca:
```
Servidor corriendo en 
     http://localhost:3977/api/v1
######La conexion con la base de datos ha sido exitosa#####
```

### 3. Iniciar el Frontend (en otra terminal)

```bash
cd /workspace/Mentora/FrontEnd
npm run dev
```

Esperar a que aparezca:
```
  ➜  Local:   http://localhost:5173/
```

### 4. Acceder a la Aplicación

Abrir el navegador en: **http://localhost:5173**

## Script de Configuración Rápida

Puedes usar este script para levantar todo el proyecto automáticamente:

```bash
#!/bin/bash

echo "=== Iniciando Backend ==="
cd /workspace/Mentora/Backend
npm run dev &
BACKEND_PID=$!

echo "Esperando 5 segundos para que inicie el backend..."
sleep 5

echo "=== Iniciando Frontend ==="
cd /workspace/Mentora/FrontEnd
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=== PROYECTO LEVANTADO ==="
echo "Backend: http://localhost:3977/api/v1"
echo "Frontend: http://localhost:5173"
echo ""
echo "Presiona Ctrl+C para detener ambos servicios"

wait
```

## Usuarios de Prueba (Seed)

El proyecto incluye un script `seed.js` que crea usuarios de prueba:

- **Instructor**: email `instructor@test.com`, password `123456`
- **Estudiante**: email `estudiante@test.com`, password `123456`

Para ejecutar el seed:
```bash
cd /workspace/Mentora/Backend
node seed.js
```

## Endpoints Principales

### Autenticación
- `POST /api/v1/auth/register` - Registro de usuario
- `POST /api/v1/auth/login` - Login (retorna JWT)
- `GET /api/v1/auth/me` - Obtener usuario actual

### Cursos
- `GET /api/v1/Cursos` - Listar cursos
- `POST /api/v1/Cursos` - Crear curso (instructor)
- `GET /api/v1/Cursos/:id` - Ver detalle de curso
- `PUT /api/v1/Cursos/:id` - Actualizar curso (instructor)
- `PATCH /api/v1/Cursos/:id/publicar` - Publicar/despublicar curso

### Inscripciones
- `POST /api/v1/Inscripciones` - Inscribirse en curso gratuito
- `POST /api/v1/Inscripciones/pagar` - Simular pago de curso
- `GET /api/v1/Inscripciones/mis-cursos` - Ver mis inscripciones

### Dashboard
- `GET /api/v1/Dashboard/instructor` - Dashboard del instructor
- `GET /api/v1/Dashboard/estudiante` - Dashboard del estudiante

### Uploads
- `POST /api/v1/uploads/profile-photo` - Subir foto de perfil
- `POST /api/v1/uploads/course-cover` - Subir portada de curso

## Solución de Problemas Comunes

### Error: "Cannot find module"
Ejecutar `npm install` en el directorio correspondiente.

### Error: "MongoServerError: Authentication failed"
Verificar que las credenciales en `.env` sean correctas.

### Error: "CORS policy"
Asegurarse de que el frontend esté corriendo en `http://localhost:5173` (puerto configurado en CORS).

### Error: "EADDRINUSE"
El puerto ya está en uso. Matar el proceso:
```bash
# Windows
netstat -ano | findstr :3977
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3977 | xargs kill -9
```

### Las imágenes no se suben
Verificar que el directorio `/workspace/Mentora/Backend/uploads/images` exista y tenga permisos de escritura.

## Formatos de Imagen Soportados
- JPEG/JPG
- PNG
- WEBP
- GIF

Tamaño máximo: **2MB**

## URLs de Video Soportadas
- YouTube: `https://www.youtube.com/watch?v=VIDEO_ID`
- Vimeo: `https://vimeo.com/VIDEO_ID`

## Notas Importantes

1. **JWT Expira en 8 horas** - Después de ese tiempo debes hacer login nuevamente
2. **Solo el instructor dueño puede editar sus cursos**
3. **Los cursos no publicados solo son visibles por su instructor**
4. **Las reseñas solo pueden ser dejadas por estudiantes inscritos**
