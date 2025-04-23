const express = require("express");
const { 
  createClient, 
  updateClient, 
  getAllClients, 
  getClientById, 
  archiveClient, 
  deleteClient, 
  restoreClient 
} = require("../controllers/clientController");
const { 
  createClientValidator, 
  updateClientValidator, 
  clientIdValidator 
} = require("../validators/validateClient");
const authMiddleware = require("../middlewares/verificationToken");

const router = express.Router();

/**
 * @swagger
 * /api/client:
 *   post:
 *     summary: Crear un cliente
 *     description: Crea un nuevo cliente con nombre, correo electrónico y dirección.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 *       500:
 *         description: Error interno del servidor
 */
router.post("/client", authMiddleware, createClientValidator, createClient);

/**
 * @swagger
 * /api/client/{id}:
 *   put:
 *     summary: Actualizar un cliente
 *     description: Actualiza los datos de un cliente existente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente a actualizar
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cliente actualizado exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put("/client/:id", authMiddleware, updateClientValidator, clientIdValidator, updateClient);

/**
 * @swagger
 * /api/client:
 *   get:
 *     summary: Obtener todos los clientes
 *     description: Obtiene todos los clientes asociados al usuario autenticado.
 *     responses:
 *       200:
 *         description: Lista de clientes
 *       500:
 *         description: Error interno del servidor
 */
router.get("/client", authMiddleware, getAllClients);

/**
 * @swagger
 * /api/client/{id}:
 *   get:
 *     summary: Obtener un cliente específico
 *     description: Obtiene un cliente específico por ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get("/client/:id", authMiddleware, clientIdValidator, getClientById);

/**
 * @swagger
 * /api/client/{id}:
 *   delete:
 *     summary: Eliminar un cliente
 *     description: Elimina un cliente de la base de datos.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente a eliminar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente eliminado exitosamente
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete("/client/:id", authMiddleware, clientIdValidator, deleteClient);

/**
 * @swagger
 * /api/client/{id}/archive:
 *   patch:
 *     summary: Archivar un cliente
 *     description: Archiva un cliente (soft delete).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente a archivar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente archivado correctamente
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.patch("/client/:id/archive", authMiddleware, clientIdValidator, archiveClient);

/**
 * @swagger
 * /api/client/{id}/recover:
 *   patch:
 *     summary: Recuperar un cliente archivado
 *     description: Recupera un cliente archivado y lo restaura.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente a recuperar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente recuperado exitosamente
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.patch("/client/:id/recover", authMiddleware, clientIdValidator, restoreClient);

module.exports = router;
