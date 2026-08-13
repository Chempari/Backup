const DB_USER = process.env.DB_USER || "60823286_db_user2";
const DB_PASSWORD = process.env.DB_PASSWORD || "admin";
const DB_HOST = process.env.DB_HOST || "ac-hbkkpqh-shard-00-00.bpfzaub.mongodb.net:27017,ac-hbkkpqh-shard-00-01.bpfzaub.mongodb.net:27017,ac-hbkkpqh-shard-00-02.bpfzaub.mongodb.net:27017/?ssl=true&replicaSet=atlas-mgo7m3-shard-0&authSource=admin&appName=Cluster0";
const API_VERSION = process.env.API_VERSION || "v1";
const IP_SERVER = process.env.IP_SERVER || "localhost";
const JWT_SECRET = process.env.JWT_SECRET || "9bceee966f8aeffddfa560fc270c6e8e319807028f056ce4c13cced9f30f59e4";
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "8h";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

module.exports = {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    API_VERSION,
    IP_SERVER,
    JWT_SECRET,
    JWT_EXPIRATION,
    CORS_ORIGIN
}