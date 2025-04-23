const express = require("express");
const {
  createProject,
  updateProject,
  getAllProjects,
  getProject,
  deleteProject,
  archiveProject,
  recoverProject
} = require("../controllers/projectController");
const authMiddleware = require("../middlewares/verificationToken");

const router = express.Router();

/**
 * @swagger
 * /api/project:
 *   post:
 *     summary: Crear un proyecto
 *     description: Crea un nuevo proyecto asociado a un cliente y un usuario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               clientId:
 *                 type: string
 *               createdBy:
 *                 type: string
 *     responses:
 *       201:
 *         description: Proyecto creado exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 *       500:
 *         description: Error interno del servidor
 */
router.post("/project", authMiddleware, createProject);

/**
 * @swagger
 * /api/project/{projectId}:
 *   put:
 *     summary: Actualizar un proyecto
 *     description: Actualiza un proyecto existente con un nuevo nombre o descripción.
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: ID del proyecto a actualizar
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
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Proyecto actualizado exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 *       404:
 *         description: Proyecto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put("/project/:projectId", authMiddleware, updateProject);

/**
 * @swagger
 * /api/project:
 *   get:
 *     summary: Obtener todos los proyectos
 *     description: Obtiene todos los proyectos asociados al usuario autenticado.
 *     responses:
 *       200:
 *         description: Lista de proyectos
 *       500:
 *         description: Error interno del servidor
 */
router.get("/project", authMiddleware, getAllProjects);

/**
 * @swagger
 * /api/project/{projectId}:
 *   get:
 *     summary: Obtener un proyecto específico
 *     description: Obtiene un proyecto específico asociado al usuario autenticado.
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: ID del proyecto a obtener
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto encontrado
 *       404:
 *         description: Proyecto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get("/project/:projectId", authMiddleware, getProject);

/**
 * @swagger
 * /api/project/{projectId}:
 *   delete:
 *     summary: Eliminar un proyecto
 *     description: Elimina un proyecto permanentemente.
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: ID del proyecto a eliminar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto eliminado exitosamente
 *       404:
 *         description: Proyecto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete("/project/:projectId", authMiddleware, deleteProject);

/**
 * @swagger
 * /api/project/{projectId}/archive:
 *   patch:
 *     summary: Archivar un proyecto
 *     description: Archiva un proyecto (soft delete).
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: ID del proyecto a archivar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto archivado correctamente
 *       404:
 *         description: Proyecto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.patch("/project/:projectId/archive", authMiddleware, archiveProject);

/**
 * @swagger
 * /api/project/{projectId}/recover:
 *   patch:
 *     summary: Recuperar un proyecto archivado
 *     description: Recupera un proyecto archivado.
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         description: ID del proyecto a recuperar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto recuperado exitosamente
 *       404:
 *         description: Proyecto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.patch("/project/:projectId/recover", authMiddleware, recoverProject);

module.exports = router;

