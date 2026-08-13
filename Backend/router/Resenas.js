const express = require("express");
const ResenasController = require("../controllers/ResenasController");
const authMiddleware = require("../middlewares/authMiddleware");
const { esInstructorOEstudiante } = require("../middlewares/roleMiddleware");

const api = express.Router();

api.post("/Resenas", authMiddleware, esInstructorOEstudiante, ResenasController.createResena);
api.get("/Cursos/:id/resenas", ResenasController.getResenasByCurso);
api.get("/Lecciones/:id/resenas", ResenasController.getResenasByLeccion);
api.get("/Resenas/:id", ResenasController.getResenaById);
api.put("/Resenas/:id", authMiddleware, esInstructorOEstudiante, ResenasController.updateResena);
api.delete("/Resenas/:id", authMiddleware, esInstructorOEstudiante, ResenasController.deleteResena);

module.exports = api;