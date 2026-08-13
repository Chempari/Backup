const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const { CLOUDINARY_CLOUD_NAME } = require("../constants");

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Solo se permiten imágenes (JPG, JPEG, PNG, WEBP, GIF)"), false);
  }
  cb(null, true);
};

const limits = { fileSize: 2 * 1024 * 1024 };

// Si no hay credenciales de Cloudinary (desarrollo local), cae a disco
const usarCloudinary = Boolean(CLOUDINARY_CLOUD_NAME);

let storage;
if (usarCloudinary) {
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "mentora/images",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
      public_id: (req, file) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        return `${file.fieldname}-${uniqueSuffix}`;
      }
    }
  });
} else {
  const uploadDir = path.join(__dirname, "..", "uploads", "images");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) return cb(err);
        cb(null, buf.toString("hex") + path.extname(file.originalname).toLowerCase());
      });
    }
  });
}

const upload = multer({
  storage,
  fileFilter,
  limits
});

const handleUpload = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          success: false,
          message: "La imagen excede el tamaño máximo de 2MB"
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

module.exports = { upload, handleUpload };
