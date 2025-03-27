const express = require("express");
const { register, validateEmail, login, updatePersonalData, updateCompanyData,  updateAutonomo } = require("../controllers/authController");
const authMiddleware = require("../middlewares/verificationToken");
const validateEmailCode = require("../validators/validateEmail");
const validateLogin = require("../validators/validateLogin"); 
const validatePersonalData = require("../validators/validatePersonalData");
const validateCompanyData = require("../validators/validateCompanyData");
const router = express.Router();

// Ruta para el registro de usuarios
router.post("/register", register);

router.put("/user/validation",authMiddleware, validateEmailCode, validateEmail);

// Ruta para login de usuario
router.post("/login", validateLogin, login);

// Ruta para actualizar los datos personales del usuario
router.put("/user/register", authMiddleware, validatePersonalData, updatePersonalData);

// Ruta para actualizar los datos de la compañía del usuario
router.patch("/user/company", authMiddleware, validateCompanyData, updateCompanyData);

// Ruta para actualizar si el usuario es autónomo (nuevo endpoint)
router.patch("/user/autonomo", authMiddleware, updateAutonomo);

module.exports = router;
