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
    const [isModifying, setIsModifying] = useState(false); // Estado para modificar stock
    const [allStockEntered, setAllStockEntered] = useState(false); // Verificar si todos los artículos tienen ingreso
    const searchInputRef = useRef(null);
    const quantityInputRef = useRef(null);

    useEffect(() => {
        fetchArticles();
        focusSearchInput();
    }, []);

    useEffect(() => {
        const allEntered = articles.every(article => article.quantity > 0);
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
                if (isModifying) {
                    // Modificar stock existente
                    await axios.post("http://localhost:3000/api/modify-stock", {
                        id: selectedArticle.id,
                        quantity: parseInt(quantityInputRef.current.value),
                    });
                } else {
                    // Ingreso inicial
                    await axios.post("http://localhost:3000/api/articles/update", {
                        id: selectedArticle.id,
                        quantity: parseInt(quantityInputRef.current.value),
                    });
                }
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
        try {
            const response = await axios.post("http://localhost:3000/api/finalize-stock", articles);
            console.log(response.data.message);

            // Limpiar estados después de finalizar
            setSearchTerm("");
            setSuggestions([]);
            setSelectedArticle(null);
            focusSearchInput();
            setIsModifying(false); // Desactivar modo de modificación
        } catch (error) {
            console.error("Error al finalizar ingreso:", error);
        }
    };

    const handleDownloadLatestStock = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/latest-stock", {
                responseType: "blob", // Asegura la recepción de datos binarios
            });

            // Crear un enlace para descargar el archivo
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "ultimo_stock.csv");
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error("Error al descargar el último stock:", error);
            alert("No se pudo descargar el último stock. Intenta nuevamente.");
        }
    };

    const toggleModifyMode = () => {
        setIsModifying(!isModifying);
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
                    className={finalizeButtonClass + " ms-3 mt-4"}
                    onClick={handleFinalizeInput}
                >
                    Finalizar Ingreso
                </button>
                <button
                    className="btn btn-primary ms-3 mt-4"
                    onClick={handleDownloadLatestStock}
                >
                    Último Stock
                </button>
                <button
                    className={`btn ${isModifying ? "btn-danger" : "btn-warning"} ms-3 mt-4`}
                    onClick={toggleModifyMode}
                >
                    {isModifying ? "Salir de Modificar" : "Modificar Stock"}
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
                        className={`form-control ${isModifying ? "border-danger" : ""}`}
                        ref={quantityInputRef}
                        placeholder="Ingresa la cantidad"
                        onKeyDown={(e) => e.key === "Enter" && handleQuantitySave()}
                    />
                    <button className="btn btn-primary mt-2" onClick={handleQuantitySave}>
                        {isModifying ? "Modificar" : "Ingresar"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;
