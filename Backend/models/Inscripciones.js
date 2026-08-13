const mongoose = require('mongoose');
const progreso = new mongoose.Schema({
  leccion_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Leccion', 
    required: [true, 'El ID de la lección es obligatorio.']
  },
  completada: {
    type: Boolean,
    default: false
  }
}, { _id: false });


const inscripciones = new mongoose.Schema({
  estudiante_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El ID del estudiante es obligatorio.'],
    validate: {
      validator: async function(valorId) {
        const usuario = await mongoose.model('Usuario').findById(valorId);
        return usuario && usuario.rol === 'estudiante';
      },
      message: 'El ID proporcionado no pertenece a un usuario con el rol de "estudiante".'
    }
  },
  curso_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Curso',
    required: [true, 'El ID del curso es obligatorio.']
  },

  progreso: [progreso], 
  porcentaje: {
    type: Number,
    default: 0,
    min: [0, 'El porcentaje no puede ser menor a 0.'],
    max: [100, 'El porcentaje no puede ser mayor a 100.']
  },
  fecha_inscripcion: {
    type: Date,
    default: Date.now 
  }
});


const Inscripcion = mongoose.model('Inscripciones', inscripciones);
module.exports = Inscripcion;