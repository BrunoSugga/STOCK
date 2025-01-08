const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");

// Ruta de los archivos JSON
const salesFilePath = path.join(__dirname, "../data/sales.json");
const leadTimeFilePath = path.join(
  __dirname,
  "../../data/leadTime.json" // Ruta corregida
);

// Función para generar predicción y archivo Excel
const generatePrediction = async (req, res) => {
  try {
    // Leer los datos de ventas y lead time
    const salesData = JSON.parse(fs.readFileSync(salesFilePath, "utf-8"));
    const leadTimeData = JSON.parse(fs.readFileSync(leadTimeFilePath, "utf-8"));

    // Crear un mapa para acceder rápidamente al lead time de cada artículo
    const leadTimeMap = {};
    leadTimeData.forEach((item) => {
      leadTimeMap[item.articulo] = item.leadTime;
    });

    // Calcular la demanda total por artículo y su stock necesario
    const articleDemand = {};
    salesData.forEach((sale) => {
      const { articulo, cantidad } = sale;
      if (!articleDemand[articulo]) {
        articleDemand[articulo] = 0;
      }
      articleDemand[articulo] += cantidad;
    });

    // Crear resultados finales
    const results = [];
    for (const articulo in articleDemand) {
      const demand = articleDemand[articulo];
      const leadTime = leadTimeMap[articulo] || 0;

      // Stock mínimo necesario
      const safetyStock = Math.ceil(demand * 0.2); // Stock de seguridad (20% de la demanda)
      const stockNeeded = demand + safetyStock;

      results.push({
        articulo,
        demand,
        leadTime,
        safetyStock,
        stockNeeded,
      });
    }

    // Crear el archivo Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orden de Producción");

    // Definir columnas
    worksheet.columns = [
      { header: "Artículo", key: "articulo", width: 30 },
      { header: "Demanda Total", key: "demand", width: 15 },
      { header: "Lead Time", key: "leadTime", width: 10 },
      { header: "Stock de Seguridad", key: "safetyStock", width: 15 },
      { header: "Stock Necesario", key: "stockNeeded", width: 15 },
    ];

    // Agregar filas al archivo Excel
    results.forEach((item) => {
      worksheet.addRow(item);
    });

    // Guardar el archivo Excel
    const outputPath = path.join(__dirname, "../data/orden_produccion.xlsx");
    await workbook.xlsx.writeFile(outputPath);

    console.log(`Archivo Excel generado en: ${outputPath}`);
    res
      .status(200)
      .json({
        message: "Archivo Excel generado correctamente.",
        outputPath: outputPath,
      });
  } catch (error) {
    console.error(`Error al generar la predicción: ${error.message}`);
    res.status(500).json({ error: "Error al generar la predicción." });
  }
};

module.exports = { generatePrediction };
