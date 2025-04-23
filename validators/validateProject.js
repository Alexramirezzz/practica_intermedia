const { body, param } = require('express-validator');

// Validador para la creación de un proyecto
exports.createProjectValidator = [
  body('name')
    .isString()
    .withMessage('El nombre del proyecto debe ser una cadena de texto'),
  
  body('description')
    .isString()
    .withMessage('La descripción del proyecto debe ser una cadena de texto'),
  
  body('clientId')
    .isMongoId()
    .withMessage('El clientId debe ser un ID válido de MongoDB'),
  
  body('createdBy')
    .isMongoId()
    .withMessage('El createdBy debe ser un ID válido de MongoDB')
];

// Validador para la actualización de un proyecto
exports.updateProjectValidator = [
  body('name')
    .optional()
    .isString()
    .withMessage('El nombre del proyecto debe ser una cadena de texto'),
  
  body('description')
    .optional()
    .isString()
    .withMessage('La descripción del proyecto debe ser una cadena de texto'),
  
  body('clientId')
    .optional()
    .isMongoId()
    .withMessage('El clientId debe ser un ID válido de MongoDB')
];

// Validador para el ID de un proyecto en las rutas
exports.projectIdValidator = [
  param('projectId')
    .isMongoId()
    .withMessage('El projectId debe ser un ID válido de MongoDB')
];
