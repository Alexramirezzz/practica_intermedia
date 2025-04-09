const express = require("express");
const { createClient, updateClient, getAllClients, getClientById, archiveClient, deleteClient } = require("../controllers/clientController");

const authMiddleware = require("../middlewares/verificationToken");

const router = express.Router();

// Crear un cliente
router.post("/client", authMiddleware, createClient);

// Actualizar un cliente
router.put("/client/:id", authMiddleware, updateClient);

// Obtener todos los clientes
router.get("/client", authMiddleware, getAllClients);

// Obtener un cliente por ID
router.get("/client/:id", authMiddleware, getClientById);

// Archivar un cliente (soft delete)
router.patch("/client/:id/archive", authMiddleware, archiveClient);

// Eliminar un cliente (hard delete)
router.delete("/client/:id", authMiddleware, deleteClient);



module.exports = router;
