const authMiddleware = require('./authMiddleware');

const checkRoles = (rolesPermitidos) => {

  if (!Array.isArray(rolesPermitidos) || rolesPermitidos.length === 0) {
    throw new Error('rolesPermitidos debe ser un array no vacío de roles');
  }

  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const rolUsuario = req.user.rol;

      if (!rolesPermitidos.includes(rolUsuario)) {
        return res.status(403).json({
          success: false,
          message: `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}`,
          tuRol: rolUsuario
        });
      }

      next();
    } catch (error) {
      console.error('Error en checkRoles:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en la verificación de roles',
        error: error.message
      });
    }
  };
};

const esInstructor = checkRoles(['instructor']);
const esEstudiante = checkRoles(['estudiante']);
const esInstructorOEstudiante = checkRoles(['instructor', 'estudiante']);

module.exports = {
  checkRoles,
  esInstructor,
  esEstudiante,
  esInstructorOEstudiante
};
