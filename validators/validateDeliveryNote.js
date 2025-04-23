const { body, param } = require('express-validator');

// Validador para la creación de un albarán
exports.createDeliveryNoteValidator = [
  body('type')
    .isIn(['hours', 'materials'])
    .withMessage('El tipo de albarán debe ser "hours" o "materials"'),
  
  body('content')
    .isArray()
    .withMessage('El contenido debe ser un array'),
  
  body('projectId')
    .isMongoId()
    .withMessage('El projectId debe ser un ID válido de MongoDB'),

  body('clientId')
    .isMongoId()
    .withMessage('El clientId debe ser un ID válido de MongoDB')
];

// Validador para actualizar un albarán
exports.updateDeliveryNoteValidator = [
  body('name')
    .optional()
    .isString()
    .withMessage('El nombre debe ser una cadena de texto'),
  
  body('description')
    .optional()
    .isString()
    .withMessage('La descripción debe ser una cadena de texto'),
  
  body('clientId')
    .optional()
    .isMongoId()
    .withMessage('El clientId debe ser un ID válido de MongoDB'),
  
  body('projectId')
    .optional()
    .isMongoId()
    .withMessage('El projectId debe ser un ID válido de MongoDB')
];

// Validador para la firma de un albarán
exports.signDeliveryNoteValidator = [
  param('id')
    .isMongoId()
    .withMessage('El ID del albarán debe ser un ID válido de MongoDB'),

  body('signature')
    .notEmpty()
    .withMessage('La firma es requerida')
];
