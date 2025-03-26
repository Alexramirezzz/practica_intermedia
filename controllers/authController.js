const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Función para generar el token JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1h", // El token expirará en 1 hora
  });
};

// Función de registro de usuario
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

    // Cifrar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser = new User({
      email,
      password: hashedPassword,
      verificationCode,
      verificationAttempts: process.env.EMAIL_VERIFICATION_ATTEMPTS || 3, // Intentos máximos de verificación
      role: "user",  // Rol por defecto
    });

    await newUser.save();

    // Responder con el token JWT y los datos del usuario
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

// Función para validar el email
exports.validateEmail = async (req, res) => {
  try {
    const { code } = req.body;

    // Validar que el código tenga 6 dígitos
    if (!code || code.length !== 6 || isNaN(code)) {
      return res.status(422).json({ message: "Código inválido, debe ser un número de 6 dígitos" });
    }

    // Buscar al usuario por ID (proveniente del JWT)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si el código recibido es el mismo que el almacenado
    if (user.verificationCode !== code) {
      return res.status(422).json({ message: "Código de verificación incorrecto" });
    }

    // Si el código es correcto, actualizar el estado de verificación
    user.verified = true;
    user.verificationCode = null;  // Limpiar el código de verificación
    await user.save();

    return res.status(200).json({
      message: "Email verificado exitosamente",
      acknowledged: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
