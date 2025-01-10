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
    const [missingArticles, setMissingArticles] = useState([]);
    const [confirmingStock, setConfirmingStock] = useState(false);
    const searchInputRef = useRef(null);
    const quantityInputRef = useRef(null);

    useEffect(() => {
        fetchArticles();
        focusSearchInput();
    }, []);

    const fetchArticles = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/articles");
            const articlesWithDefaults = response.data.map(article => ({
                ...article,
                quantity: article.quantity || 0,
            }));
            setArticles(articlesWithDefaults);
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
            alert("El artículo seleccionado no es válido. Por favor, inténtalo nuevamente.");
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
                await axios.post("http://localhost:3000/api/articles/update", {
                    id: selectedArticle.id,
                    quantity: parseInt(quantityInputRef.current.value),
                });
                setSearchTerm("");
                setSelectedArticle(null);
                setSuggestions([]);
                fetchArticles();
                focusSearchInput();
            } catch (error) {
                console.error("Error saving quantity:", error);
            }
        }
    };

    const handleFinalizeInput = async () => {
        const missing = articles.filter(
            (article) => article.quantity === null || article.quantity === undefined || article.quantity === 0
        );

        if (missing.length > 0) {
            alert("Aún hay artículos sin ingreso. Por favor, completa el ingreso.");
            setMissingArticles(missing); // Actualizar la lista de artículos faltantes
            return;
        }

        try {
            const response = await axios.post("http://localhost:3000/api/finalize-stock", articles);
            console.log(response.data.message);

            setArticles([]);
            setMissingArticles([]);
            setSelectedArticle(null);
            setSearchTerm("");
            setSuggestions([]);
            focusSearchInput();
        } catch (error) {
            console.error("Error al finalizar ingreso:", error);
        }
    };

    const handleMarkAsNoStock = (id) => {
        setMissingArticles((prevMissing) =>
            prevMissing.map((article) =>
                article.id === id ? { ...article, quantity: 0 } : article
            )
        );
    };

    const handleUpdateMissingQuantity = (id, quantity) => {
        setMissingArticles((prevMissing) =>
            prevMissing.map((article) =>
                article.id === id ? { ...article, quantity: parseInt(quantity) } : article
            )
        );
    };

    const handleSaveMissingArticles = () => {
        setArticles((prevArticles) =>
            prevArticles.map((article) => {
                const updatedArticle = missingArticles.find((a) => a.id === article.id);
                return updatedArticle ? updatedArticle : article;
            })
        );
        setMissingArticles([]);
    };

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
                    className={`btn btn-secondary ms-3 mt-4 ${
                        confirmingStock ? "btn-danger" : ""
                    }`}
                    onClick={handleFinalizeInput}
                >
                    Finalizar Ingreso
                </button>
                <button
                    className="btn btn-primary ms-3 mt-4"
                    onClick={handleSaveMissingArticles}
                >
                    Confirmar Stock
                </button>
            </div>
            {missingArticles.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-light">Artículos Faltantes</h3>
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
                </div>
            )}
        </div>
    );
}

export default App;
