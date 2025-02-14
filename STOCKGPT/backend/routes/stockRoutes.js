const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Ruta para obtener los artículos desde el archivo JSON
router.get("/articles", (req, res) => {
    try {
        const filePath = path.join(__dirname, "../data/articles.json");

        // Verifica si el archivo existe
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "El archivo de artículos no existe." });
        }

        // Lee y devuelve los datos del archivo JSON
        const data = fs.readFileSync(filePath, "utf-8");
        const articles = JSON.parse(data);
        res.json(articles);
    } catch (error) {
        console.error("Error al obtener los artículos:", error.message);
        res.status(500).json({ message: "Error al obtener los artículos." });
    }
});

// Ruta para actualizar la cantidad de un artículo
router.post("/articles/update", (req, res) => {
    const { id, quantity } = req.body;

    if (typeof id !== "number" || typeof quantity !== "number") {
        return res.status(400).json({ error: "Datos inválidos." });
    }

    try {
        const filePath = path.join(__dirname, "../data/articles.json");
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        const articleIndex = data.findIndex((article) => article.id === id);
        if (articleIndex === -1) {
            return res.status(404).json({ error: "Artículo no encontrado." });
        }

        data[articleIndex].quantity = quantity;

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        res.json({ message: "Cantidad actualizada correctamente." });
    } catch (error) {
        console.error("Error al actualizar el archivo JSON:", error.message);
        res.status(500).json({ error: "Error al actualizar el artículo." });
    }
});

// Ruta para finalizar el ingreso de stock
router.post("/finalize-stock", (req, res) => {
    try {
        const stockData = req.body;

        if (!Array.isArray(stockData) || stockData.length === 0) {
            return res.status(400).json({ message: "Los datos de stock enviados son inválidos." });
        }

        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}`;
        const fileName = `stock_${timestamp}.json`;
        const filePath = path.join(__dirname, "../data", fileName);

        fs.writeFileSync(filePath, JSON.stringify(stockData, null, 2));
        res.status(200).json({ message: "Stock finalizado con éxito.", fileName });
    } catch (error) {
        console.error("Error al procesar /finalize-stock:", error.message);
        res.status(500).json({ message: "Error al finalizar el stock." });
    }
});

// Ruta para confirmar el stock
router.post("/confirm-stock", (req, res) => {
    try {
        const stockData = req.body;

        if (!Array.isArray(stockData) || stockData.length === 0) {
            return res.status(400).json({ message: "Los datos de stock enviados son inválidos." });
        }

        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}`;
        const fileName = `stock_confirmed_${timestamp}.json`;
        const filePath = path.join(__dirname, "../data", fileName);

        fs.writeFileSync(filePath, JSON.stringify(stockData, null, 2));
        res.status(200).json({ message: "Stock confirmado con éxito.", fileName });
    } catch (error) {
        console.error("Error al procesar /confirm-stock:", error.message);
        res.status(500).json({ message: "Error al confirmar el stock." });
    }
});

module.exports = router;
