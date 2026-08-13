const express = require("express");
const SeccionesController = require("../controllers/SeccionesController");
const authMiddleware = require("../middlewares/authMiddleware");
const { esInstructor } = require("../middlewares/roleMiddleware");

const api = express.Router();

api.post("/Secciones", authMiddleware, esInstructor, SeccionesController.createSeccion);
api.get("/Secciones", SeccionesController.getSecciones);
api.get("/Secciones/:id", SeccionesController.getSeccionById);
api.put("/Secciones/:id", authMiddleware, esInstructor, SeccionesController.updateSeccion);
api.delete("/Secciones/:id", authMiddleware, esInstructor, SeccionesController.deleteSeccion);

module.exports = api;