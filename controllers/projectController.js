const Project = require('../models/Project');  // Asegúrate de tener el modelo de Proyecto
const Client = require('../models/Clients');  // Modelo de Cliente

// Crear un proyecto
exports.createProject = async (req, res) => {
  try {
    const { name, description, clientId } = req.body;
    const userId = req.user.id;

    // Verificar si el cliente existe y pertenece al usuario
    const client = await Client.findOne({ _id: clientId, createdBy: userId });
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado o no autorizado" });
    }

    // Verificar si el proyecto ya existe para este usuario y cliente
    const existingProject = await Project.findOne({ name, createdBy: userId, clientId });
    if (existingProject) {
      return res.status(409).json({ message: "El proyecto ya existe para este usuario o cliente" });
    }

    // Crear el nuevo proyecto
    const newProject = new Project({
      name,
      description,
      clientId,
      createdBy: userId,
    });

    await newProject.save();
    return res.status(201).json({ message: "Proyecto creado exitosamente", project: newProject });
  } catch (error) {
    console.error("Error al crear proyecto:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};


// Actualizar un proyecto
exports.updateProject = async (req, res) => {
    try {
      const { name, description } = req.body;
      const projectId = req.params.projectId;
      const userId = req.user.id;
  
      // Verificar si el proyecto pertenece al usuario
      const project = await Project.findOne({ _id: projectId, createdBy: userId });
      if (!project) {
        return res.status(404).json({ message: "Proyecto no encontrado o no autorizado" });
      }
  
      // Actualizar los datos del proyecto
      project.name = name || project.name;
      project.description = description || project.description;
  
      await project.save();
      return res.status(200).json({ message: "Proyecto actualizado correctamente", project });
    } catch (error) {
      console.error("Error al actualizar proyecto:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  };

  
  // Obtener todos los proyectos del usuario
exports.getAllProjects = async (req, res) => {
    try {
      const userId = req.user.id;
  
      // Obtener proyectos que pertenecen al usuario
      const projects = await Project.find({ createdBy: userId });
      return res.status(200).json({ projects });
    } catch (error) {
      console.error("Error al obtener proyectos:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  };

  
  // Obtener un proyecto específico
exports.getProject = async (req, res) => {
    try {
      const projectId = req.params.projectId;
      const userId = req.user.id;
  
      // Verificar si el proyecto pertenece al usuario
      const project = await Project.findOne({ _id: projectId, createdBy: userId });
      if (!project) {
        return res.status(404).json({ message: "Proyecto no encontrado o no autorizado" });
      }
  
      return res.status(200).json({ project });
    } catch (error) {
      console.error("Error al obtener proyecto:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  };

  
  // Archivar un proyecto
exports.archiveProject = async (req, res) => {
    try {
      const projectId = req.params.projectId;
      const userId = req.user.id;
  
      // Verificar si el proyecto pertenece al usuario
      const project = await Project.findOne({ _id: projectId, createdBy: userId });
      if (!project) {
        return res.status(404).json({ message: "Proyecto no encontrado o no autorizado" });
      }
  
      // Archivar el proyecto
      project.isArchived = true;
      await project.save();
  
      return res.status(200).json({ message: "Proyecto archivado correctamente", project });
    } catch (error) {
      console.error("Error al archivar proyecto:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  };

  
  // Eliminar un proyecto (hard delete)
exports.deleteProject = async (req, res) => {
    try {
      const projectId = req.params.projectId;
      const userId = req.user.id;
  
      // Verificar si el proyecto pertenece al usuario
      const project = await Project.findOne({ _id: projectId, createdBy: userId });
      if (!project) {
        return res.status(404).json({ message: "Proyecto no encontrado o no autorizado" });
      }
  
      // Usar findByIdAndDelete para eliminar el proyecto
      await Project.findByIdAndDelete(projectId); // Usamos findByIdAndDelete en vez de remove
  
      return res.status(200).json({ message: "Proyecto eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar proyecto:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  };
  

  
  // Recuperar un proyecto archivado
exports.recoverProject = async (req, res) => {
    try {
      const projectId = req.params.projectId;
      const userId = req.user.id;
  
      // Verificar si el proyecto pertenece al usuario y está archivado
      const project = await Project.findOne({ _id: projectId, createdBy: userId, isArchived: true });
      if (!project) {
        return res.status(404).json({ message: "Proyecto no encontrado o no archivado" });
      }
  
      // Recuperar el proyecto
      project.isArchived = false;
      await project.save();
  
      return res.status(200).json({ message: "Proyecto recuperado correctamente", project });
    } catch (error) {
      console.error("Error al recuperar proyecto:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  };

  
