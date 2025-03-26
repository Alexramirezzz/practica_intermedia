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
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationAttempts: { type: Number, default: 3 },
  role: { type: String, default: "user" },
});

// Cifrar la contraseña antes de guardar
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", UserSchema);

