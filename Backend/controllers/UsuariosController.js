const mongoose = require("mongoose");
const Usuario = require("../models/Usuarios");

exports.createUser = async (req, res) => {
  try {
    const { nombre, correo, password, rol } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({
        success: false,
        message: "Nombre, correo y contraseña son requeridos"
      });
    }

    if (rol && !["instructor", "estudiante"].includes(rol)) {
      return res.status(400).json({
        success: false,
        message: "El rol debe ser 'instructor' o 'estudiante'"
      });
    }

    const usuarioExistente = await Usuario.findOne({ correo: correo.toLowerCase() });
    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: "El correo electrónico ya está registrado"
      });
    }

    const user = new Usuario(req.body);
    const savedUser = await user.save();

    const { password: _, ...usuarioData } = savedUser.toObject();

    return res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      user: usuarioData
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "El correo electrónico ya está registrado"
      });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await Usuario.find().select("-password");
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const user = await Usuario.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUser = async (req, res) => {
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

    // Comparación segura entre ObjectId y string
    const userIdStr = req.user.id.toString();
    if (userIdStr !== id && req.user.rol !== 'instructor') {
      return res.status(403).json({
        success: false,
        message: "Solo puedes editar tu propio perfil"
      });
    }

    if (req.body.correo) {
      const usuarioConCorreo = await Usuario.findOne({
        correo: req.body.correo.toLowerCase(),
        _id: { $ne: id }
      });
      if (usuarioConCorreo) {
        return res.status(400).json({
          success: false,
          message: "El correo electrónico ya está registrado"
        });
      }
    }

    const updatedUser = await Usuario.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const deletedUser = await Usuario.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    return res.status(200).json({ success: true, message: "Usuario eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};