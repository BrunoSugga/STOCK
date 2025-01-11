import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api"; // Base URL del backend

export const fetchArticles = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/articles`);
        return response.data;
    } catch (error) {
        console.error("Error fetching articles:", error);
        throw error;
    }
};

export const updateArticleQuantity = async (id, quantity) => {
    try {
        await axios.post(`${API_BASE_URL}/articles/update`, { id, quantity });
    } catch (error) {
        console.error("Error updating article quantity:", error);
        throw error;
    }
};

export const finalizeStock = async (articles) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/finalize-stock`, articles);
        return response.data;
    } catch (error) {
        console.error("Error finalizing stock:", error);
        throw error;
    }
};

export const confirmStock = async (articles) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/confirm-stock`, articles);
        return response.data;
    } catch (error) {
        console.error("Error confirming stock:", error);
        throw error;
    }
};

export const downloadExcel = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/download-excel`, {
            responseType: "blob", // Necesario para manejar archivos
        });
        return response.data;
    } catch (error) {
        console.error("Error downloading Excel file:", error);
        throw error;
    }
};
