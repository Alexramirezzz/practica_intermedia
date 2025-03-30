const multer = require("multer");
const path = require("path");

// Configuración de almacenamiento para las imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/logos/");  // Carpeta donde se guardarán los logos localmente
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);  // Obtener la extensión del archivo
    const fileName = Date.now() + ext;  // Nombre único para la imagen
    cb(null, fileName);
  }
});

// Filtro para verificar el tipo de archivo (solo imágenes)
const fileFilter = (req, file, cb) => {
  const validTypes = ["image/jpeg", "image/png", "image/gif"];
  if (validTypes.includes(file.mimetype)) {
    cb(null, true);  // Aceptar el archivo
  } else {
    cb(new Error("Solo se permiten imágenes JPEG, PNG o GIF."), false);  // Rechazar el archivo
  }
};

// Configurar el tamaño máximo del archivo (por ejemplo, 2 MB)
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },  // Tamaño máximo de 2 MB
  fileFilter: fileFilter
});

module.exports = upload;
