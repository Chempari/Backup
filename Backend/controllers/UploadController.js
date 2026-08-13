const path = require("path");
const fs = require("fs");
const Usuario = require("../models/Usuarios");
const Curso = require("../models/Cursos");

exports.subirFotoPerfil = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se envió ningún archivo"
      });
    }

    const url = `/images/${req.file.filename}`;

    const usuario = await Usuario.findById(req.user.id);
    if (!usuario) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    const fotoAnterior = usuario.foto;

    usuario.foto = url;
    await usuario.save();

    if (fotoAnterior && fotoAnterior.startsWith("/images/")) {
      const filename = fotoAnterior.replace("/images/", "");
      const oldPath = path.join(__dirname, "..", "uploads", "images", filename);
      fs.unlink(oldPath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("Error al eliminar foto anterior:", err);
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Foto de perfil actualizada correctamente",
      url,
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        foto: usuario.foto
      }
    });
  } catch (error) {
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
    return res.status(500).json({
      success: false,
      message: "Error al subir foto de perfil",
      error: error.message
    });
  }
};

exports.subirPortadaCurso = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se envió ningún archivo"
      });
    }

    const url = `/images/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: "Imagen subida correctamente. Usa esta URL en el campo 'imagen' del curso.",
      url
    });
  } catch (error) {
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
    return res.status(500).json({
      success: false,
      message: "Error al subir imagen",
      error: error.message
    });
  }
};

exports.eliminarArchivo = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }
    
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: "Nombre de archivo requerido"
      });
    }

    const url = `/images/${filename}`;

    const esMiFoto = await Usuario.findOne({ _id: req.user.id, foto: url });
    const esMiPortada = await Curso.findOne({ instructorID: req.user.id, imagen: url });

    if (!esMiFoto && !esMiPortada) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para eliminar este archivo"
      });
    }

    const filePath = path.join(__dirname, "..", "uploads", "images", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Archivo no encontrado"
      });
    }

    fs.unlinkSync(filePath);

    if (esMiFoto) {
      await Usuario.findByIdAndUpdate(req.user.id, { foto: null });
    }

    return res.status(200).json({
      success: true,
      message: "Archivo eliminado correctamente"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al eliminar archivo",
      error: error.message
    });
  }
};
