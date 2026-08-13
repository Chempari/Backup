const express = require("express");
const UsuariosController = require("../controllers/UsuariosController");
const authMiddleware = require("../middlewares/authMiddleware");
const { esInstructor, esEstudiante } = require("../middlewares/roleMiddleware");

const api = express.Router();

api.post("/Usuarios", authMiddleware, esInstructor, UsuariosController.createUser);
api.get("/Usuarios", authMiddleware, UsuariosController.getUsers);
api.get("/Usuarios/:id", authMiddleware, UsuariosController.getUserById);
api.put("/Usuarios/:id", authMiddleware, UsuariosController.updateUser);
api.delete("/Usuarios/:id", authMiddleware, esInstructor, UsuariosController.deleteUser);

module.exports = api;
