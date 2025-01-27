import React, { useState } from "react";

function MissingArticles({ missingArticles, setStockForMissing }) {
    const [selectedForNoStock, setSelectedForNoStock] = useState([]);

    const handleSetNoStock = () => {
        const updatedArticles = selectedForNoStock.map((id) => ({
            id,
            quantity: 0,
        }));
        setStockForMissing(updatedArticles);
        setSelectedForNoStock([]);
    };

    const handleQuantityChange = (id, quantity) => {
        setStockForMissing([{ id, quantity: parseInt(quantity, 10) }]);
    };

    const toggleSelect = (id) => {
        setSelectedForNoStock((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedForNoStock.length === missingArticles.length) {
            setSelectedForNoStock([]);
        } else {
            setSelectedForNoStock(missingArticles.map((article) => article.id));
        }
    };

    return (
        <div className="card mt-4">
            <div className="card-body">
                <h5 className="card-title text-danger">Artículos sin stock asignado</h5>
                <div className="form-check mb-3">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="select-all"
                        checked={
                            selectedForNoStock.length === missingArticles.length &&
                            missingArticles.length > 0
                        }
                        onChange={selectAll}
                    />
                    <label htmlFor="select-all" className="form-check-label">
                        Seleccionar todos
                    </label>
                </div>
                <ul className="list-group mb-3">
                    {missingArticles.map((article) => (
                        <li
                            key={article.id}
                            className="list-group-item d-flex justify-content-between align-items-center"
                        >
                            <div>
                                <input
                                    type="checkbox"
                                    className="form-check-input me-2"
                                    checked={selectedForNoStock.includes(article.id)}
                                    onChange={() => toggleSelect(article.id)}
                                />
                                {article.name}
                            </div>
                            <div>
                                <input
                                    type="number"
                                    className="form-control d-inline-block me-2"
                                    style={{ width: "100px" }}
                                    onChange={(e) =>
                                        handleQuantityChange(article.id, e.target.value)
                                    }
                                    placeholder="Cantidad"
                                />
                            </div>
                        </li>
                    ))}
                </ul>
                <button
                    className="btn btn-danger"
                    onClick={handleSetNoStock}
                    disabled={selectedForNoStock.length === 0}
                >
                    Marcar como "Sin Stock"
                </button>
            </div>
        </div>
    );
}

export default MissingArticles;
