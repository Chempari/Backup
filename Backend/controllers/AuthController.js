const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuarios");
const { JWT_SECRET, JWT_EXPIRATION } = require('../constants');
const { validateSocialUrl, normalizeRedes, PLATFORMS } = require('../utils/socialValidators');

// Controlador de registro de nuevos usuarios
exports.register = async (req, res) => {
  try {
    const { nombre,apellido, correo, password, rol } = req.body;

    if (!nombre || !apellido || !correo || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre,,apellido, correo y contraseña son requeridos'
      });
    }

    if (rol && !['instructor', 'estudiante'].includes(rol)) {
      return res.status(400).json({
        success: false,
        message: "El rol debe ser 'instructor' o 'estudiante'"
      });
    }

    if (!correo.toLowerCase().endsWith('@gmail.com')) {
      return res.status(400).json({
        success: false,
        message: 'Solo se permiten correos de Gmail (@gmail.com)'
      });
    }

    const usuarioExistente = await Usuario.findOne({ correo: correo.toLowerCase() });
    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico ya está registrado'
      });
    }

    const usuario = new Usuario({
      nombre,
      apellido,
      correo: correo.toLowerCase(),
      password,
      rol: rol || 'estudiante'
    });

    const savedUsuario = await usuario.save();

    const token = jwt.sign(
      { 
        id: savedUsuario._id, 
        correo: savedUsuario.correo, 
        rol: savedUsuario.rol,
        nombre: savedUsuario.nombre
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    const { password: _, ...usuarioData } = savedUsuario.toObject();

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        usuario: usuarioData,
        token,
        expiresIn: JWT_EXPIRATION
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico ya está registrado'
      });
    }
    console.error('Error en registro:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        success: false,
        message: 'Correo y contraseña son requeridos'
      });
    }

    const usuario = await Usuario.findOne({ correo: correo.toLowerCase() });
    
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        success: false,
        message: 'Usuario inactivo. Contacte al administrador'
      });
    }

    const passwordValido = await usuario.compararPassword(password);
    
    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const token = jwt.sign(
      { 
        id: usuario._id, 
        correo: usuario.correo, 
        rol: usuario.rol,
        nombre: usuario.nombre
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    const { password: _, ...usuarioData } = usuario.toObject();

    return res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: {
        usuario: usuarioData,
        token,
        expiresIn: JWT_EXPIRATION
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }
    
    const usuario = await Usuario.findById(req.user.id).select('-password');
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    return res.status(200).json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }
    
    const usuario = await Usuario.findById(req.user.id);
    
    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no válido o inactivo'
      });
    }

    const token = jwt.sign(
      { 
        id: usuario._id, 
        correo: usuario.correo, 
        rol: usuario.rol,
        nombre: usuario.nombre
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    return res.status(200).json({
      success: true,
      message: 'Token renovado exitosamente',
      data: {
        token,
        expiresIn: JWT_EXPIRATION
      }
    });
  } catch (error) {
    console.error('Error al renovar token:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }
    
    const camposPermitidos = ['nombre', 'biografia', 'foto', 'redes_sociales'];
    const datosActualizar = {};

    for (const campo of camposPermitidos) {
      if (req.body[campo] !== undefined) {
        datosActualizar[campo] = req.body[campo];
      }
    }

    if (datosActualizar.redes_sociales !== undefined) {
      const redes = normalizeRedes(datosActualizar.redes_sociales);
      for (const p of PLATFORMS) {
        const error = validateSocialUrl(p, redes[p]);
        if (error) {
          return res.status(400).json({ success: false, message: `Redes sociales (${p}): ${error}` });
        }
      }
      datosActualizar.redes_sociales = redes;
    }

    if (req.body.correo) {
      if (!req.body.correo.toLowerCase().endsWith('@gmail.com')) {
        return res.status(400).json({
          success: false,
          message: 'Solo se permiten correos de Gmail (@gmail.com)'
        });
      }
      const usuarioConCorreo = await Usuario.findOne({
        correo: req.body.correo.toLowerCase(),
        _id: { $ne: req.user.id }
      });
      if (usuarioConCorreo) {
        return res.status(400).json({
          success: false,
          message: 'El correo electrónico ya está registrado'
        });
      }
      datosActualizar.correo = req.body.correo.toLowerCase();
    }

    if (Object.keys(datosActualizar).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos válidos para actualizar'
      });
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.user.id,
      datosActualizar,
      { new: true, runValidators: true }
    ).select('-password');

    if (!usuarioActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: usuarioActualizado
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico ya está registrado'
      });
    }
    console.error('Error al actualizar perfil:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};