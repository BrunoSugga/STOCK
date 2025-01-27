const fs = require("fs");
const path = require("path");

// Directorio de salida
const outputDir = path.join(process.cwd(), "exported_txt");

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Función para recorrer carpetas y exportar archivos
const exportFilesRecursively = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    entries.forEach((entry) => {
        const entryPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            // Si es una carpeta, llamar recursivamente
            exportFilesRecursively(entryPath);
        } else if (entry.isFile() && entry.name !== path.basename(__filename)) {
            // Si es un archivo, exportarlo como .txt
            const relativePath = path.relative(process.cwd(), entryPath);
            const fileName = relativePath.replace(/[/\\]/g, "_") + ".txt"; // Sustituir "/" o "\" por "_" en el nombre del archivo
            const outputFilePath = path.join(outputDir, fileName);

            try {
                const content = fs.readFileSync(entryPath, "utf8");
                const contentWithHeader = `// Ubicación original: ${entryPath}\n\n${content}`;
                fs.writeFileSync(outputFilePath, contentWithHeader, "utf8");
                console.log(`Archivo exportado: ${outputFilePath}`);
            } catch (error) {
                console.error(`Error al exportar ${entryPath}:`, error.message);
            }
        }
    });
};

// Ejecutar la función en el directorio actual
exportFilesRecursively(process.cwd());
