require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const app = require("./app");

// Create uploads/images directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    API_VERSION,
    IP_SERVER
} = require("./constants");

const DB_NAME = process.env.DB_NAME || "Mentora_db";
const DB_HOST_CLEAN = (DB_HOST || "")
    .replace(/\/.*$/, "")
    .replace(/\?.*$/, "");
const DB_OPTIONS = process.env.DB_OPTIONS || "ssl=true&replicaSet=atlas-mgo7m3-shard-0&authSource=admin&appName=Cluster0";
const MONGO_URI = process.env.MONGO_URI ||
    `mongodb://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST_CLEAN}/${DB_NAME}?${DB_OPTIONS}&retryWrites=true&w=majority`;

const port = process.env.PORT || 3977;
console.log("=== LA URI DETECTADA ES ==> ", MONGO_URI);
mongoose.set('debug', true);

mongoose.connect(MONGO_URI)
    .then(() => {
        app.listen(port, () => {
            console.log(`Servidor corriendo en \n
                 http://${IP_SERVER}:${port}/api/${API_VERSION}`);
        });

        console.log("######La conexion con la base de datos ha sido exitosa#####");
    })
    .catch(error => {
        console.log("Error de conexion:", error.message);
    });