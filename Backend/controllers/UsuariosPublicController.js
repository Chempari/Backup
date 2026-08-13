const mongoose = require('mongoose');
const Usuario = require('../models/Usuarios');
const Curso = require('../models/Cursos');
const Inscripcion = require('../models/Inscripciones');

exports.getUsuarioPublico = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'ID invalido' });
    }

    const usuario = await Usuario.findById(id).select('-password -correo');
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    let cursos = [];
    let totalCursos = 0;
    if (usuario.rol === 'instructor') {
      cursos = await Curso.find({ instructorID: id, publicado: true })
        .select('titulo imagen categoria nivel precio calificacion_promedio')
        .sort('-createdAt');
      totalCursos = cursos.length;
    } else if (usuario.rol === 'estudiante') {
      const inscripciones = await Inscripcion.find({ estudiante_id: id }).populate(
        'curso_id',
        'titulo imagen categoria nivel'
      );
      cursos = inscripciones
        .map((i) => i.curso_id)
        .filter(Boolean);
      totalCursos = cursos.length;
    }

    const redes = usuario.redes_sociales && !Array.isArray(usuario.redes_sociales)
      ? usuario.redes_sociales
      : { facebook: '', instagram: '', linkedin: '', github: '', whatsapp: '' };

    return res.status(200).json({
      success: true,
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        foto: usuario.foto,
        biografia: usuario.biografia,
        rol: usuario.rol,
        redes_sociales: redes,
        createdAt: usuario.createdAt
      },
      cursos,
      totalCursos
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
