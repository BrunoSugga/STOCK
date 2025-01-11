const sqlite3 = require("sqlite3").verbose();
const ExcelJS = require("exceljs");
const path = require("path");

const dbPath = path.join(__dirname, "../database/stock.db");
const db = new sqlite3.Database(dbPath);

// Obtener todos los artículos
const getArticles = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM articles", [], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
};

// Actualizar la cantidad de un artículo
const updateArticle = (id, quantity) => {
    return new Promise((resolve, reject) => {
        db.run(
            "UPDATE articles SET quantity = ? WHERE id = ?",
            [quantity, id],
            function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.changes > 0); // Devuelve true si se actualizó
            }
        );
    });
};

// Finalizar ingreso (valida y ajusta stock si es necesario)
const finalizeStock = (articles) => {
    return new Promise((resolve, reject) => {
        const placeholders = articles.map(() => "(?, ?)").join(", ");
        const values = articles.flatMap((article) => [article.id, article.quantity]);

        const query = `
            INSERT INTO stock_history (article_id, quantity, created_at)
            VALUES ${placeholders}`;

        db.run(query, values, function (err) {
            if (err) {
                return reject(err);
            }
            resolve("Ingreso finalizado con éxito.");
        });
    });
};

// Generar un archivo Excel con los artículos
const generateExcel = async () => {
    const articles = await getArticles();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Stock");

    // Agregar encabezados
    worksheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Nombre", key: "name", width: 30 },
        { header: "Cantidad", key: "quantity", width: 15 },
    ];

    // Agregar filas
    articles.forEach((article) => {
        worksheet.addRow(article);
    });

    // Generar archivo Excel en memoria
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
};

module.exports = {
    getArticles,
    updateArticle,
    finalizeStock,
    generateExcel,
};
