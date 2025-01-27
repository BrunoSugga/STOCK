import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api"; // Base URL del backend

// Obtener todos los artículos
export const fetchArticles = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/articles`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener los artículos:", error.message);
        throw new Error("No se pudieron obtener los artículos. Verifica la conexión con el backend.");
    }
};

// Actualizar la cantidad de un artículo
export const updateArticleQuantity = async (id, quantity) => {
    try {
        if (typeof id !== "number" || typeof quantity !== "number") {
            throw new Error("Datos inválidos para actualizar el artículo.");
        }
        await axios.post(`${API_BASE_URL}/articles/update`, { id, quantity });
    } catch (error) {
        console.error("Error al actualizar la cantidad del artículo:", error.message);
        throw new Error("No se pudo actualizar la cantidad del artículo.");
    }
};

// Finalizar el stock (guardar stock actual como archivo JSON)
export const finalizeStock = async (articles) => {
    try {
        if (!Array.isArray(articles) || articles.length === 0) {
            throw new Error("Los datos de artículos enviados son inválidos.");
        }
        const response = await axios.post(`${API_BASE_URL}/finalize-stock`, articles);
        return response.data;
    } catch (error) {
        console.error("Error al finalizar el stock:", error.message);
        throw new Error("No se pudo finalizar el stock.");
    }
};

// Confirmar y guardar el stock
export const confirmStock = async (articles) => {
    try {
        if (!Array.isArray(articles) || articles.length === 0) {
            throw new Error("Los datos de artículos enviados son inválidos.");
        }
        const response = await axios.post(`${API_BASE_URL}/confirm-stock`, articles);
        return response.data;
    } catch (error) {
        console.error("Error al confirmar el stock:", error.message);
        throw new Error("No se pudo confirmar el stock.");
    }
};

// Descargar el archivo Excel con los datos del stock
export const downloadExcel = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/articles/download`, {
            responseType: "blob", // Necesario para manejar archivos como blobs
        });

        // Crear un enlace temporal para descargar el archivo
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "ultimo_stock.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Error al descargar el archivo Excel:", error.message);
        throw new Error("No se pudo descargar el archivo Excel.");
    }
};
