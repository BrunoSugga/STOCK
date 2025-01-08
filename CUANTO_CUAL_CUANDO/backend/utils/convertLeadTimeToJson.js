const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

// Ruta del archivo Excel
const excelPath = "C:\\Users\\bruno\\Desktop\\STOCK\\lead time.xlsx";
// Archivo de salida (ajustada la ruta correctamente)
const outputPath = path.resolve(__dirname, "../../data/leadTime.json");

// Función para normalizar nombres (eliminar números y caracteres especiales al inicio)
const normalizeName = (name) => {
  return name.replace(/^\d+-/, "").trim();
};

// Leer el archivo Excel
const convertLeadTimeToJson = () => {
  try {
    const workbook = xlsx.readFile(excelPath);
    const sheet = workbook.Sheets["Hoja 1"];
    if (!sheet) throw new Error("No se encontró la hoja 'Hoja 1'.");

    const data = xlsx.utils.sheet_to_json(sheet);

    // Normalizar datos
    const normalizedData = data.map((row) => ({
      articulo: normalizeName(row["Articulo"] || ""),
      leadTime: parseInt(row["LEAD TIME"], 10),
    }));

    // Guardar como JSON
    fs.writeFileSync(outputPath, JSON.stringify(normalizedData, null, 2));
    console.log(`Archivo JSON generado correctamente en ${outputPath}`);
  } catch (error) {
    console.error(`Error al convertir Lead Time a JSON: ${error.message}`);
  }
};

convertLeadTimeToJson();
