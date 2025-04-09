const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: {
    street: String,
    city: String,
    postalCode: String,
    province: String,
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Referencia al usuario que creó el cliente
  archived: { type: Boolean, default: false }, // Campo para archivar el cliente
});

module.exports = mongoose.model("Client", clientSchema);
