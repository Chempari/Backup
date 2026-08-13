const express = require("express");
const DashboardController = require("../controllers/DashboardController");
const authMiddleware = require("../middlewares/authMiddleware");
const { esInstructor, esEstudiante } = require("../middlewares/roleMiddleware");

const api = express.Router();

api.get("/Dashboard/instructor", authMiddleware, esInstructor, DashboardController.getDashboardInstructor);
api.get("/Dashboard/estudiante", authMiddleware, esEstudiante, DashboardController.getDashboardEstudiante);

module.exports = api;
