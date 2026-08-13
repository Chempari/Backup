const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const usuario = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    apellido:{
      type: String,
      required: true,
      trim: true
    },
    correo: {
      type: String,
      required:true,
      unique:true,
      lowercase:true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    rol: {
      type: String,
      enum: ["instructor","estudiante"],
      default: "estudiante"
    },
    biografia: {
      type: String,
      default : ""
    },
    foto:{
        type: String,
        default: null
    },
    redes_sociales: {
      facebook:  { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin:  { type: String, default: '' },
      github:    { type: String, default: '' },
      whatsapp:  { type: String, default: '' }
    },
    activo:{
        type: Boolean,
        default: true
    },
    createdAT:{
        type: Date,
        default: Date.now
    }

  },
  {
    timestamps: true,
  }
);

// Encriptar contraseña antes de guardar
usuario.pre("save", async function(next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
usuario.methods.compararPassword = async function(password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    // Hash legacy o corrupto: nunca romper el login con un 500
    return false;
  }
};

module.exports = mongoose.model("Usuario", usuario);
