const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function (email) {
        return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
      },
      message: "Email inválido",
    },
  },
  password: { type: String, required: false },
  verified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationAttempts: { type: Number, default: 3 },
  role: { type: String, default: "user" },
  name: { type: String },  // Nombre del usuario
  surnames: { type: String },  // Apellidos del usuario
  nif: { type: String },  // NIF del usuario
  logo: { type: String },  // URL del logo de la empresa o usuario (subido a la nube o almacenado localmente)
  isAutonomo: { type: Boolean, default: false },  // Campo para indicar si el usuario es autónomo
  company: {
    name: { type: String },  // Nombre de la compañía
    cif: { type: String },   // CIF de la compañía
    street: { type: String },  // Dirección de la compañía
    number: { type: Number },  // Número de la dirección
    postal: { type: Number },  // Código postal
    city: { type: String },  // Ciudad
    province: { type: String },  // Provincia
  },
});

// Cifrar la contraseña antes de guardar
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", UserSchema);
