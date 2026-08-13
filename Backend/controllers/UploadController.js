const path = require("path");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");
const { CLOUDINARY_CLOUD_NAME } = require("../constants");
const Usuario = require("../models/Usuarios");
const Curso = require("../models/Cursos");

const usarCloudinary = Boolean(CLOUDINARY_CLOUD_NAME);

function urlGuardada(req) {
  // CloudinaryStorage deja la URL completa en req.file.path; disco local usa /images/<filename>
  if (req.file.path && /^https?:\/\//.test(req.file.path)) {
    return req.file.path;
  }
  return `/images/${req.file.filename}`;
}

function publicIdDesdeUrl(url) {
  // https://res.cloudinary.com/<cloud>/image/upload/v123/mentora/images/foto-abc.jpg
  // -> public_id: mentora/images/foto-abc
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/");
    const idx = parts.lastIndexOf("upload");
    if (idx === -1) return null;
    const publicId = parts.slice(idx + 1).join("/").replace(/\.[a-z0-9]+$/i, "");
    return publicId || null;
  } catch {
    return null;
  }
}

function borrarImagen(imagen) {
  if (!imagen) return;
  if (/^https?:\/\//.test(imagen)) {
    const publicId = publicIdDesdeUrl(imagen);
    if (publicId) {
      cloudinary.uploader.destroy(publicId, (err) => {
        if (err) console.error("Error al eliminar imagen en Cloudinary:", err);
      });
    }
    return;
  }
  if (imagen.startsWith("/images/")) {
    const filename = imagen.replace("/images/", "");
    const oldPath = path.join(__dirname, "..", "uploads", "images", filename);
    fs.unlink(oldPath, (err) => {
      if (err && err.code !== "ENOENT") {
        console.error("Error al eliminar archivo local:", err);
      }
    });
  }
}

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

    const url = urlGuardada(req);

    const usuario = await Usuario.findById(req.user.id);
    if (!usuario) {
      borrarImagen(url);
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    const fotoAnterior = usuario.foto;

    usuario.foto = url;
    await usuario.save();

    borrarImagen(fotoAnterior);

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
    borrarImagen(req.file && urlGuardada(req));
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

    const url = urlGuardada(req);

    return res.status(200).json({
      success: true,
      message: "Imagen subida correctamente. Usa esta URL en el campo 'imagen' del curso.",
      url
    });
  } catch (error) {
    borrarImagen(req.file && urlGuardada(req));
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

    const url = filename.startsWith("http")
      ? filename
      : `/images/${filename}`;

    const esMiFoto = await Usuario.findOne({ _id: req.user.id, foto: url });
    const esMiPortada = await Curso.findOne({ instructorID: req.user.id, imagen: url });

    if (!esMiFoto && !esMiPortada) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para eliminar este archivo"
      });
    }

    if (usarCloudinary) {
      const publicId = publicIdDesdeUrl(url);
      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: "No se pudo identificar el archivo en Cloudinary"
        });
      }
      await cloudinary.uploader.destroy(publicId);
    } else {
      const filePath = path.join(__dirname, "..", "uploads", "images", filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: "Archivo no encontrado"
        });
      }
      fs.unlinkSync(filePath);
    }

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
