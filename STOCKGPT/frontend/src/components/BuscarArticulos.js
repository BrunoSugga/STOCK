import React, { useState } from "react";

function BuscarArticulos({ articulos, setArticulos }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

    const handleSearchChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        setSelectedSuggestionIndex(-1);

        if (term.length > 0) {
            const matches = articulos.filter((articulo) =>
                articulo.name.toLowerCase().includes(term.toLowerCase())
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
                const selectedArticle = suggestions[selectedSuggestionIndex];
                handleSelectSuggestion(selectedArticle);
            }
        }
    };

    const handleSelectSuggestion = (article) => {
        if (!article || !article.name) {
            alert("Artículo inválido. Por favor, selecciona un artículo válido.");
            return;
        }

        setSearchTerm(article.name);
        setSuggestions([]);
        alert(`Artículo seleccionado: ${article.name}`);
    };

    const handleMouseEnter = (index) => {
        setSelectedSuggestionIndex(index);
    };

    return (
        <div className="mb-4">
            <label htmlFor="search" className="form-label text-light">
                Buscar Artículo
            </label>
            <input
                type="text"
                id="search"
                className="form-control"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                placeholder="Escribe para buscar un artículo"
            />
            {suggestions.length > 0 && (
                <ul className="list-group mt-2">
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={suggestion.id}
                            className={`list-group-item ${
                                index === selectedSuggestionIndex ? "active" : ""
                            }`}
                            onClick={() => handleSelectSuggestion(suggestion)}
                            onMouseEnter={() => handleMouseEnter(index)} // Remarcar con el mouse
                        >
                            {suggestion.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default BuscarArticulos;
