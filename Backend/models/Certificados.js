const mongoose = require('mongoose');

const certificados = new mongoose.Schema({
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El ID del usuario es obligatorio.'],
    validate: {
      validator: async function(valorId) {
        const usuario = await mongoose.model('Usuario').findById(valorId);
        return usuario && usuario.rol === 'estudiante';
      },
      message: 'El ID proporcionado no pertenece a un estudiante.'
    }
  },
  curso_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Curso',
    required: [true, 'El ID del curso es obligatorio.']
  },
  inscripcion_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inscripciones',
    default: null
  },
  fecha_finalizacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

certificados.index({ usuario_id: 1, curso_id: 1 }, { unique: true });

module.exports = mongoose.model('Certificado', certificados);
