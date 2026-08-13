const express = require("express");
const LeccionesController = require("../controllers/LeccionesController");
const authMiddleware = require("../middlewares/authMiddleware");
const { esInstructor } = require("../middlewares/roleMiddleware");

const api = express.Router();

api.post("/Lecciones", authMiddleware, esInstructor, LeccionesController.createLeccion);
api.get("/Lecciones", LeccionesController.getLecciones);
api.get("/Lecciones/:id", LeccionesController.getLeccionById);
api.put("/Lecciones/:id", authMiddleware, esInstructor, LeccionesController.updateLeccion);
api.delete("/Lecciones/:id", authMiddleware, esInstructor, LeccionesController.deleteLeccion);

module.exports = api;