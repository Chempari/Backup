const mongoose = require("mongoose");
const lecciones = new mongoose.Schema(
  {
    seccionID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seccion',
      required: true
    },
    titulo: {
      type: String,
      required: true,
      trim: true
    },
    descripcion: {
      type: String,
      trim:true
    },
    url:{
        type:String,
        required: true,
        trim:true
    },
    duracion:{
        type:Number,
        default: 0,
        min: 0
    },
    orden:{
        type: Number,
        default: 0,
        min: 0
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Leccion", lecciones);
