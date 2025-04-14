const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const clientRoutes = require("./routes/clientRoutes");
const projectRoutes = require("./routes/projectRoutes");
const swaggerUi = require("swagger-ui-express")
const swaggerSpecs = require("./docs/swagger")

dotenv.config();  // Cargar las variables de entorno desde .env
connectDB();  // Conectar a la base de datos

const app = express();
app.use(cors());
app.use(express.json());  // Permite manejar JSON en las solicitudes

app.use("/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs)
  )


app.use("/api/auth", authRoutes);  // Rutas de autenticación

// Rutas de clientes
app.use("/api", clientRoutes);

// Rutas de proyectos
app.use("/api", projectRoutes);




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
