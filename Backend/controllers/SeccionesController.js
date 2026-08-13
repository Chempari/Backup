const mongoose = require("mongoose");
const Seccion = require("../models/Secciones");
const Curso = require("../models/Cursos");
const Leccion = require("../models/Lecciones");

const verificarInstructorDueño = async (cursoID, userId) => {
  const curso = await Curso.findById(cursoID);
  if (!curso) return null;
  // Comparación segura entre ObjectId y string
  const instructorIdStr = curso.instructorID ? curso.instructorID.toString() : null;
  if (instructorIdStr !== userId) return false;
  return curso;
};

exports.createSeccion = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }
    
    const { cursoID } = req.body;
    if (!cursoID) {
      return res.status(400).json({ success: false, message: "El cursoID es requerido" });
    }

    const curso = await verificarInstructorDueño(cursoID, req.user.id);
    if (curso === null) {
      return res.status(404).json({ success: false, message: "Curso no encontrado" });
    }
    if (curso === false) {
      return res.status(403).json({
        success: false,
        message: "Solo el instructor dueño del curso puede agregar secciones"
      });
    }

    const seccion = new Seccion(req.body);
    const savedSeccion = await seccion.save();
    return res.status(201).json({ success: true, seccion: savedSeccion });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getSecciones = async (req, res) => {
  try {
    const filter = req.query.cursoID ? { cursoID: req.query.cursoID } : {};
    const secciones = await Seccion.find(filter).sort("orden");
    return res.status(200).json({ success: true, secciones });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSeccionById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const seccion = await Seccion.findById(id);
    if (!seccion) {
      return res.status(404).json({ success: false, message: "Sección no encontrada" });
    }

    const lecciones = await Leccion.find({ seccionID: id }).sort("orden");

    return res.status(200).json({ success: true, seccion: { ...seccion.toObject(), lecciones } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSeccion = async (req, res) => {
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

    const seccion = await Seccion.findById(id);
    if (!seccion) {
      return res.status(404).json({ success: false, message: "Sección no encontrada" });
    }

    const curso = await verificarInstructorDueño(seccion.cursoID.toString(), req.user.id);
    if (curso === false) {
      return res.status(403).json({
        success: false,
        message: "Solo el instructor dueño puede modificar esta sección"
      });
    }

    delete req.body.cursoID;

    const updatedSeccion = await Seccion.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({ success: true, seccion: updatedSeccion });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteSeccion = async (req, res) => {
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

    const seccion = await Seccion.findById(id);
    if (!seccion) {
      return res.status(404).json({ success: false, message: "Sección no encontrada" });
    }

    const curso = await verificarInstructorDueño(seccion.cursoID.toString(), req.user.id);
    if (curso === false) {
      return res.status(403).json({
        success: false,
        message: "Solo el instructor dueño puede eliminar esta sección"
      });
    }

    await Leccion.deleteMany({ seccionID: id });
    await Seccion.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: "Sección eliminada correctamente" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};