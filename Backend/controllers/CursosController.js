const mongoose = require("mongoose");
const Curso = require("../models/Cursos");
const Seccion = require("../models/Secciones");
const Leccion = require("../models/Lecciones");
const Inscripcion = require("../models/Inscripciones");
const Resena = require("../models/Reseñas");

exports.createCurso = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }
    
    req.body.instructorID = req.user.id;

    const imagen = req.body.imagen;
    if (imagen && imagen.startsWith("data:")) {
      const sizeInBytes = Buffer.byteLength(imagen, "base64");
      if (sizeInBytes > 2 * 1024 * 1024) {
        return res.status(413).json({
          success: false,
          message: "La imagen excede el tamaño máximo de 2MB"
        });
      }
    }

    const curso = new Curso(req.body);
    const savedCurso = await curso.save();
    return res.status(201).json({ success: true, curso: savedCurso });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getCursos = async (req, res) => {
  try {
    const { titulo, categoria, nivel, instructorID, precio_min, precio_max } = req.query;
    const filter = {};

    if (!req.user || req.user.rol !== "instructor") {
      filter.publicado = true;
    }

    if (titulo) filter.titulo = { $regex: titulo, $options: "i" };
    if (categoria) filter.categoria = { $regex: categoria, $options: "i" };
    if (nivel) filter.nivel = nivel;
    if (instructorID && mongoose.isValidObjectId(instructorID)) {
      filter.instructorID = instructorID;
    }
    if (precio_min !== undefined || precio_max !== undefined) {
      filter.precio = {};
      if (precio_min !== undefined) filter.precio.$gte = Number(precio_min);
      if (precio_max !== undefined) filter.precio.$lte = Number(precio_max);
    }

    const cursos = await Curso.find(filter)
      .populate("instructorID", "nombre foto")
      .select("-__v");

    // Estandarizar respuesta y asegurar que instructorID exista
    const cursosEstandarizados = cursos.map(curso => ({
      ...curso.toObject(),
      instructorID: curso.instructorID ? {
        _id: curso.instructorID._id,
        nombre: curso.instructorID.nombre || 'Sin nombre',
        foto: curso.instructorID.foto || null
      } : null,
      total_inscritos: curso.total_inscritos || 0,
      calificacion_promedio: curso.calificacion_promedio || 0
    }));

    return res.status(200).json({ 
      success: true, 
      cursos: cursosEstandarizados,
      message: "Cursos obtenidos exitosamente"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCursoById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const curso = await Curso.findById(id)
      .populate("instructorID", "nombre biografia foto redes_sociales")
      .lean();

    if (!curso) {
      return res.status(404).json({ success: false, message: "Curso no encontrado" });
    }

    // Solo mostrar error 404 si el curso no está publicado Y el usuario NO es el instructor dueño
    const esInstructorDueño = req.user &&
      curso.instructorID && 
      curso.instructorID._id && 
      curso.instructorID._id.toString() === req.user.id;
    
    if (!curso.publicado && !esInstructorDueño) {
      return res.status(404).json({ success: false, message: "Curso no encontrado" });
    }

    const secciones = await Seccion.find({ cursoID: id })
      .sort("orden")
      .lean();

    const seccionIds = secciones.map(s => s._id);
    const lecciones = await Leccion.find({ seccionID: { $in: seccionIds } })
      .sort("orden")
      .lean();

    const seccionesConLecciones = secciones.map(seccion => ({
      ...seccion,
      lecciones: lecciones.filter(l =>
        l.seccionID.toString() === seccion._id.toString()
      )
    }));

    // Estandarizar instructorID y asegurar que exista
    const cursoEstandarizado = {
      ...curso,
      instructorID: curso.instructorID ? {
        _id: curso.instructorID._id,
        nombre: curso.instructorID.nombre || 'Sin nombre',
        biografia: curso.instructorID.biografia || '',
        foto: curso.instructorID.foto || null,
        redes_sociales: curso.instructorID.redes_sociales || []
      } : null,
      secciones: seccionesConLecciones,
      total_inscritos: curso.total_inscritos || 0,
      calificacion_promedio: curso.calificacion_promedio || 0
    };

    return res.status(200).json({
      success: true,
      curso: cursoEstandarizado,
      message: "Curso obtenido exitosamente"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCurso = async (req, res) => {
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

    const curso = await Curso.findById(id);
    if (!curso) {
      return res.status(404).json({ success: false, message: "Curso no encontrado" });
    }

    // Comparación segura entre ObjectId y string (updateCurso)
    const instructorIdStrUpdate = curso.instructorID ? curso.instructorID.toString() : null;
    if (instructorIdStrUpdate !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Solo el instructor dueño puede editar este curso"
      });
    }

    const imagen = req.body.imagen;
    if (imagen && imagen.startsWith("data:")) {
      const sizeInBytes = Buffer.byteLength(imagen, "base64");
      if (sizeInBytes > 2 * 1024 * 1024) {
        return res.status(413).json({
          success: false,
          message: "La imagen excede el tamaño máximo de 2MB"
        });
      }
    }

    delete req.body.instructorID;

    const updatedCurso = await Curso.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({ success: true, curso: updatedCurso });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.togglePublicado = async (req, res) => {
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

    const curso = await Curso.findById(id);
    if (!curso) {
      return res.status(404).json({ success: false, message: "Curso no encontrado" });
    }

    if (curso.instructorID.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Solo el instructor dueño puede publicar/despublicar este curso"
      });
    }

    curso.publicado = !curso.publicado;
    await curso.save();

    return res.status(200).json({
      success: true,
      message: `Curso ${curso.publicado ? "publicado" : "despublicado"} exitosamente`,
      curso
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCurso = async (req, res) => {
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

    const curso = await Curso.findById(id);
    if (!curso) {
      return res.status(404).json({ success: false, message: "Curso no encontrado" });
    }

    if (curso.instructorID.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Solo el instructor dueño puede eliminar este curso"
      });
    }

    const secciones = await Seccion.find({ cursoID: id });
    const seccionIds = secciones.map(s => s._id);

    await Promise.all([
      Leccion.deleteMany({ seccionID: { $in: seccionIds } }),
      Seccion.deleteMany({ cursoID: id }),
      Inscripcion.deleteMany({ curso_id: id }),
      Resena.deleteMany({ curso_id: id }),
    ]);

    await Curso.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: "Curso eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCategorias = async (req, res) => {
  try {
    const categorias = await Curso.distinct("categoria", { publicado: true, categoria: { $ne: null, $ne: "" } });
    const ordenadas = categorias.filter(Boolean).sort();
    return res.status(200).json({ success: true, categorias: ordenadas });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTendencia = async (req, res) => {
  try {
    const cursos = await Curso.find({ publicado: true, calificacion_promedio: { $gt: 0 } })
      .sort({ calificacion_promedio: -1 })
      .limit(5)
      .populate("instructorID", "nombre foto")
      .select("titulo imagen categoria nivel precio calificacion_promedio instructorID");
    
    return res.status(200).json({
      success: true,
      cursos: cursos.map(c => ({
        ...c.toObject(),
        instructorID: c.instructorID ? {
          _id: c.instructorID._id,
          nombre: c.instructorID.nombre || 'Sin nombre',
          foto: c.instructorID.foto || null
        } : null,
        total_inscritos: c.total_inscritos || 0,
        calificacion_promedio: c.calificacion_promedio || 0
      })),
      message: "Cursos en tendencia obtenidos"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInscritosConDetalles = async (req, res) => {
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

    const Resena = require("../models/Reseñas");
    
    const inscripciones = await Inscripcion.find({ curso_id: id })
      .populate("estudiante_id", "nombre correo foto")
      .select("estudiante_id fecha_inscripcion porcentaje");

    const inscritosConDetalles = await Promise.all(inscripciones.map(async (insc) => {
      const comentariosCount = await Resena.countDocuments({
        curso_id: id,
        estudiante_id: insc.estudiante_id._id
      });
      
      return {
        _id: insc._id,
        estudiante: {
          _id: insc.estudiante_id._id,
          nombre: insc.estudiante_id.nombre,
          correo: insc.estudiante_id.correo,
          foto: insc.estudiante_id.foto
        },
        fecha_inscripcion: insc.fecha_inscripcion,
        porcentaje: insc.porcentaje || 0,
        comentarios_count: comentariosCount
      };
    }));

    return res.status(200).json({
      success: true,
      inscritos: inscritosConDetalles,
      total: inscritosConDetalles.length
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
