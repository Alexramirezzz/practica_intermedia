const { body, validationResult } = require("express-validator");

const validatePersonalData = [
  // Validar que el nombre no esté vacío
  body("name")
    .notEmpty()
    .withMessage("El nombre es requerido"),

  // Validar que los apellidos no estén vacíos
  body("surnames")
    .notEmpty()
    .withMessage("Los apellidos son requeridos"),

  // Validar que el NIF tenga el formato adecuado (en este caso, un NIF de 8 dígitos + letra)
  body("nif")
    .matches(/^[0-9]{8}[A-Za-z]$/)
    .withMessage("El NIF debe tener 8 dígitos seguidos de una letra"),

  // Verificar si hay errores
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next(); // Si no hay errores, continuar con el siguiente middleware o función
  },
];

module.exports = validatePersonalData;
