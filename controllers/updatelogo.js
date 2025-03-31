const { uploadFileToIPFS } = require('../utils/uploadToPinata');
const User = require('../models/User');

const updateLogo = async (req, res) => {
  try {
    // Asegúrate de que el archivo esté disponible
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
    }

    // Subir el archivo a IPFS y obtener la URL
    const ipfsUrl = await uploadFileToIPFS(file);

    // Actualizar el usuario con la URL del logo
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { logo: ipfsUrl },
      { new: true }
    );

    return res.status(200).json({
      message: 'Logo subido correctamente',
      logo: ipfsUrl,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error al subir logo:', error.message);
    return res.status(500).json({ error: 'Error al subir el logo' });
  }
};

module.exports = { updateLogo };

