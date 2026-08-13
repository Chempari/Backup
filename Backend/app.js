const express = require("express");
const cors = require("cors");
const path = require("path");
const { API_VERSION } = require("./constants");

const AuthRouter = require("./router/Auth");
const UsuariosRouter = require("./router/Usuarios");
const UsuariosPublicRouter = require("./router/UsuariosPublic");
const CursosRouter = require("./router/Cursos");
const InscripcionesRouter = require("./router/Inscripciones");
const LeccionesRouter = require("./router/Lecciones");
const ResenasRouter = require("./router/Resenas");
const SeccionesRouter = require("./router/Secciones");
const DashboardRouter = require("./router/Dashboard");
const UploadsRouter = require("./router/Uploads");
const InstructoresRouter = require("./router/Instructores");
const CertificadosRouter = require("./router/Certificados");
const app = express()

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.urlencoded({ extended: true, limit: "3mb" }));
app.use(express.json({ limit: "3mb" }));

app.use('/images', express.static(path.join(__dirname, 'uploads', 'images')));

app.use(`/api/${API_VERSION}`, AuthRouter);
app.use(`/api/${API_VERSION}`, UsuariosRouter);
app.use(`/api/${API_VERSION}`, UsuariosPublicRouter);
app.use(`/api/${API_VERSION}`, InscripcionesRouter);
app.use(`/api/${API_VERSION}`, ResenasRouter);
app.use(`/api/${API_VERSION}`, CursosRouter);
app.use(`/api/${API_VERSION}`, LeccionesRouter);
app.use(`/api/${API_VERSION}`, SeccionesRouter);
app.use(`/api/${API_VERSION}`, DashboardRouter);
app.use(`/api/${API_VERSION}`, UploadsRouter);
app.use(`/api/${API_VERSION}`, InstructoresRouter);
app.use(`/api/${API_VERSION}`, CertificadosRouter);

module.exports = app