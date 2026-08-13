const mongoose = require('mongoose');
const Certificado = require('../models/Certificados');
const Inscripcion = require('../models/Inscripciones');

exports.emitirCertificado = async (req, res) => {
  try {
    const { curso_id } = req.body;
    if (!curso_id) {
      return res.status(400).json({ success: false, message: 'curso_id es requerido' });
    }
    if (!mongoose.isValidObjectId(curso_id)) {
      return res.status(400).json({ success: false, message: 'curso_id invalido' });
    }

    const inscripcion = await Inscripcion.findOne({
      estudiante_id: req.user.id,
      curso_id
    });
    if (!inscripcion) {
      return res.status(403).json({ success: false, message: 'No estas inscrito en este curso' });
    }
    if (inscripcion.porcentaje < 100) {
      return res.status(400).json({ success: false, message: 'Debes completar el 100% del curso para obtener el certificado' });
    }

    let certificado = await Certificado.findOne({ usuario_id: req.user.id, curso_id });
    if (!certificado) {
      certificado = await Certificado.create({
        usuario_id: req.user.id,
        curso_id,
        inscripcion_id: inscripcion._id,
        fecha_finalizacion: new Date()
      });
    }

    const data = await Certificado.findById(certificado._id)
      .populate('usuario_id', 'nombre apellido')
      .populate('curso_id', 'titulo');

    return res.status(201).json({ success: true, certificado: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMisCertificados = async (req, res) => {
  try {
    const certificados = await Certificado.find({ usuario_id: req.user.id })
      .populate('curso_id', 'titulo imagen categoria nivel')
      .sort('-fecha_finalizacion');

    return res.status(200).json({ success: true, certificados });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCertificadoById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'ID invalido' });
    }
    const certificado = await Certificado.findById(id)
      .populate('usuario_id', 'nombre apellido')
      .populate('curso_id', 'titulo categoria nivel');

    if (!certificado) {
      return res.status(404).json({ success: false, message: 'Certificado no encontrado' });
    }

    return res.status(200).json({ success: true, certificado });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
