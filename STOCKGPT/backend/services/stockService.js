const fs = require("fs");
const path = require("path");

// Ruta del directorio donde se almacenan los archivos JSON
const dataPath = path.join(__dirname, "../data");

// Confirmar y guardar el stock
const confirmStock = async (articles) => {
    return new Promise((resolve, reject) => {
        try {
            const now = new Date();
            const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}`;
            const fileName = `stock_confirmed_${timestamp}.json`;
            const filePath = path.join(dataPath, fileName);

            // Crear el directorio si no existe
            if (!fs.existsSync(dataPath)) {
                fs.mkdirSync(dataPath);
            }

            // Guardar el archivo JSON con los datos confirmados
            fs.writeFileSync(filePath, JSON.stringify(articles, null, 2));
            resolve({ message: "Stock confirmado y guardado exitosamente.", fileName });
        } catch (error) {
            console.error("Error al confirmar el stock:", error.message);
            reject("No se pudo confirmar el stock.");
        }
    });
};

// Finalizar ingreso de stock (guardar temporalmente el stock actual)
const finalizeStock = async (articles) => {
    return new Promise((resolve, reject) => {
        try {
            const now = new Date();
            const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}`;
            const fileName = `stock_${timestamp}.json`;
            const filePath = path.join(dataPath, fileName);

            // Crear el directorio si no existe
            if (!fs.existsSync(dataPath)) {
                fs.mkdirSync(dataPath);
            }

            // Guardar el archivo JSON con los datos del stock
            fs.writeFileSync(filePath, JSON.stringify(articles, null, 2));
            resolve({ message: "Stock finalizado y guardado exitosamente.", fileName });
        } catch (error) {
            console.error("Error al finalizar el stock:", error.message);
            reject("No se pudo finalizar el stock.");
        }
    });
};

// Obtener todos los artículos desde el archivo JSON
const getArticles = () => {
    return new Promise((resolve, reject) => {
        try {
            const filePath = path.join(dataPath, "articles.json");

            // Verifica si el archivo existe
            if (!fs.existsSync(filePath)) {
                return reject("El archivo de artículos no existe.");
            }

            // Lee y devuelve los datos del archivo JSON
            const data = fs.readFileSync(filePath, "utf-8");
            resolve(JSON.parse(data));
        } catch (error) {
            console.error("Error al obtener los artículos:", error.message);
            reject("Error al obtener los artículos.");
        }
    });
};

// Actualizar la cantidad de un artículo en el archivo JSON
const updateArticle = (id, quantity) => {
    return new Promise((resolve, reject) => {
        try {
            const filePath = path.join(dataPath, "articles.json");
            const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

            const articleIndex = data.findIndex((article) => article.id === id);
            if (articleIndex === -1) {
                return reject("Artículo no encontrado.");
            }

            data[articleIndex].quantity = quantity;

            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            resolve({ message: "Cantidad actualizada correctamente." });
        } catch (error) {
            console.error("Error al actualizar el archivo JSON:", error.message);
            reject("Error al actualizar el artículo.");
        }
    });
};

module.exports = {
    confirmStock,
    finalizeStock,
    getArticles,
    updateArticle,
};
