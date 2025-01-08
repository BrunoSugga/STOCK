const ExcelJS = require("exceljs");
const path = require("path");

const generateProductionOrder = (data) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Orden de Producción");

  // Agregar encabezados
  sheet.columns = [
    { header: "Artículo", key: "articulo", width: 25 },
    { header: "Demanda Promedio", key: "avgDemand", width: 15 },
    { header: "Lead Time", key: "leadTime", width: 10 },
    { header: "Stock de Seguridad", key: "safetyStock", width: 20 },
    { header: "Stock Mínimo Requerido", key: "minimumStock", width: 20 },
  ];

  // Agregar datos
  data.forEach((row) => sheet.addRow(row));

  // Guardar archivo
  const outputPath = path.join(__dirname, "../data/orden_produccion.xlsx");
  workbook.xlsx.writeFile(outputPath);
  return outputPath;
};

module.exports = {
  generateProductionOrder,
};
