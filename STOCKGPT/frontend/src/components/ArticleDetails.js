import React, { useState, useRef, useEffect } from "react";

function ArticleDetails({ article, onSubmit }) {
    const [quantity, setQuantity] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus(); // Foco inicial en el campo de cantidad
    }, [article]);

    const handleSave = () => {
        if (quantity !== "") {
            onSubmit(parseInt(quantity, 10));
            setQuantity(""); // Limpia el campo después del envío
        } else {
            alert("Por favor, ingresa una cantidad válida.");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSave();
        }
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title text-primary">{article.name}</h5>
                <label htmlFor="quantity" className="form-label">
                    Ingresar cantidad:
                </label>
                <input
                    type="number"
                    id="quantity"
                    className="form-control mb-3"
                    value={quantity}
                    ref={inputRef}
                    onChange={(e) => setQuantity(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Cantidad"
                />
                <button className="btn btn-success" onClick={handleSave}>
                    Ingresar
                </button>
            </div>
        </div>
    );
}

export default ArticleDetails;
