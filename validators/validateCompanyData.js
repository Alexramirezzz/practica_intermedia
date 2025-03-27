const { body, validationResult } = require("express-validator");

const validateCompanyData = [
  // Validar que el nombre de la compañía no esté vacío
  body("company.name")
    .notEmpty()
    .withMessage("El nombre de la compañía es requerido"),

  // Validar que el CIF tenga el formato adecuado
  body("company.cif")
    .matches(/^[A-Za-z]{1}[0-9]{8}$/)
    .withMessage("El CIF debe tener una letra seguida de 8 números"),

  // Validar que la dirección no esté vacía
  body("company.street")
    .notEmpty()
    .withMessage("La dirección de la compañía es requerida"),

  // Validar que el número de la dirección no esté vacío
  body("company.number")
    .isNumeric()
    .withMessage("El número de la dirección debe ser un número"),

  // Validar que el código postal sea un número
  body("company.postal")
    .isNumeric()
    .withMessage("El código postal debe ser un número"),

  // Validar que la ciudad no esté vacía
  body("company.city")
    .notEmpty()
    .withMessage("La ciudad es requerida"),

  // Validar que la provincia no esté vacía
  body("company.province")
    .notEmpty()
    .withMessage("La provincia es requerida"),

  // Verificar si hay errores
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next(); // Si no hay errores, continuar con el siguiente middleware o función
  },
];

module.exports = validateCompanyData;
