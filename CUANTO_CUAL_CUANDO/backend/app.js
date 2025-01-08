const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");

// Configuración de entorno
dotenv.config();

// Conectar con MongoDB
connectDB();

// Inicializar la aplicación
const app = express();
app.use(bodyParser.json());

// Importar rutas
const predictionRoutes = require("./routes/predictionRoutes");

// Middleware para rutas
app.use("/api/predictions", predictionRoutes);

// Ruta raíz
app.get("/", (req, res) => {
  res.send("API de CUÁL CUÁNTO CUÁNDO en funcionamiento.");
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`.green.bold);
});
