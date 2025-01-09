import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

function App() {
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [articles, setArticles] = useState([]);
    const [allStockEntered, setAllStockEntered] = useState(false);
    const searchInputRef = useRef(null);
    const quantityInputRef = useRef(null);

    useEffect(() => {
        fetchArticles();
        focusSearchInput();
    }, []);

    useEffect(() => {
        const allEntered = articles.every(article => article.quantity !== undefined);
        setAllStockEntered(allEntered);
    }, [articles]);

    const fetchArticles = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/articles");
            setArticles(response.data);
        } catch (error) {
            console.error("Error fetching articles:", error);
        }
    };

    const focusSearchInput = () => {
        setTimeout(() => searchInputRef.current?.focus(), 0);
    };

    const handleSearchChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        setSelectedSuggestionIndex(-1);

        if (term.length > 0) {
            const matches = articles.filter((article) =>
                article.name.toLowerCase().includes(term.toLowerCase())
            );
            setSuggestions(matches);
        } else {
            setSuggestions([]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "ArrowDown") {
            setSelectedSuggestionIndex((prevIndex) =>
                prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
            );
        } else if (e.key === "ArrowUp") {
            setSelectedSuggestionIndex((prevIndex) =>
                prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
            );
        } else if (e.key === "Enter") {
            if (selectedSuggestionIndex !== -1) {
                const article = suggestions[selectedSuggestionIndex];
                handleSelectSuggestion(article);
            }
        }
    };

    const handleSelectSuggestion = (article) => {
        if (!article || !article.name) {
            console.error("Artículo inválido:", article);
            return;
        }
        setSelectedArticle(article);
        setSearchTerm(article.name);
        setSuggestions([]);
        setTimeout(() => quantityInputRef.current?.focus(), 0);
    };

    const handleQuantitySave = async () => {
        if (selectedArticle && quantityInputRef.current?.value) {
            try {
                const updatedQuantity = parseInt(quantityInputRef.current.value);

                await axios.post("http://localhost:3000/api/articles/update", {
                    id: selectedArticle.id,
                    quantity: updatedQuantity,
                });

                const updatedArticles = articles.map(article =>
                    article.id === selectedArticle.id ? { ...article, quantity: updatedQuantity } : article
                );
                setArticles(updatedArticles);
                setSearchTerm("");
                setSelectedArticle(null);
                setSuggestions([]);
                focusSearchInput();
            } catch (error) {
                console.error("Error saving quantity:", error);
            }
        }
    };

    const handleFinalizeInput = () => {
        if (!allStockEntered) {
            alert("Asegúrate de que todos los artículos tengan cantidades ingresadas.");
            return;
        }

        alert("Todos los artículos tienen cantidades ingresadas. Puedes confirmar el stock.");
    };

    const handleConfirmStock = async () => {
        try {
            const response = await axios.post("http://localhost:3000/api/confirm-stock", articles);
            console.log(response.data.message);
            alert("Stock confirmado y guardado correctamente.");
        } catch (error) {
            console.error("Error al confirmar stock:", error);
        }
    };

    const finalizeButtonClass = allStockEntered ? "btn btn-primary blinking" : "btn btn-secondary";

    return (
        <div className="container mt-4">
            <h1 className="mb-4 text-light">STOCKGPT - Gestión de Inventarios</h1>
            <div className="d-flex mb-3 align-items-center">
                <div className="flex-grow-1">
                    <label htmlFor="article" className="form-label text-light">
                        Artículo
                    </label>
                    <input
                        type="text"
                        id="article"
                        className="form-control"
                        value={searchTerm}
                        ref={searchInputRef}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Busca un artículo"
                        autoComplete="off"
                    />
                </div>
                <button
                    className={`${finalizeButtonClass} ms-3 mt-4`}
                    onClick={handleFinalizeInput}
                >
                    Finalizar Ingreso
                </button>
                <button
                    className="btn btn-success ms-3 mt-4"
                    onClick={handleConfirmStock}
                >
                    Confirmar Stock
                </button>
            </div>
            {suggestions.length > 0 && (
                <ul className="list-group mt-2">
                    {suggestions.map((article, index) => (
                        <li
                            key={article.id}
                            className={`list-group-item ${
                                index === selectedSuggestionIndex ? "active" : ""
                            }`}
                            onClick={() => handleSelectSuggestion(article)}
                        >
                            {article.name}
                        </li>
                    ))}
                </ul>
            )}
            {selectedArticle && (
                <div className="mb-3">
                    <label htmlFor="quantity" className="form-label text-light">
                        Existencias
                    </label>
                    <input
                        type="number"
                        id="quantity"
                        className="form-control"
                        ref={quantityInputRef}
                        placeholder="Ingresa la cantidad"
                        onKeyDown={(e) => e.key === "Enter" && handleQuantitySave()}
                    />
                    <button className="btn btn-primary mt-2" onClick={handleQuantitySave}>
                        Ingresar
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;
