const express = require("express");
const fs = require("fs");
const path = require("path");
const { parse } = require("json2csv");

const router = express.Router();

let currentStock = []; // Variable temporal para almacenar el stock actual

// Ruta para descargar el último stock en formato CSV
router.get("/latest-stock", (req, res) => {
    try {
        const directoryPath = path.join(__dirname, "../data");
        const files = fs.readdirSync(directoryPath).filter(file => file.endsWith(".json"));

        if (files.length === 0) {
            return res.status(404).json({ message: "No hay archivos de stock disponibles." });
        }

        // Ordenar archivos por fecha de creación
        const latestFile = files
            .map(file => ({
                file,
                time: fs.statSync(path.join(directoryPath, file)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time)[0].file;

        const filePath = path.join(directoryPath, latestFile);

        // Leer el archivo JSON y convertirlo a CSV
        const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        const csv = parse(jsonData);

        const csvFileName = `ultimo_stock_${latestFile.replace(".json", ".csv")}`;
        const csvFilePath = path.join(directoryPath, csvFileName);

        // Guardar el archivo CSV
        fs.writeFileSync(csvFilePath, csv);

        // Descargar el archivo CSV
        res.download(csvFilePath, csvFileName, err => {
            if (err) {
                console.error("Error al descargar el archivo:", err);
                res.status(500).send("Error al descargar el archivo.");
            } else {
                // Eliminar el archivo CSV después de la descarga
                fs.unlinkSync(csvFilePath);
            }
        });
    } catch (error) {
        console.error("Error al procesar el último stock:", error);
        res.status(500).json({ message: "Error al procesar el último stock." });
    }
});

// Ruta para guardar el stock actual como un archivo JSON (Nuevo Ingreso)
router.post("/finalize-stock", (req, res) => {
    try {
        const stockData = req.body; // Datos enviados desde el frontend

        // Validar que los datos no estén vacíos
        if (!Array.isArray(stockData) || stockData.length === 0) {
            return res.status(400).json({ message: "El stock enviado está vacío o es inválido." });
        }

        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}`;
        const fileName = `stock_${timestamp}.json`;
        const filePath = path.join(__dirname, "../data", fileName);

        // Crear el directorio si no existe
        if (!fs.existsSync(path.join(__dirname, "../data"))) {
            fs.mkdirSync(path.join(__dirname, "../data"));
        }

        // Guardar el archivo JSON
        fs.writeFileSync(filePath, JSON.stringify(stockData, null, 2));

        // Reiniciar currentStock para evitar acumulaciones
        currentStock = [];

        res.status(200).json({ message: "Archivo generado con éxito", fileName });
    } catch (error) {
        console.error("Error al procesar /finalize-stock:", error);
        res.status(500).json({ message: "Error al generar el archivo JSON" });
    }
});

// Ruta para modificar el stock actual
router.post("/modify-stock", (req, res) => {
    try {
        const updatedArticle = req.body; // Artículo modificado enviado desde el frontend

        // Recuperar el último archivo JSON
        const directoryPath = path.join(__dirname, "../data");
        const files = fs.readdirSync(directoryPath).filter(file => file.endsWith(".json"));

        if (files.length === 0) {
            return res.status(404).json({ message: "No hay archivos de stock disponibles para modificar." });
        }

        const latestFile = files
            .map(file => ({
                file,
                time: fs.statSync(path.join(directoryPath, file)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time)[0].file;

        const filePath = path.join(directoryPath, latestFile);
        const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        // Modificar el artículo en los datos existentes
        const updatedStock = jsonData.map(article =>
            article.id === updatedArticle.id
                ? { ...article, quantity: updatedArticle.quantity }
                : article
        );

        // Crear un nuevo archivo JSON con los datos modificados
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}`;
        const newFileName = `stock_modified_${timestamp}.json`;
        const newFilePath = path.join(directoryPath, newFileName);

        fs.writeFileSync(newFilePath, JSON.stringify(updatedStock, null, 2));

        res.status(200).json({ message: "Artículo modificado exitosamente", fileName: newFileName });
    } catch (error) {
        console.error("Error al modificar el stock:", error);
        res.status(500).json({ message: "Error al modificar el stock" });
    }
});

// Nueva ruta para confirmar y guardar el stock
router.post("/confirm-stock", (req, res) => {
    try {
        const stockData = req.body; // Datos enviados desde el frontend

        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}`;
        const fileName = `stock_confirmed_${timestamp}.json`;
        const filePath = path.join(__dirname, "../data", fileName);

        // Crear el directorio si no existe
        if (!fs.existsSync(path.join(__dirname, "../data"))) {
            fs.mkdirSync(path.join(__dirname, "../data"));
        }

        // Guardar el archivo JSON
        fs.writeFileSync(filePath, JSON.stringify(stockData, null, 2));

        res.status(200).json({ message: "Stock confirmado y guardado exitosamente", fileName });
    } catch (error) {
        console.error("Error al procesar /confirm-stock:", error);
        res.status(500).json({ message: "Error al confirmar el stock" });
    }
});

module.exports = router;
