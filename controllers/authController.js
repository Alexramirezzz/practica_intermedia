const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({ message: "Campos requeridos" });
    }

    // Validar que el email tenga el formato adecuado
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email inválido" });
    }

    // Validar la longitud de la contraseña
    if (password.length < 8) {
      return res.status(400).json({ message: "Contraseña demasiado corta" });
    }

    // Comprobar si el email ya está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    // Generar un código de verificación aleatorio
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Crear nuevo usuario
    const newUser = new User({
      email,
      password,
      verificationCode,
      verificationAttempts: process.env.EMAIL_VERIFICATION_ATTEMPTS || 3, // Máximos intentos de verificación
    });

    await newUser.save();

    // Responder con los datos del usuario y el token JWT
    return res.status(201).json({
      token: generateToken(newUser),
      user: {
        email: newUser.email,
        verified: newUser.verified,
        role: newUser.role,
        _id: newUser._id,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
