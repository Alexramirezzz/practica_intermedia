const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());  // Asegúrate de que los datos JSON puedan ser recibidos en el cuerpo

app.use("/api/auth", authRoutes);  // Rutas de autenticación

// Cambiar a puerto 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT} 🚀`);
});
