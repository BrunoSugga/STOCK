const express = require("express");
const { generatePrediction } = require("../controllers/predictionController");

const router = express.Router();

// Ruta para generar predicción y archivo Excel
router.get("/generate", generatePrediction);

module.exports = router;
