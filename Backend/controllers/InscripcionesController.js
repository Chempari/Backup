const mongoose = require("mongoose");
const Inscripcion = require("../models/Inscripciones");
const Curso = require("../models/Cursos");
const Leccion = require("../models/Lecciones");
const Seccion = require("../models/Secciones");

const crearInscripcion = async (estudiante_id, curso_id) => {
  const secciones = await Seccion.find({ cursoID: curso_id });
  const seccionIds = secciones.map(s => s._id);
  const lecciones = await Leccion.find({ seccionID: { $in: seccionIds } }).sort("orden");
  
  const progreso = lecciones.map(l => ({
    leccion_id: l._id,
    completada: false
  }));

  const inscripcion = new Inscripcion({
    estudiante_id,
    curso_id,
    progreso,
    porcentaje: 0,
    fecha_inscripcion: new Date()
  });

  await inscripcion.save();
  await Curso.findByIdAndUpdate(curso_id, { $inc: { total_inscritos: 1 } });

  return inscripcion;
};

exports.inscribir = async (req, res) => {
  try {
    const { curso_id } = req.body;
    if (!curso_id) {
      return res.status(400).json({ success: false, message: "El curso_id es requerido" });
    }

    const curso = await Curso.findById(curso_id);
    if (!curso) {
      return res.status(404).json({ success: false, message: "Curso no encontrado" });
    }

    if (!curso.publicado) {
      return res.status(400).json({ success: false, message: "Este curso no está disponible" });
    }

    if (curso.precio > 0) {
      return res.status(200).json({
        success: true,
        requiere_pago: true,
        precio: curso.precio,
        message: "Este curso requiere pago. Usa POST /Inscripciones/pagar con { curso_id } para completar la compra."
      });
    }

    const yaInscrito = await Inscripcion.findOne({
      estudiante_id: req.user.id,
      curso_id
    });
    if (yaInscrito) {
      return res.status(400).json({
        success: false,
        message: "Ya estás inscrito en este curso"
      });
    }

    const inscripcion = await crearInscripcion(req.user.id, curso_id);

    return res.status(201).json({
      success: true,
      message: "Inscripción exitosa",
      inscripcion
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.pagarCurso = async (req, res) => {
  try {
    const { curso_id } = req.body;
    if (!curso_id) {
      return res.status(400).json({ success: false, message: "El curso_id es requerido" });
    }

    const curso = await Curso.findById(curso_id);
    if (!curso) {
      return res.status(404).json({ success: false, message: "Curso no encontrado" });
    }

    if (!curso.publicado) {
      return res.status(400).json({ success: false, message: "Este curso no está disponible" });
    }

    if (curso.precio <= 0) {
      return res.status(400).json({
        success: false,
        message: "Este curso es gratuito. Usa POST /Inscripciones directamente."
      });
    }

    const yaInscrito = await Inscripcion.findOne({
      estudiante_id: req.user.id,
      curso_id
    });
    if (yaInscrito) {
      return res.status(400).json({
        success: false,
        message: "Ya estás inscrito en este curso"
      });
    }

    const inscripcion = await crearInscripcion(req.user.id, curso_id);

    return res.status(201).json({
      success: true,
      message: "Pago simulado exitosamente. Inscripción completada.",
      inscripcion
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getMisInscripciones = async (req, res) => {
  try {
    const inscripciones = await Inscripcion.find({ estudiante_id: req.user.id })
      .populate("curso_id", "titulo imagen nivel categoria precio total_inscritos calificacion_promedio")
      .populate("progreso.leccion_id", "titulo url")
      .sort("-fecha_inscripcion");

    // Estandarizar respuesta con total_estudiantes
    const inscripcionesEstandarizadas = inscripciones.map(insc => ({
      ...insc.toObject(),
      curso_id: insc.curso_id ? {
        ...insc.curso_id.toObject(),
        total_estudiantes: insc.curso_id.total_inscritos || 0,
        total_inscritos: insc.curso_id.total_inscritos || 0,
        calificacion_promedio: insc.curso_id.calificacion_promedio || 0
      } : null
    }));

    return res.status(200).json({ 
      success: true, 
      inscripciones: inscripcionesEstandarizadas,
      total_estudiantes: inscripciones.length,
      message: "Inscripciones obtenidas exitosamente"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInscripcionById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const inscripcion = await Inscripcion.findById(id)
      .populate("curso_id")
      .populate("progreso.leccion_id", "titulo url");

    if (!inscripcion) {
      return res.status(404).json({ success: false, message: "Inscripción no encontrada" });
    }

    return res.status(200).json({ success: true, inscripcion });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.marcarLeccionCompletada = async (req, res) => {
  try {
    const { inscripcionId, leccionId } = req.params;

    if (!mongoose.isValidObjectId(inscripcionId) || !mongoose.isValidObjectId(leccionId)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const inscripcion = await Inscripcion.findById(inscripcionId);
    if (!inscripcion) {
      return res.status(404).json({ success: false, message: "Inscripción no encontrada" });
    }

    if (inscripcion.estudiante_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Solo puedes marcar tus propias lecciones"
      });
    }

    const entry = inscripcion.progreso.find(
      p => p.leccion_id.toString() === leccionId
    );

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Esta lección no pertenece a tu inscripción"
      });
    }

    entry.completada = !entry.completada;

    const total = inscripcion.progreso.length;
    const completadas = inscripcion.progreso.filter(p => p.completada).length;
    inscripcion.porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;

    await inscripcion.save();

    return res.status(200).json({
      success: true,
      message: entry.completada ? "Lección marcada como completada" : "Lección desmarcada",
      inscripcion
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInscritosPorCurso = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const curso = await Curso.findById(id);
    if (!curso) {
      return res.status(404).json({ success: false, message: "Curso no encontrado" });
    }

    if (curso.instructorID.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Solo puedes ver los inscritos de tus propios cursos"
      });
    }

    const inscripciones = await Inscripcion.find({ curso_id: id })
      .populate("estudiante_id", "nombre correo foto")
      .select("estudiante_id fecha_inscripcion porcentaje");

    return res.status(200).json({
      success: true,
      total: inscripciones.length,
      inscritos: inscripciones
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteInscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const inscripcion = await Inscripcion.findById(id);
    if (!inscripcion) {
      return res.status(404).json({ success: false, message: "Inscripción no encontrada" });
    }

    if (inscripcion.estudiante_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Solo puedes eliminar tus propias inscripciones"
      });
    }

    await Curso.findByIdAndUpdate(inscripcion.curso_id, {
      $inc: { total_inscritos: -1 }
    });

    await Inscripcion.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Inscripción eliminada correctamente"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
