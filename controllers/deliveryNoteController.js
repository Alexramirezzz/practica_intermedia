const DeliveryNote = require("../models/DeliveryNote");
const Project = require("../models/Project");
const Client = require("../models/Clients");
const PDFDocument = require('pdfkit');
const path = require('path'); 
const fs = require('fs');
const { uploadFileToIPFS } = require("../utils/uploadToPinata");

// Crear un albarán (horas o materiales)
exports.createDeliveryNote = async (req, res) => {
  try {
    const { type, content, projectId, clientId } = req.body;
    const userId = req.user.id; // Obtener el ID del usuario autenticado

    // Verificar que el proyecto y el cliente existen y pertenecen al usuario
    const project = await Project.findOne({ _id: projectId, createdBy: userId });
    const client = await Client.findOne({ _id: clientId, createdBy: userId });
    
    if (!project || !client) {
      return res.status(404).json({ message: "Proyecto o cliente no encontrado o no autorizado" });
    }

    // Crear el albarán
    const newDeliveryNote = new DeliveryNote({
      projectId,
      userId,
      clientId,
      type,
      content,
    });

    await newDeliveryNote.save();
    return res.status(201).json({ message: "Albarán creado exitosamente", deliveryNote: newDeliveryNote });
  } catch (error) {
    console.error("Error al crear albarán:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener todos los albaranes
exports.getAllDeliveryNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const deliveryNotes = await DeliveryNote.find({ userId }).populate('projectId clientId');
    return res.status(200).json({ deliveryNotes });
  } catch (error) {
    console.error("Error al obtener los albaranes:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener un albarán específico
exports.getDeliveryNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const deliveryNote = await DeliveryNote.findOne({ _id: id, userId })
      .populate('projectId clientId');  // Llenar los campos referenciados
    
    if (!deliveryNote) {
      return res.status(404).json({ message: "Albarán no encontrado" });
    }
    
    return res.status(200).json({ deliveryNote });
  } catch (error) {
    console.error("Error al obtener el albarán:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Crear el PDF del albarán
exports.createDeliveryNotePDF = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const deliveryNote = await DeliveryNote.findOne({ _id: id, userId })
        .populate('projectId clientId');
      
      if (!deliveryNote) {
        return res.status(404).json({ message: "Albarán no encontrado" });
      }
  
      const doc = new PDFDocument();
  
      // Verificar si la carpeta 'pdfs' existe, y crearla si no
      const pdfDir = path.join(__dirname, '../pdfs');  // Ruta para la carpeta 'pdfs'
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });  // Crea la carpeta si no existe
      }
  
      // Define the output PDF file path
      const filePath = path.join(pdfDir, `deliveryNote_${id}.pdf`);
  
      doc.pipe(fs.createWriteStream(filePath));
  
      // Genera contenido en el PDF
      doc.fontSize(25).text('Albarán', { align: 'center' });
      doc.fontSize(18).text(`Cliente: ${deliveryNote.clientId.name}`);
      doc.text(`Proyecto: ${deliveryNote.projectId.name}`);
      doc.text(`Tipo: ${deliveryNote.type}`);
      doc.text(`Contenido: ${JSON.stringify(deliveryNote.content)}`);
      
      doc.end();
  
      // Aquí podrías agregar la lógica para subir el archivo PDF a IPFS o alguna nube
  
      return res.status(200).json({ message: "PDF generado", pdfUrl: filePath });
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  };

// Firmar un albarán (subir la firma a IPFS u otra nube)
exports.signDeliveryNote = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
  
      const deliveryNote = await DeliveryNote.findOne({ _id: id, userId });
      
      if (!deliveryNote) {
        return res.status(404).json({ message: "Albarán no encontrado" });
      }
      
      const file = req.file; // Suponiendo que la firma se pasa como archivo en la petición
      if (!file) {
        return res.status(400).json({ message: "Firma requerida" });
      }
  
      // Subir la firma a IPFS (usando Pinata)
      const signatureUrl = await uploadFileToIPFS(file);
  
      // Actualizar el albarán con la URL de la firma
      deliveryNote.signed = true;
      deliveryNote.signatureUrl = signatureUrl;
  
      await deliveryNote.save();
      return res.status(200).json({ message: "Albarán firmado correctamente", signatureUrl });
    } catch (error) {
      console.error("Error al firmar albarán:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  };
  
// Eliminar un albarán
exports.deleteDeliveryNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deliveryNote = await DeliveryNote.findOne({ _id: id, userId });
    
    if (!deliveryNote) {
      return res.status(404).json({ message: "Albarán no encontrado" });
    }

    if (deliveryNote.signed) {
      return res.status(400).json({ message: "No se puede eliminar un albarán firmado" });
    }

    await DeliveryNote.findByIdAndDelete(id); // <--- corrección aquí
    return res.status(200).json({ message: "Albarán eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar albarán:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

