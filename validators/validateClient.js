const { body, param } = require('express-validator');

// Validador para la creación de un cliente
exports.createClientValidator = [
  body('name')
    .isString()
    .withMessage('El nombre del cliente debe ser una cadena de texto'),
  
  body('email')
    .isEmail()
    .withMessage('El correo electrónico del cliente debe ser válido'),
  
  body('address')
    .isString()
    .withMessage('La dirección del cliente debe ser una cadena de texto')
];

// Validador para la actualización de un cliente
exports.updateClientValidator = [
  body('name')
    .optional()
    .isString()
    .withMessage('El nombre del cliente debe ser una cadena de texto'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('El correo electrónico del cliente debe ser válido'),
  
  body('address')
    .optional()
    .isString()
    .withMessage('La dirección del cliente debe ser una cadena de texto')
];

// Validador para el ID de cliente en las rutas
exports.clientIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('El ID del cliente debe ser un ID válido de MongoDB')
];
