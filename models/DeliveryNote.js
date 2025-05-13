const mongoose = require("mongoose");

const DeliveryNoteSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project', // Asociado a un proyecto
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Asociado a un usuario
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client', // Asociado a un cliente
    required: true
  },
  type: {
    type: String,
    enum: ['hours', 'materials'], // Tipo de albarán (horas o materiales)
    required: true
  },
  content: [{
    type: mongoose.Schema.Types.Mixed, // Contenido puede ser tanto horas como materiales
    required: true
  }],
  signed: {
    type: Boolean,
    default: false // Estado de firma del albarán
  },
  signatureUrl: {
    type: String, // URL de la firma si está firmada
  },
  pdfUrl: {
    type: String, // URL del PDF del albarán
  },
});

module.exports = mongoose.model("DeliveryNote", DeliveryNoteSchema);
