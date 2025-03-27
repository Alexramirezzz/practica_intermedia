const { body, validationResult } = require("express-validator");

const validateLogin = [
  // Validar que el email tenga el formato adecuado
  body("email")
    .isEmail()
    .withMessage("El email es inválido"),

  // Validar que la contraseña no esté vacía
  body("password")
    .notEmpty()
    .withMessage("La contraseña es requerida"),

  // Verificar los errores
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next(); // Si no hay errores, continuar con el siguiente middleware o función
  },
];

module.exports = validateLogin;
