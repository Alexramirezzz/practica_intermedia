const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();  // Cargar variables de entorno (como el PINATA_JWT)

const uploadFileToIPFS = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype
    });

    console.log('Enviando a Pinata con JWT:', process.env.PINATA_JWT?.slice(0, 10)); // Muestra solo los primeros 10 caracteres del JWT para seguridad

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: Infinity,  // Permitir tamaños grandes para los archivos
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.PINATA_JWT}`  // El JWT de Pinata para autenticar
        }
      }
    );

    console.log('Respuesta de Pinata:', response.data);

    // Devolver la URL del logo en IPFS
    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  } catch (error) {
    console.error('Error al subir a IPFS:', error.response?.data || error.message);
    throw new Error('Fallo al subir a IPFS');
  }
};

module.exports = { uploadFileToIPFS };
