const mongoose = require("mongoose");

// Middleware pre-save para asegurar valores por defecto
const cursos = new mongoose.Schema(
  {
    instructorID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El curso debe tener un instructor asignado.'],
      validate: {
        validator: async function(valorId) {
            const usuario = await mongoose.model('Usuario').findById(valorId);
            return usuario && usuario.rol === 'instructor';
        },
      message: 'El ID proporcionado no pertenece a un usuario con el rol de "instructor".'
    }
        },
    titulo: {
      type: String,
      required: true,
      trim: true
    },
    descripcion: {
      type: String,
      default: ""
    },
    categoria: {
      type: String,
      default: ""
    },
    nivel: {
      type: String,
      enum: ["principiante", "intermedio", "avanzado"],
      default: "principiante"
    },
    precio: {
      type: Number,
      default: 0,
      min: 0
    },
    imagen: {
      type: String,
      default: ""
    },
    publicado: {
      type: Boolean,
      default: false
    },
    calificacion_promedio: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    total_inscritos: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
  }
);

// Asegurar que los campos numéricos siempre tengan valor
cursos.pre('save', function(next) {
  if (this.calificacion_promedio === undefined || this.calificacion_promedio === null) {
    this.calificacion_promedio = 0;
  }
  if (this.total_inscritos === undefined || this.total_inscritos === null) {
    this.total_inscritos = 0;
  }
  next();
});

module.exports = mongoose.model("Curso", cursos);
