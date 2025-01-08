const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Función para convertir Excel a JSON agrupado
const convertExcelToJson = () => {
  try {
    // Ruta del archivo Excel
    const excelPath = path.join('C:\\Users\\bruno\\Desktop\\STOCK\\ventas.xlsx');

    // Leer el archivo Excel
    const workbook = xlsx.readFile(excelPath);

    // Seleccionar la hoja "Informe"
    const worksheet = workbook.Sheets['Informe'];

    // Convertir la hoja a formato JSON
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    // Agrupar las ventas por Artículo y Fecha
    const groupedData = {};

    jsonData.forEach((row) => {
      const fecha = row['Fecha'];
      const articulo = row['Articulo'];
      const cantidad = row['Cantidad'];

      if (!fecha || !articulo || !cantidad) {
        console.warn('Fila incompleta encontrada y omitida:', row);
        return;
      }

      // Crear clave única basada en fecha y artículo
      const key = `${fecha}-${articulo}`;

      // Si la clave no existe, inicializarla
      if (!groupedData[key]) {
        groupedData[key] = {
          Fecha: fecha,
          Articulo: articulo,
          CantidadTotal: 0,
        };
      }

      // Sumar la cantidad vendida
      groupedData[key].CantidadTotal += parseFloat(cantidad);
    });

    // Convertir los datos agrupados en un array
    const aggregatedData = Object.values(groupedData);

    // Ruta para guardar el archivo JSON
    const outputPath = path.join('C:\\Users\\bruno\\Desktop\\STOCK\\ventas_agrupadas.json');

    // Escribir los datos JSON en un archivo
    fs.writeFileSync(outputPath, JSON.stringify(aggregatedData, null, 2));
    console.log(`Archivo JSON agrupado generado exitosamente en: ${outputPath}`);
  } catch (error) {
    console.error(`Error al convertir Excel a JSON: ${error.message}`);
  }
};

// Ejecutar la conversión
convertExcelToJson();
