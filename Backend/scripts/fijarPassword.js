const mongoose = require('mongoose');
const Usuario = require('../models/Usuarios');
const { DB_USER, DB_PASSWORD, DB_HOST } = require('../constants');

const correo = process.argv[2];
const password = process.argv[3];

if (!correo || !password) {
  console.log('Uso: node scripts/fijarPassword.js <correo> <password>');
  process.exit(1);
}

function buildMongoUri() {
  const DB_NAME = process.env.DB_NAME || 'Mentora_db';
  const DB_HOST_CLEAN = (DB_HOST || '')
    .replace(/\/.*$/, '')
    .replace(/\?.*$/, '');
  const DB_OPTIONS = process.env.DB_OPTIONS ||
    'ssl=true&replicaSet=atlas-mgo7m3-shard-0&authSource=admin&appName=Cluster0';

  return process.env.MONGO_URI ||
    `mongodb://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST_CLEAN}/${DB_NAME}?${DB_OPTIONS}&retryWrites=true&w=majority`;
}

async function main() {
  const uri = buildMongoUri();
  console.log('Conectando a la base de datos...');

  await mongoose.connect(uri);

  const usuario = await Usuario.findOne({ correo: correo.toLowerCase() });
  if (!usuario) {
    console.log(`Usuario ${correo}: no encontrado`);
    await mongoose.disconnect();
    process.exit(1);
  }

  usuario.password = password;
  await usuario.save();

  const match = await usuario.compararPassword(password);
  console.log(`Usuario ${correo}: password fijado correctamente (verificacion bcrypt: ${match})`);

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
