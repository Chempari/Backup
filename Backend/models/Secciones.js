const mongoose = require("mongoose");
const secciones = new mongoose.Schema(
  {
    cursoID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Curso',
      required: true
    },
    titulo: {
      type: String,
      required: true,
      trim: true
    },
    orden: {
      type: Number,
      default: 0,
      min: 0
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Seccion", secciones);
