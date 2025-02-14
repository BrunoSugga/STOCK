const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const stockRoutes = require("./routes/stockRoutes");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use("/api", stockRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
