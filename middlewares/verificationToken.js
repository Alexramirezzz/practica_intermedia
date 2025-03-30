const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];

  // Verificar que el token está presente
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  // Extraer el token del encabezado 'Authorization' (Bearer <token>)
  const bearerToken = token.split(' ')[1];

  // Verificar el token usando el secreto JWT
  jwt.verify(bearerToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token no válido' });
    }

    // Almacenar los datos decodificados en req.user para que estén disponibles en los controladores
    req.user = decoded;
    next();
  });
};

module.exports = authenticate;
