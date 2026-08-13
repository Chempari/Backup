const Curso = require("../models/Cursos");

exports.getDashboardInstructor = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "No autorizado" });
    }
    const Resena = require("../models/Reseñas");
    const cursos = await Curso.find({ instructorID: req.user.id })
      .select("titulo imagen nivel categoria precio publicado calificacion_promedio total_inscritos")
      .sort("-createdAt");
    const totalEstudiantes = cursos.reduce((sum, c) => sum + (c.total_inscritos || 0), 0);
    const cursosConCalificacion = cursos.filter(c => typeof c.calificacion_promedio === "number" && c.calificacion_promedio > 0);
    const promedioGlobal = cursosConCalificacion.length > 0
      ? Math.round((cursosConCalificacion.reduce((sum, c) => sum + c.calificacion_promedio, 0) / cursosConCalificacion.length) * 10) / 10
      : 0;
    const cursoIds = cursos.map(c => c._id);
    let comentariosRecientes = [];
    if (cursoIds.length > 0) {
      comentariosRecientes = await Resena.aggregate([
        { $match: { curso_id: { $in: cursoIds } } },
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        { $lookup: { from: "usuarios", localField: "estudiante_id", foreignField: "_id", as: "estudiante" } },
        { $lookup: { from: "cursos", localField: "curso_id", foreignField: "_id", as: "curso" } },
        { $unwind: { path: "$estudiante", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$curso", preserveNullAndEmptyArrays: true } },
        { $project: {
          _id: 1, comentario: 1, calificacion: 1, leccion_id: 1, createdAt: 1,
          estudiante_id: { _id: "$estudiante._id", nombre: "$estudiante.nombre", foto: "$estudiante.foto", rol: "$estudiante.rol" },
          curso: { _id: "$curso._id", titulo: "$curso.titulo" }
        } }
      ]);
    }
    return res.status(200).json({
      success: true,
      resumen: {
        total_cursos: cursos.length,
        cursos_publicados: cursos.filter(c => c.publicado).length,
        total_estudiantes: totalEstudiantes,
        calificacion_promedio_global: promedioGlobal
      },
      cursos: cursos.map(c => ({
        ...c.toObject(),
        total_inscritos: c.total_inscritos || 0,
        calificacion_promedio: c.calificacion_promedio || 0
      })),
      comentariosRecientes
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDashboardEstudiante = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "No autorizado" });
    }
    const Inscripcion = require("../models/Inscripciones");
    const inscripciones = await Inscripcion.find({ estudiante_id: req.user.id })
      .populate("curso_id", "titulo imagen nivel categoria precio instructorID")
      .populate({
        path: "curso_id",
        populate: { path: "instructorID", select: "nombre foto" }
      })
      .select("curso_id porcentaje fecha_inscripcion progreso")
      .sort("-fecha_inscripcion");
    const totalCursos = inscripciones.length;
    const cursosCompletados = inscripciones.filter(i => i.porcentaje === 100).length;
    const progresoPromedio = totalCursos > 0
      ? Math.round(inscripciones.reduce((sum, i) => sum + (i.porcentaje || 0), 0) / totalCursos)
      : 0;
    return res.status(200).json({
      success: true,
      resumen: {
        total_cursos: totalCursos,
        cursos_completados: cursosCompletados,
        progreso_promedio: progresoPromedio
      },
      inscripciones: inscripciones.map(i => ({
        ...i.toObject(),
        porcentaje: i.porcentaje || 0
      }))
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
