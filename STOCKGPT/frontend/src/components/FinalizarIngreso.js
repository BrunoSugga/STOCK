import React from "react";

function FinalizarIngreso({
    articulos,
    setArticulosSinIngreso,
    missingArticles,
    handleUpdateMissingQuantity,
    handleMarkAsNoStock,
    handleSaveMissingArticles,
}) {
    const verificarArticulosSinIngreso = () => {
        const sinIngreso = articulos.filter(
            (articulo) => !articulo.quantity || articulo.quantity === 0
        );
        setArticulosSinIngreso(sinIngreso);

        if (sinIngreso.length > 0) {
            alert("Hay artículos sin ingreso. Por favor, completa las cantidades.");
        } else {
            alert("Todos los artículos tienen cantidades asignadas.");
        }
    };

    return (
        <div>
            <button
                className="btn btn-secondary"
                onClick={verificarArticulosSinIngreso}
            >
                Verificar Artículos Sin Ingreso
            </button>

            {missingArticles.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-light">Artículos Sin Ingreso</h3>
                    <ul className="list-group">
                        {missingArticles.map((article) => (
                            <li key={article.id} className="list-group-item">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span>{article.name}</span>
                                    <div>
                                        <input
                                            type="number"
                                            placeholder="Cantidad"
                                            onChange={(e) =>
                                                handleUpdateMissingQuantity(article.id, e.target.value)
                                            }
                                            className="form-control d-inline w-50"
                                        />
                                        <button
                                            className="btn btn-danger ms-2"
                                            onClick={() => handleMarkAsNoStock(article.id)}
                                        >
                                            Sin Stock
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button
                        className="btn btn-primary mt-3"
                        onClick={handleSaveMissingArticles}
                    >
                        Guardar Artículos Faltantes
                    </button>
                </div>
            )}
        </div>
    );
}

export default FinalizarIngreso;
