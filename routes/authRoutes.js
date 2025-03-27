const express = require("express");
const { register, validateEmail, login } = require("../controllers/authController");
const authMiddleware = require("../middlewares/verificationToken");
const validateEmailCode = require("../validators/validateEmail");  // Importar el validador
const validateLogin = require("../validators/validateLogin"); 
const router = express.Router();

// Ruta para el registro de usuarios
router.post("/register", register);

router.put("/user/validation",authMiddleware, validateEmailCode, validateEmail);

// Ruta para login de usuario
router.post("/login", validateLogin, login);  

module.exports = router;
