const Client = require("../models/Clients");
const User = require("../models/User"); // Para comprobar al usuario

// Crear un nuevo cliente
exports.createClient = async (req, res) => {
  try {
    const { name, email, address } = req.body;
    const userId = req.user.id; // Obtener el ID del usuario autenticado

    // Comprobar si el cliente ya existe para este usuario
    const existingClient = await Client.findOne({ email, createdBy: userId });
    if (existingClient) {
      return res.status(409).json({ message: "El cliente ya está registrado" });
    }

    // Crear el nuevo cliente
    const newClient = new Client({
      name,
      email,
      address,
      createdBy: userId,
    });

    await newClient.save();
    return res.status(201).json({ message: "Cliente creado exitosamente", client: newClient });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Actualizar un cliente
exports.updateClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const { name, email, address } = req.body;
    const userId = req.user.id;

    // Verificar si el cliente pertenece al usuario actual
    const client = await Client.findOne({ _id: clientId, createdBy: userId });
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado o no autorizado" });
    }

    // Actualizar los datos del cliente
    client.name = name || client.name;
    client.email = email || client.email;
    client.address = address || client.address;

    await client.save();
    return res.status(200).json({ message: "Cliente actualizado correctamente", client });
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener todos los clientes del usuario
exports.getAllClients = async (req, res) => {
  try {
    const userId = req.user.id;

    const clients = await Client.find({ createdBy: userId, archived: false });
    return res.status(200).json({ clients });
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener un cliente específico
exports.getClientById = async (req, res) => {
  try {
    const clientId = req.params.id;
    const userId = req.user.id;

    const client = await Client.findOne({ _id: clientId, createdBy: userId });
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado o no autorizado" });
    }

    return res.status(200).json({ client });
  } catch (error) {
    console.error("Error al obtener el cliente:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Archivar un cliente (soft delete)
exports.archiveClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const userId = req.user.id;

    const client = await Client.findOne({ _id: clientId, createdBy: userId });
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado o no autorizado" });
    }

    client.archived = true;
    await client.save();

    return res.status(200).json({ message: "Cliente archivado correctamente", client });
  } catch (error) {
    console.error("Error al archivar el cliente:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Eliminar un cliente (hard delete)
exports.deleteClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const userId = req.user.id;

    const client = await Client.findOne({ _id: clientId, createdBy: userId });
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado o no autorizado" });
    }

    await client.remove();
    return res.status(200).json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el cliente:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Recuperar un cliente archivado
exports.restoreClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const userId = req.user.id;

    const client = await Client.findOne({ _id: clientId, createdBy: userId, archived: true });
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado o no archivado" });
    }

    client.archived = false;
    await client.save();

    return res.status(200).json({ message: "Cliente restaurado correctamente", client });
  } catch (error) {
    console.error("Error al restaurar el cliente:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
