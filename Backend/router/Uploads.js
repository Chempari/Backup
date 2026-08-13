const express = require("express");
const { handleUpload } = require("../middlewares/uploadMiddleware");
const UploadController = require("../controllers/UploadController");
const authMiddleware = require("../middlewares/authMiddleware");
const { esInstructor, esInstructorOEstudiante } = require("../middlewares/roleMiddleware");

const api = express.Router();

api.post("/uploads/profile-photo", authMiddleware, esInstructorOEstudiante, handleUpload("foto"), UploadController.subirFotoPerfil);
api.post("/uploads/course-cover", authMiddleware, esInstructor, handleUpload("imagen"), UploadController.subirPortadaCurso);
api.delete("/uploads/:filename", authMiddleware, esInstructorOEstudiante, UploadController.eliminarArchivo);

module.exports = api;
