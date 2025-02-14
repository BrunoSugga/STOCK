const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { getArticles, updateArticle, finalizeStock, generateExcel } = require("../services/stockService");

// Ruta para obtener todos los artículos
router.get("/articles", async (req, res) => {
    try {
        const articles = await getArticles();
        res.json(articles);
    } catch (error) {
        console.error("Error fetching articles:", error);
        res.status(500).json({ error: "Error al obtener los artículos" });
    }
});

// Ruta para actualizar la cantidad de un artículo
router.post("/articles/update", async (req, res) => {
    const { id, quantity } = req.body;
    if (!id || quantity === undefined) {
        return res.status(400).json({ error: "ID y cantidad son requeridos" });
    }

    try {
        await updateArticle(id, quantity);
        res.json({ message: "Cantidad actualizada con éxito" });
    } catch (error) {
        console.error("Error updating article:", error);
        res.status(500).json({ error: "Error al actualizar el artículo" });
    }
});

// Ruta para finalizar ingreso
router.post("/finalize-stock", async (req, res) => {
    const articles = req.body;

    if (!Array.isArray(articles) || articles.length === 0) {
        return res.status(400).json({ error: "Datos de artículos inválidos" });
    }

    try {
        const message = await finalizeStock(articles);
        res.json({ message });
    } catch (error) {
        console.error("Error finalizing stock:", error);
        res.status(500).json({ error: "Error al finalizar el ingreso" });
    }
});

// Ruta para confirmar stock y generar un archivo JSON
router.post("/confirm-stock", async (req, res) => {
    const articles = req.body;

    if (!Array.isArray(articles) || articles.length === 0) {
        return res.status(400).json({ error: "Datos de artículos inválidos" });
    }

    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filePath = path.join(__dirname, `../data/stock-${timestamp}.json`);
        fs.writeFileSync(filePath, JSON.stringify(articles, null, 2));
        res.json({ message: "Stock confirmado y JSON generado", filePath });
    } catch (error) {
        console.error("Error confirming stock:", error);
        res.status(500).json({ error: "Error al confirmar el stock" });
    }
});

// Ruta para descargar el archivo Excel
router.get("/download-excel", async (req, res) => {
    try {
        const excelFile = await generateExcel();
        res.setHeader("Content-Disposition", `attachment; filename=stock.xlsx`);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(excelFile);
    } catch (error) {
        console.error("Error downloading Excel file:", error);
        res.status(500).json({ error: "Error al descargar el archivo Excel" });
    }
});

module.exports = router;
