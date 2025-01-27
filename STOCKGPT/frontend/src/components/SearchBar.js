import React, { useState } from "react";

function SearchBar({ articles, setSelectedArticle, searchInputRef }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const handleSearchChange = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        setSelectedIndex(-1);

        if (term.length > 0) {
            const matches = articles.filter((article) =>
                article.name.toLowerCase().includes(term)
            );
            setSuggestions(matches);
        } else {
            setSuggestions([]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "ArrowDown") {
            setSelectedIndex((prevIndex) =>
                prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
            );
        } else if (e.key === "ArrowUp") {
            setSelectedIndex((prevIndex) =>
                prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
            );
        } else if (e.key === "Enter" && selectedIndex >= 0) {
            handleSelectSuggestion(suggestions[selectedIndex]);
        }
    };

    const handleSelectSuggestion = (article) => {
        setSelectedArticle(article);
        setSearchTerm(""); // Limpia la barra de búsqueda
        setSuggestions([]); // Oculta las sugerencias
    };

    return (
        <div className="mb-4">
            <label htmlFor="search" className="form-label text-light">
                Buscar Artículo
            </label>
            <input
                type="text"
                id="search"
                ref={searchInputRef} // Vincular referencia para foco
                className="form-control"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                placeholder="Escribe el nombre del artículo"
                autoComplete="off"
            />
            {suggestions.length > 0 && (
                <ul className="list-group mt-2">
                    {suggestions.map((article, index) => (
                        <li
                            key={article.id}
                            className={`list-group-item ${
                                index === selectedIndex ? "active" : ""
                            }`}
                            onClick={() => handleSelectSuggestion(article)}
                        >
                            {article.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default SearchBar;
