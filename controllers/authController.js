const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const uploadToPinata = require("../utils/uploadToPinata");  // Importamos la función para subir a Pinata
const path = require("path");
const fs = require("fs");

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

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email y contraseña son requeridos" });
  }

  try {
    // Buscar el usuario por el email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Comparar la contraseña proporcionada con la contraseña almacenada en la base de datos
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    // Generar el token JWT si las credenciales son correctas
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.status(200).json({
      message: "Login exitoso",
      token,
      user: { email: user.email, role: user.role, _id: user._id }
    });
  } catch (error) {
    console.error("Error al hacer login:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
// Función para actualizar los datos personales del usuario
exports.updatePersonalData = async (req, res) => {
  try {
    const { name, surnames, nif } = req.body;

    // Validar los datos recibidos
    if (!name || !surnames || !nif) {
      return res.status(422).json({ message: "Faltan datos requeridos (nombre, apellidos, NIF)" });
    }

    // Buscar al usuario por ID (proveniente del token)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Actualizar los datos del usuario
    user.name = name;
    user.surnames = surnames;
    user.nif = nif;

    // Guardar los cambios
    await user.save();

    return res.status(200).json({
      message: "Datos personales actualizados correctamente",
      user: {
        name: user.name,
        surnames: user.surnames,
        nif: user.nif,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Función para actualizar los datos de la compañía del usuario
exports.updateCompanyData = async (req, res) => {
  try {
    const { company } = req.body;
    
    // Validar los datos de la compañía
    if (!company || !company.name || !company.cif || !company.street || !company.number || !company.postal || !company.city || !company.province) {
      return res.status(422).json({ message: "Faltan datos requeridos de la compañía" });
    }

    // Buscar al usuario por ID (proveniente del token)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Si el usuario es autónomo, los datos de la compañía serán los mismos que los datos personales del usuario
    if (user.isAutonomo) {
      user.company = {
        name: user.name,  // Nombre del usuario
        cif: user.nif,    // NIF del usuario como CIF
        street: user.street || company.street,  // Dirección (si no está en el cuerpo, usamos la del usuario)
        number: user.number || company.number,  // Número (si no está en el cuerpo, usamos el del usuario)
        postal: user.postal || company.postal,  // Código postal (si no está en el cuerpo, usamos el del usuario)
        city: user.city || company.city,  // Ciudad (si no está en el cuerpo, usamos la del usuario)
        province: user.province || company.province,  // Provincia (si no está en el cuerpo, usamos la del usuario)
      };
    } else {
      // Si no es autónomo, actualizar los datos de la compañía proporcionados
      user.company = company;
    }

    // Guardar los cambios
    await user.save();

    return res.status(200).json({
      message: "Datos de la compañía actualizados correctamente",
      company: user.company,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};


// Función para actualizar si el usuario es autónomo
exports.updateAutonomo = async (req, res) => {
  try {
    const { isAutonomo } = req.body; // Recibir el valor de 'isAutonomo' desde el cuerpo de la solicitud

    if (typeof isAutonomo !== 'boolean') {
      return res.status(400).json({ message: "'isAutonomo' debe ser un valor booleano" });
    }

    // Buscar al usuario por ID (usando el ID del usuario que viene en el token)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Actualizar el campo isAutonomo
    user.isAutonomo = isAutonomo;

    // Guardar los cambios en la base de datos
    await user.save();

    return res.status(200).json({ message: "Campo 'isAutonomo' actualizado correctamente", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};



exports.getUser = async (req, res) => {
  try {
    // Buscar al usuario por ID usando el ID proporcionado en el token
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        _id: user._id,
        verified: user.verified,
        isAutonomo: user.isAutonomo, // Asegúrate de tener el campo isAutonomo en el modelo
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};


// Función para eliminar el usuario (hard o soft delete)
exports.deleteUser = async (req, res) => {
  try {
    const { soft } = req.query;  // Obtenemos el parámetro soft

    // Buscar al usuario por ID (proveniente del token)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Si es soft delete, actualizamos el campo 'deletedAt'
    if (soft === 'false') {
      user.deletedAt = Date.now();  // Marcamos el usuario como eliminado
      await user.save();
      return res.status(200).json({ message: "Usuario marcado como eliminado" });
    }

    // Si no es soft delete, procedemos con el hard delete
    await User.deleteOne({ _id: req.user.id });

    return res.status(200).json({ message: "Usuario eliminado permanentemente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};


// Función para recuperar la contraseña
exports.recoverPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validar que el email se haya proporcionado
    if (!email) {
      return res.status(400).json({ message: "El correo es requerido" });
    }

    // Buscar al usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Generar un token de recuperación
    const resetToken = generateToken(user); // Puede usar un token temporal

    // Aquí puedes enviar un correo al usuario con el token de recuperación
    // Este paso depende de la configuración del servicio de email

    return res.status(200).json({ message: "Correo de recuperación enviado", resetToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};


// Función para invitar a un compañero a la compañía
exports.inviteColleague = async (req, res) => {
  try {
    const { email } = req.body; // Correo electrónico del compañero a invitar

    // Validar que el correo esté presente
    if (!email) {
      return res.status(422).json({ message: "El correo es requerido" });
    }

    // Buscar al usuario que hace la invitación (usando el token)
    const inviter = await User.findById(req.user.id);
    if (!inviter) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar que el usuario tenga permiso para invitar (puede ser solo un "admin" o "owner")
    if (inviter.role !== "admin" && inviter.role !== "owner") {
      return res.status(403).json({ message: "No tienes permiso para invitar a compañeros" });
    }

    // Verificar si el compañero ya está registrado
    const invitedUser = await User.findOne({ email });
    if (invitedUser) {
      return res.status(409).json({ message: "El usuario ya está registrado" });
    }

    // Crear el nuevo usuario invitado con el rol "guest"
    const newUser = new User({
      email,
      role: "guest", // Rol "guest" para el invitado
      company: inviter.company, // Asignamos la misma compañía que el usuario que invita
    });

    await newUser.save();

    // Responder con éxito
    return res.status(201).json({
      message: "Compañero invitado correctamente",
      user: {
        email: newUser.email,
        role: newUser.role,
        _id: newUser._id,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};



