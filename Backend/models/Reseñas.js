const mongoose = require('mongoose');

const resenas = new mongoose.Schema({
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
  leccion_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Leccion',
    default: null
  },
  calificacion: {
    type: Number,
    required: false,
    default: null,
    min: [1, 'La calificación mínima es 1.'],
    max: [5, 'La calificación máxima es 5.']
  },
  comentario: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true 
});


const Resena = mongoose.model('Resenas', resenas);
module.exports = Resena;