const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");

// Ruta del archivo CSV
const csvFilePath = path.join(__dirname, "./articles.csv");

// Ruta del archivo JSON de salida
const jsonFilePath = path.join(__dirname, "./articles.json");

// Función para convertir CSV a JSON
const convertCsvToJson = () => {
    const articles = [];
    fs.createReadStream(csvFilePath)
        .pipe(csvParser())
        .on("data", (row) => {
            articles.push({
                id: parseInt(row.id),
                name: row.name,
                quantity: row.quantity === "" ? null : parseInt(row.quantity),
            });
        })
        .on("end", () => {
            fs.writeFileSync(jsonFilePath, JSON.stringify(articles, null, 2), "utf-8");
            console.log(`Archivo JSON generado exitosamente en: ${jsonFilePath}`);
        })
        .on("error", (error) => {
            console.error("Error al procesar el archivo CSV:", error.message);
        });
};

// Ejecutar la conversión
convertCsvToJson();
