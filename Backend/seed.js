require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Importar modelos
const Usuario = require('./models/Usuarios');
const Curso = require('./models/Cursos');
const Seccion = require('./models/Secciones');
const Leccion = require('./models/Lecciones');
const Inscripcion = require('./models/Inscripciones');
const Resena = require('./models/Reseñas');

const { DB_USER, DB_PASSWORD, DB_HOST } = require('./constants');

const MONGO_URI = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/Mentora_db?ssl=true&replicaSet=atlas-mgo7m3-shard-0&authSource=admin&appName=Cluster0&retryWrites=true&w=majority`;

// Datos de prueba
const datosPrueba = {
  usuarios: [
    {
      nombre: 'Carlos Instructor',
      correo: 'carlos@test.com',
      password: '123456',
      rol: 'instructor',
      biografia: 'Instructor senior con 10 años de experiencia en desarrollo web',
      activo: true
    },
    {
      nombre: 'Maria Estudiante',
      correo: 'maria@test.com',
      password: '123456',
      rol: 'estudiante',
      biografia: 'Estudiante apasionada por la tecnología',
      activo: true
    },
    {
      nombre: 'Juan Estudiante',
      correo: 'juan@test.com',
      password: '123456',
      rol: 'estudiante',
      biografia: 'Aprendiz de desarrollador',
      activo: true
    },
    {
      nombre: 'Ana Instructora',
      correo: 'ana@test.com',
      password: '123456',
      rol: 'instructor',
      biografia: 'Experta en Python y Machine Learning',
      activo: true
    }
  ],
  cursos: [],
  secciones: [],
  lecciones: [],
  inscripciones: [],
  resenas: []
};

async function limpiarBD() {
  console.log('🗑️  Limpiando base de datos...');
  await Promise.all([
    Usuario.deleteMany({}),
    Curso.deleteMany({}),
    Seccion.deleteMany({}),
    Leccion.deleteMany({}),
    Inscripcion.deleteMany({}),
    Resena.deleteMany({})
  ]);
  console.log('✅ Base de datos limpia');
}

async function crearUsuarios() {
  console.log('\n👥 Creando usuarios...');

  const usuariosCreados = [];

  for (const usuarioData of datosPrueba.usuarios) {
    const usuario = new Usuario(usuarioData);
    await usuario.save();
    usuariosCreados.push(usuario);
    console.log(`   ✓ ${usuario.nombre} (${usuario.rol})`);
  }

  return usuariosCreados;
}

async function crearCursos(usuarios) {
  console.log('\n📚 Creando cursos...');

  const instructores = usuarios.filter(u => u.rol === 'instructor');
  const cursosCreados = [];

  // Curso 1: Node.js desde Cero
  const curso1 = new Curso({
    instructorID: instructores[0]._id,
    titulo: 'Node.js desde Cero',
    descripcion: 'Aprende Node.js desde los fundamentos hasta crear APIs REST completas',
    categoria: 'Programación',
    nivel: 'principiante',
    precio: 29.99,
    publicado: true,
    calificacion_promedio: 4.5,
    total_inscritos: 0
  });
  await curso1.save();
  cursosCreados.push(curso1);
  console.log(`   ✓ ${curso1.titulo}`);

  // Curso 2: React Avanzado
  const curso2 = new Curso({
    instructorID: instructores[0]._id,
    titulo: 'React Avanzado',
    descripcion: 'Domina React con hooks, contexto, y patrones avanzados',
    categoria: 'Programación',
    nivel: 'avanzado',
    precio: 39.99,
    publicado: true,
    calificacion_promedio: 4.8,
    total_inscritos: 0
  });
  await curso2.save();
  cursosCreados.push(curso2);
  console.log(`   ✓ ${curso2.titulo}`);

  // Curso 3: Python para Data Science
  const curso3 = new Curso({
    instructorID: instructores[1]._id,
    titulo: 'Python para Data Science',
    descripcion: 'Aprende Python aplicado a ciencia de datos y machine learning',
    categoria: 'Data Science',
    nivel: 'intermedio',
    precio: 49.99,
    publicado: true,
    calificacion_promedio: 4.7,
    total_inscritos: 0
  });
  await curso3.save();
  cursosCreados.push(curso3);
  console.log(`   ✓ ${curso3.titulo}`);

  return cursosCreados;
}

async function crearSecciones(cursos) {
  console.log('\n📖 Creando secciones...');

  const seccionesCreadas = [];

  // Secciones para Curso 1
  const sec1_1 = new Seccion({
    cursoID: cursos[0]._id,
    titulo: 'Introducción a Node.js',
    orden: 1
  });
  await sec1_1.save();
  seccionesCreadas.push(sec1_1);

  const sec1_2 = new Seccion({
    cursoID: cursos[0]._id,
    titulo: 'Express y APIs REST',
    orden: 2
  });
  await sec1_2.save();
  seccionesCreadas.push(sec1_2);

  // Secciones para Curso 2
  const sec2_1 = new Seccion({
    cursoID: cursos[1]._id,
    titulo: 'Hooks Avanzados',
    orden: 1
  });
  await sec2_1.save();
  seccionesCreadas.push(sec2_1);

  // Secciones para Curso 3
  const sec3_1 = new Seccion({
    cursoID: cursos[2]._id,
    titulo: 'Fundamentos de Python',
    orden: 1
  });
  await sec3_1.save();
  seccionesCreadas.push(sec3_1);

  console.log(`   ✓ ${seccionesCreadas.length} secciones creadas`);

  return seccionesCreadas;
}

async function crearLecciones(secciones, cursos) {
  console.log('\n🎬 Creando lecciones...');

  const leccionesCreadas = [];

  // Lecciones para Curso 1 - Sección 1
  const lec1 = new Leccion({
    seccionID: secciones[0]._id,
    titulo: '¿Qué es Node.js?',
    descripcion: 'Introducción conceptual',
    url: 'https://www.youtube.com/watch?v=TlB_eWDSMt4',
    duracion: 15,
    orden: 1
  });
  await lec1.save();
  leccionesCreadas.push(lec1);

  const lec2 = new Leccion({
    seccionID: secciones[0]._id,
    titulo: 'Instalación y Configuración',
    descripcion: 'Configura tu entorno de desarrollo',
    url: 'https://www.youtube.com/watch?v=7BlTBkhqOKE',
    duracion: 20,
    orden: 2
  });
  await lec2.save();
  leccionesCreadas.push(lec2);

  // Lecciones para Curso 1 - Sección 2
  const lec3 = new Leccion({
    seccionID: secciones[1]._id,
    titulo: 'Creando tu primera API',
    descripcion: 'Endpoints básicos con Express',
    url: 'https://www.youtube.com/watch?v=pKd0Rpw7O48',
    duracion: 30,
    orden: 1
  });
  await lec3.save();
  leccionesCreadas.push(lec3);

  // Lecciones para Curso 2
  const lec4 = new Leccion({
    seccionID: secciones[2]._id,
    titulo: 'useEffect Avanzado',
    descripcion: 'Patrones complejos con useEffect',
    url: 'https://www.youtube.com/watch?v=DPxTRCIiSzs',
    duracion: 25,
    orden: 1
  });
  await lec4.save();
  leccionesCreadas.push(lec4);

  // Lecciones para Curso 3
  const lec5 = new Leccion({
    seccionID: secciones[3]._id,
    titulo: 'Python Básico',
    descripcion: 'Sintaxis y estructuras de control',
    url: 'https://www.youtube.com/watch?v=chPhlsHoEPo',
    duracion: 35,
    orden: 1
  });
  await lec5.save();
  leccionesCreadas.push(lec5);

  console.log(`   ✓ ${leccionesCreadas.length} lecciones creadas`);

  return leccionesCreadas;
}

async function crearInscripciones(usuarios, cursos) {
  console.log('\n📝 Creando inscripciones...');

  const estudiantes = usuarios.filter(u => u.rol === 'estudiante');
  const inscripcionesCreadas = [];

  // Maria se inscribe en Curso 1
  const insc1 = new Inscripcion({
    estudiante_id: estudiantes[0]._id,
    curso_id: cursos[0]._id,
    progreso: [],
    porcentaje: 0
  });
  await insc1.save();
  inscripcionesCreadas.push(insc1);

  // Maria se inscribe en Curso 2
  const insc2 = new Inscripcion({
    estudiante_id: estudiantes[0]._id,
    curso_id: cursos[1]._id,
    progreso: [],
    porcentaje: 0
  });
  await insc2.save();
  inscripcionesCreadas.push(insc2);

  // Juan se inscribe en Curso 1
  const insc3 = new Inscripcion({
    estudiante_id: estudiantes[1]._id,
    curso_id: cursos[0]._id,
    progreso: [],
    porcentaje: 0
  });
  await insc3.save();
  inscripcionesCreadas.push(insc3);

  console.log(`   ✓ ${inscripcionesCreadas.length} inscripciones creadas`);

  return inscripcionesCreadas;
}

async function crearResenas(usuarios, cursos) {
  console.log('\n⭐ Creando reseñas...');

  const estudiantes = usuarios.filter(u => u.rol === 'estudiante');
  const resenasCreadas = [];

  // Maria deja reseña en Curso 1
  const resena1 = new Resena({
    estudiante_id: estudiantes[0]._id,
    curso_id: cursos[0]._id,
    calificacion: 5,
    comentario: 'Excelente curso, muy bien explicado!'
  });
  await resena1.save();
  resenasCreadas.push(resena1);

  // Juan deja reseña en Curso 1
  const resena2 = new Resena({
    estudiante_id: estudiantes[1]._id,
    curso_id: cursos[0]._id,
    calificacion: 4,
    comentario: 'Muy buen contenido, recomendaría más ejercicios prácticos'
  });
  await resena2.save();
  resenasCreadas.push(resena2);

  console.log(`   ✓ ${resenasCreadas.length} reseñas creadas`);

  return resenasCreadas;
}

async function actualizarTotales(cursos, inscripciones, resenas) {
  console.log('\n📊 Actualizando totales...');

  for (const curso of cursos) {
    const totalInscritos = await Inscripcion.countDocuments({ curso_id: curso._id });
    const resenasCurso = await Resena.find({ curso_id: curso._id });

    let calificacionPromedio = 0;
    if (resenasCurso.length > 0) {
      const suma = resenasCurso.reduce((acc, r) => acc + r.calificacion, 0);
      calificacionPromedio = Math.round((suma / resenasCurso.length) * 10) / 10;
    }

    curso.total_inscritos = totalInscritos;
    curso.calificacion_promedio = calificacionPromedio;
    await curso.save();

    console.log(`   ✓ ${curso.titulo}: ${totalInscritos} inscritos, ${calificacionPromedio}★`);
  }
}

async function mostrarTokens() {
  console.log('\n🔑 Tokens JWT para pruebas (usar en Postman/Thunder Client):\n');

  const jwt = require('jsonwebtoken');
  const { JWT_SECRET, JWT_EXPIRATION } = require('./constants');

  const usuarios = await Usuario.find();

  for (const usuario of usuarios) {
    const token = jwt.sign(
      {
        id: usuario._id,
        correo: usuario.correo,
        rol: usuario.rol,
        nombre: usuario.nombre
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    console.log(`${usuario.nombre} (${usuario.rol}):`);
    console.log(`Bearer ${token}\n`);
  }
}

async function main() {
  try {
    console.log('🌱 Iniciando seed de Mentora...\n');

    // Conectar a MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Limpiar BD
    await limpiarBD();

    // Crear datos
    const usuarios = await crearUsuarios();
    const cursos = await crearCursos(usuarios);
    const secciones = await crearSecciones(cursos);
    const lecciones = await crearLecciones(secciones, cursos);
    const inscripciones = await crearInscripciones(usuarios, cursos);
    const resenas = await crearResenas(usuarios, cursos);

    // Actualizar totales
    await actualizarTotales(cursos, inscripciones, resenas);

    // Mostrar tokens
    await mostrarTokens();

    console.log('✅ Seed completado exitosamente!\n');
    console.log('📋 Resumen:');
    console.log(`   - ${usuarios.length} usuarios`);
    console.log(`   - ${cursos.length} cursos`);
    console.log(`   - ${secciones.length} secciones`);
    console.log(`   - ${lecciones.length} lecciones`);
    console.log(`   - ${inscripciones.length} inscripciones`);
    console.log(`   - ${resenas.length} reseñas`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seed:', error.message);
    process.exit(1);
  }
}

main();