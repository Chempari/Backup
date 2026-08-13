const mongoose = require("mongoose");
const Leccion = require("../models/Lecciones");
const Seccion = require("../models/Secciones");
const Curso = require("../models/Cursos");
const Inscripcion = require("../models/Inscripciones");

const YOUTUBE_REGEX = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=[\w-]{11}|youtu\.be\/[\w-]{11})([\?&].*)?$/;
const VIMEO_REGEX = /^https?:\/\/(www\.)?vimeo\.com\/\d+([\?&].*)?$/;

const validarUrlVideo = (url) => YOUTUBE_REGEX.test(url) || VIMEO_REGEX.test(url);

const verificarInstructorDueñoDeSeccion = async (seccionID, userId) => {
  const seccion = await Seccion.findById(seccionID);
  if (!seccion) return null;
  const curso = await Curso.findById(seccion.cursoID);
  if (!curso) return null;
  // Comparación segura entre ObjectId y string
  const instructorIdStr = curso.instructorID ? curso.instructorID.toString() : null;
  if (instructorIdStr !== userId) return false;
  return { seccion, curso };
};

exports.createLeccion = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }
    
    const { seccionID, url } = req.body;
    if (!seccionID) {
      return res.status(400).json({ success: false, message: "El seccionID es requerido" });
    }
    if (!url) {
      return res.status(400).json({ success: false, message: "La URL del video es requerida" });
    }

    if (!validarUrlVideo(url)) {
      return res.status(400).json({
        success: false,
        message: "URL de video inválida. Debe ser YouTube (youtube.com/watch?v=ID o youtu.be/ID) o Vimeo (vimeo.com/ID)."
      });
    }

    const resultado = await verificarInstructorDueñoDeSeccion(seccionID, req.user.id);
    if (resultado === null) {
      return res.status(404).json({ success: false, message: "Sección no encontrada" });
    }
    if (resultado === false) {
      return res.status(403).json({
        success: false,
        message: "Solo el instructor dueño del curso puede agregar lecciones"
      });
    }

    const leccion = new Leccion(req.body);
    const savedLeccion = await leccion.save();

    await Inscripcion.updateMany(
      { curso_id: resultado.curso._id },
      { $push: { progreso: { leccion_id: savedLeccion._id, completada: false } } }
    );

    return res.status(201).json({ success: true, leccion: savedLeccion });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getLecciones = async (req, res) => {
  try {
    const filter = req.query.seccionID ? { seccionID: req.query.seccionID } : {};
    const lecciones = await Leccion.find(filter).sort("orden");
    return res.status(200).json({ success: true, lecciones });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLeccionById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const leccion = await Leccion.findById(id);
    if (!leccion) {
      return res.status(404).json({ success: false, message: "Lección no encontrada" });
    }

    return res.status(200).json({ success: true, leccion });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateLeccion = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }
    
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const leccion = await Leccion.findById(id);
    if (!leccion) {
      return res.status(404).json({ success: false, message: "Lección no encontrada" });
    }

    if (req.body.url && !validarUrlVideo(req.body.url)) {
      return res.status(400).json({
        success: false,
        message: "URL de video inválida. Debe ser YouTube (youtube.com/watch?v=ID o youtu.be/ID) o Vimeo (vimeo.com/ID)."
      });
    }

    const resultado = await verificarInstructorDueñoDeSeccion(
      leccion.seccionID.toString(),
      req.user.id
    );
    if (resultado === false) {
      return res.status(403).json({
        success: false,
        message: "Solo el instructor dueño puede modificar esta lección"
      });
    }

    delete req.body.seccionID;

    const updatedLeccion = await Leccion.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({ success: true, leccion: updatedLeccion });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteLeccion = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }
    
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const leccion = await Leccion.findById(id);
    if (!leccion) {
      return res.status(404).json({ success: false, message: "Lección no encontrada" });
    }

    const resultado = await verificarInstructorDueñoDeSeccion(
      leccion.seccionID.toString(),
      req.user.id
    );
    if (resultado === false) {
      return res.status(403).json({
        success: false,
        message: "Solo el instructor dueño puede eliminar esta lección"
      });
    }

    await Inscripcion.updateMany(
      { curso_id: resultado.curso._id },
      { $pull: { progreso: { leccion_id: id } } }
    );

    await Leccion.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: "Lección eliminada correctamente" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};