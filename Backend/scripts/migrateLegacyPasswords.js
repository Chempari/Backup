const mongoose = require('mongoose');
const Usuario = require('../models/Usuarios');
const { DB_USER, DB_PASSWORD, DB_HOST } = require('../constants');

const TARGETS = [
  {
    id: '6a2b38f592e40d4f67f3e402',
    plainPassword: 'passwordUltraSeguro123'
  },
  {
    id: '6a2c29e6e5fa86af65f96813',
    plainPassword: 'passwordSeguro123'
  },
  {
    id: '6a2c350fa580e500c769971d',
    plainPassword: 'passwordSeguro123'
  }
];

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

async function migrateLegacyPasswords() {
  const uri = buildMongoUri();
  console.log('Conectando a:', uri);

  await mongoose.connect(uri);
  console.log('Conexión establecida');

  for (const { id, plainPassword } of TARGETS) {
    const usuario = await Usuario.findById(id);

    if (!usuario) {
      console.log(`Usuario ${id}: no encontrado`);
      continue;
    }

    usuario.password = plainPassword;
    await usuario.save();

    console.log(`Usuario ${id}: password ajustado correctamente`);
  }

  console.log('Migración finalizada');
  await mongoose.disconnect();
}

migrateLegacyPasswords().catch((error) => {
  console.error('Error en migración:', error);
  process.exit(1);
});
