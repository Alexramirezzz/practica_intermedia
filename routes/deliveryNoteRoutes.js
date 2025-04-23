const express = require("express");
const { 
  createDeliveryNote, 
  getAllDeliveryNotes, 
  getDeliveryNoteById, 
  createDeliveryNotePDF, 
  signDeliveryNote, 
  deleteDeliveryNote
} = require("../controllers/deliveryNoteController");

const { createDeliveryNoteValidator, signDeliveryNoteValidator } = require("../validators/validateDeliveryNote");
const authMiddleware = require("../middlewares/verificationToken");
const upload = require("../middlewares/upload");

const router = express.Router();

/**
 * @swagger
 * /api/deliverynote:
 *   post:
 *     summary: Crear un albarán
 *     description: Crea un nuevo albarán (horas o materiales) asociado a un proyecto y cliente.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [hours, materials]
 *               content:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     person:
 *                       type: string
 *                     hoursWorked:
 *                       type: integer
 *                     description:
 *                       type: string
 *               projectId:
 *                 type: string
 *               clientId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Albarán creado exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 */
router.post("/deliverynote", authMiddleware, createDeliveryNoteValidator, createDeliveryNote);

/**
 * @swagger
 * /api/deliverynote/{id}:
 *   get:
 *     summary: Obtener un albarán específico
 *     description: Obtiene un albarán específico utilizando su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Albarán encontrado
 *       404:
 *         description: Albarán no encontrado
 */
router.get("/deliverynote/:id", authMiddleware, getDeliveryNoteById);

/**
 * @swagger
 * /api/deliverynote/pdf/{id}:
 *   get:
 *     summary: Descargar el PDF de un albarán
 *     description: Genera y descarga el PDF del albarán utilizando su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF generado y listo para descargar
 *       404:
 *         description: Albarán no encontrado
 */
router.get("/deliverynote/pdf/:id", authMiddleware, createDeliveryNotePDF);

/**
 * @swagger
 * /api/deliverynote/{id}/sign:
 *   patch:
 *     summary: Firmar un albarán
 *     description: Subir una imagen de la firma a IPFS y actualizar el albarán con la URL de la firma.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               signature:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Albarán firmado correctamente
 *       400:
 *         description: Error al firmar el albarán
 */
router.patch("/deliverynote/:id/sign", authMiddleware, upload.single('signature'), signDeliveryNote);

/**
 * @swagger
 * /api/deliverynote/{id}:
 *   delete:
 *     summary: Eliminar un albarán
 *     description: Elimina un albarán de forma permanente si no está firmado.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Albarán eliminado correctamente
 *       400:
 *         description: El albarán no se puede eliminar porque está firmado
 */
router.delete("/deliverynote/:id", authMiddleware, deleteDeliveryNote);


module.exports = router;
