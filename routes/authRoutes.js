const express = require("express");
const { register } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);  // Ruta para el registro de usuarios

module.exports = router;
