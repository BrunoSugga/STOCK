const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

// Ruta del archivo Excel
const excelPath = "C:\\Users\\bruno\\Desktop\\STOCK\\ventas.xlsx";
// Archivo de salida
const outputPath = path.join(__dirname, "../data/sales.json");

// Función para consolidar las ventas por artículo y fecha
const consolidateSales = (data) => {
  const consolidated = {};

  data.forEach((row) => {
    const article = row["Articulo"];
    const rawDate = row["Fecha"];
    const quantity = parseInt(row["Cantidad"], 10);

    if (!article || !rawDate || isNaN(quantity)) return;

    // Convertir la fecha desde el formato DD/MM/YYYY a YYYY-MM-DD
    const dateParts = rawDate.split("/");
    if (dateParts.length !== 3) {
      console.warn(`Fecha inválida encontrada: "${rawDate}". Registro omitido.`);
      return;
    }

    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // YYYY-MM-DD
    const date = new Date(formattedDate);

    if (isNaN(date)) {
      console.warn(`Fecha inválida encontrada después de conversión: "${formattedDate}". Registro omitido.`);
      return;
    }

    if (!consolidated[article]) consolidated[article] = {};
    if (!consolidated[article][formattedDate]) consolidated[article][formattedDate] = 0;

    consolidated[article][formattedDate] += quantity;
  });

  // Convertimos a un formato JSON manejable
  const result = Object.keys(consolidated).map((article) => ({
    article,
    sales: Object.keys(consolidated[article]).map((date) => ({
      date,
      quantity: consolidated[article][date],
    })),
  }));

  return result;
};

// Leer el archivo Excel y procesar los datos
const convertSalesToJson = () => {
  try {
    const workbook = xlsx.readFile(excelPath);
    const sheet = workbook.Sheets["Informe"];
    if (!sheet) throw new Error("No se encontró la hoja 'Informe'.");

    const data = xlsx.utils.sheet_to_json(sheet);

    // Consolidar las ventas
    const consolidatedData = consolidateSales(data);

    // Guardar como JSON
    fs.writeFileSync(outputPath, JSON.stringify(consolidatedData, null, 2));
    console.log(`Archivo JSON generado correctamente en ${outputPath}`);
  } catch (error) {
    console.error(`Error al convertir ventas a JSON: ${error.message}`);
  }
};

convertSalesToJson();
