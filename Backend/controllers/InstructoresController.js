const mongoose = require("mongoose");
const Usuario = require("../models/Usuarios");

exports.getInstructorPublico = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const user = await Usuario.findById(id);
    if (!user || user.rol !== "instructor") {
      return res.status(404).json({ success: false, message: "Instructor no encontrado" });
    }

    return res.status(200).json({
      success: true,
      instructor: {
        _id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        biografia: user.biografia || "",
        foto: user.foto || null,
        redes_sociales: user.redes_sociales || []
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
