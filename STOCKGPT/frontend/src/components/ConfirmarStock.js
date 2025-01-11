import React from "react";
import axios from "axios";

function ConfirmarStock({ articulos, resetStockEntry }) {
    const confirmarStock = async () => {
        if (articulos.length === 0) {
            alert("No hay artículos para confirmar.");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:3000/api/confirm-stock",
                articulos
            );
            alert("Stock confirmado con éxito. JSON generado.");
            resetStockEntry(); // Reinicia el estado global tras la confirmación.
        } catch (error) {
            console.error("Error al confirmar el stock:", error);
            alert("Ocurrió un error al confirmar el stock.");
        }
    };

    const descargarExcel = async () => {
        try {
            const response = await axios.get(
                "http://localhost:3000/api/download-excel",
                { responseType: "blob" } // Necesario para manejar archivos.
            );

            // Crear un enlace para descargar el archivo.
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "stock.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error al descargar el archivo Excel:", error);
            alert("Ocurrió un error al descargar el archivo Excel.");
        }
    };

    return (
        <div className="mt-4">
            <button className="btn btn-primary me-3" onClick={confirmarStock}>
                Confirmar Stock
            </button>
            <button className="btn btn-success" onClick={descargarExcel}>
                Descargar Excel
            </button>
        </div>
    );
}

export default ConfirmarStock;
