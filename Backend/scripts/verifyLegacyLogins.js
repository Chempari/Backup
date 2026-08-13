const mongoose = require('mongoose');
const Usuario = require('../models/Usuarios');
const { DB_USER, DB_PASSWORD, DB_HOST } = require('../constants');

const DB_NAME = process.env.DB_NAME || 'Mentora_db';
const DB_HOST_CLEAN = (DB_HOST || '')
  .replace(/\/.*$/, '')
  .replace(/\?.*$/, '');
const DB_OPTIONS = process.env.DB_OPTIONS ||
  'ssl=true&replicaSet=atlas-mgo7m3-shard-0&authSource=admin&appName=Cluster0';
const MONGO_URI = process.env.MONGO_URI ||
  `mongodb://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST_CLEAN}/${DB_NAME}?${DB_OPTIONS}&retryWrites=true&w=majority`;

async function main() {
  await mongoose.connect(MONGO_URI);

  const cases = [
    {
      id: '6a2b38f592e40d4f67f3e402',
      correo: 'zzzz@academiaxd',
      password: 'passwordUltraSeguro123'
    },
    {
      id: '6a2c29e6e5fa86af65f96813',
      correo: 'juan.perez@miacademia.com',
      password: 'passwordSeguro123'
    },
    {
      id: '6a2c350fa580e500c769971d',
      correo: 'zzzz@gamil.com',
      password: 'passwordSeguro123'
    }
  ];

  for (const item of cases) {
    const usuario = await Usuario.findById(item.id);
    if (!usuario) {
      console.log(`FAIL ${item.id}: usuario no encontrado`);
      continue;
    }

    const match = await usuario.compararPassword(item.password);
    console.log(`${item.correo} -> compare=${match}`);
  }

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
