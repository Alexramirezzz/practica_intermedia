const { body, validationResult } = require("express-validator");

const validateEmail = [
  // Validar que el código tiene 6 dígitos numéricos
  body("code")
    .isNumeric()
    .withMessage("El código debe ser numérico")
    .isLength({ min: 6, max: 6 })
    .withMessage("El código debe tener exactamente 6 dígitos"),

  // Verificar los errores
  (req, res, next) => {
    const errors = validationResult(req); // Obtener los errores de la solicitud
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next(); // Si no hay errores, continuar con la siguiente función
  },
];

module.exports = validateEmail;
