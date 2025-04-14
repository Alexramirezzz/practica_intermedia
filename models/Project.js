const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',  // Asociar proyecto con cliente
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Asociar proyecto con usuario
    required: true
  },
  isArchived: {
    type: Boolean,
    default: false  // Para soft delete
  }
});

const Project = mongoose.model('Project', ProjectSchema);
module.exports = Project;
