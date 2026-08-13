const mongoose = require("mongoose");
const Resena = require("../models/Reseñas");
const Curso = require("../models/Cursos");
const Inscripcion = require("../models/Inscripciones");
const Leccion = require("../models/Lecciones");

const recalcularPromedio = async (curso_id) => {
  const resultado = await Resena.aggregate([
    {
      $match: {
        curso_id: new mongoose.Types.ObjectId(curso_id),
        calificacion: { $ne: null }
      }
    },
    { $group: { _id: null, promedio: { $avg: "$calificacion" } } }
  ]);
  const promedio = resultado[0]?.promedio
    ? Math.round(resultado[0].promedio * 10) / 10
    : 0;
  await Curso.findByIdAndUpdate(curso_id, { calificacion_promedio: promedio });
};

exports.createResena = async (req, res) => {
  try {
    const { curso_id, calificacion, comentario, leccion_id } = req.body;

    if (!curso_id) {
      return res.status(400).json({
        success: false,
        message: "curso_id es requerido"
      });
    }

    if (leccion_id !== undefined && leccion_id !== null) {
      if (!mongoose.isValidObjectId(leccion_id)) {
        return res.status(400).json({ success: false, message: "leccion_id invalido" });
      }
      const leccion = await Leccion.findById(leccion_id);
      if (!leccion) {
        return res.status(404).json({ success: false, message: "La leccion no existe" });
      }
      const Seccion = require("../models/Secciones");
      const seccion = await Seccion.findById(leccion.seccionID);
      if (!seccion || seccion.cursoID.toString() !== curso_id) {
        return res.status(400).json({ success: false, message: "La leccion no pertenece al curso indicado" });
      }
    }

    const tieneComentario = typeof comentario === "string" && comentario.trim() !== "";
    const tieneCalificacion = typeof calificacion === "number" && !Number.isNaN(calificacion);

    if (!tieneComentario && !tieneCalificacion) {
      return res.status(400).json({
        success: false,
        message: "Debes enviar al menos un comentario o una calificacion"
      });
    }

    if (tieneCalificacion && (calificacion < 1 || calificacion > 5)) {
      return res.status(400).json({
        success: false,
        message: "La calificacion debe estar entre 1 y 5"
      });
    }

    const inscripcion = await Inscripcion.findOne({
      estudiante_id: req.user.id,
      curso_id
    });
    if (!inscripcion) {
      return res.status(403).json({
        success: false,
        message: "Solo los estudiantes inscritos pueden dejar una resena"
      });
    }

    if (tieneCalificacion && !leccion_id) {
      const resenaConCalificacion = await Resena.findOne({
        estudiante_id: req.user.id,
        curso_id,
        leccion_id: null,
        calificacion: { $ne: null }
      });

      if (resenaConCalificacion) {
        const actualizada = await Resena.findByIdAndUpdate(
          resenaConCalificacion._id,
          {
            calificacion,
            ...(tieneComentario ? { comentario: comentario.trim() } : {})
          },
          { new: true, runValidators: true }
        );
        await recalcularPromedio(curso_id);
        return res.status(200).json({ success: true, resena: actualizada });
      }
    }

    const resena = new Resena({
      estudiante_id: req.user.id,
      curso_id,
      leccion_id: leccion_id || null,
      calificacion: tieneCalificacion ? calificacion : null,
      comentario: tieneComentario ? comentario.trim() : ""
    });

    const savedResena = await resena.save();
    await recalcularPromedio(curso_id);

    return res.status(201).json({ success: true, resena: savedResena });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getResenasByCurso = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const resenas = await Resena.find({ curso_id: id, leccion_id: null })
      .populate("estudiante_id", "nombre foto rol apellido")
      .sort("-createdAt");

    return res.status(200).json({ success: true, resenas });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getResenasByLeccion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const resenas = await Resena.find({ leccion_id: id })
      .populate("estudiante_id", "nombre foto rol apellido")
      .sort("-createdAt");

    return res.status(200).json({ success: true, resenas });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getResenaById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const resena = await Resena.findById(id)
      .populate("estudiante_id", "nombre foto rol apellido");
    if (!resena) {
      return res.status(404).json({ success: false, message: "Reseña no encontrada" });
    }

    return res.status(200).json({ success: true, resena });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateResena = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const resena = await Resena.findById(id);
    if (!resena) {
      return res.status(404).json({ success: false, message: "Reseña no encontrada" });
    }

    if (resena.estudiante_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Solo puedes modificar tus propias reseñas"
      });
    }

    const { calificacion, comentario } = req.body;

    if (calificacion !== undefined && calificacion !== null) {
      if (typeof calificacion !== "number" || calificacion < 1 || calificacion > 5) {
        return res.status(400).json({
          success: false,
          message: "La calificacion debe estar entre 1 y 5"
        });
      }
    }

    delete req.body.estudiante_id;
    delete req.body.curso_id;

    const campos = {};
    if (calificacion !== undefined) campos.calificacion = calificacion;
    if (typeof comentario === "string") campos.comentario = comentario.trim();

    const updatedResena = await Resena.findByIdAndUpdate(id, campos, {
      new: true,
      runValidators: true,
    });

    await recalcularPromedio(resena.curso_id);

    return res.status(200).json({ success: true, resena: updatedResena });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteResena = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const resena = await Resena.findById(id);
    if (!resena) {
      return res.status(404).json({ success: false, message: "Reseña no encontrada" });
    }

    if (resena.estudiante_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Solo puedes eliminar tus propias reseñas"
      });
    }

    const curso_id = resena.curso_id;
    await Resena.findByIdAndDelete(id);

    await recalcularPromedio(curso_id);

    return res.status(200).json({
      success: true,
      message: "Reseña eliminada correctamente"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
