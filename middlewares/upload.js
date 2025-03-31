const multer = require('multer');

// Usamos la memoria para almacenar los archivos antes de enviarlos a IPFS
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
