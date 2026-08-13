const express = require("express");
const InscripcionesController = require("../controllers/InscripcionesController");
const authMiddleware = require("../middlewares/authMiddleware");
const { esEstudiante, esInstructor } = require("../middlewares/roleMiddleware");

const api = express.Router();

api.post("/Inscripciones", authMiddleware, esEstudiante, InscripcionesController.inscribir);
api.get("/Inscripciones/mis-cursos", authMiddleware, InscripcionesController.getMisInscripciones);
api.get("/Inscripciones/:id", authMiddleware, InscripcionesController.getInscripcionById);
api.patch("/Inscripciones/:inscripcionId/lecciones/:leccionId", authMiddleware, esEstudiante, InscripcionesController.marcarLeccionCompletada);
api.get("/Cursos/:id/inscritos", authMiddleware, esInstructor, InscripcionesController.getInscritosPorCurso);
api.delete("/Inscripciones/:id", authMiddleware, esEstudiante, InscripcionesController.deleteInscripcion);
api.post("/Inscripciones/pagar", authMiddleware, esEstudiante, InscripcionesController.pagarCurso);

module.exports = api;
