import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import './index.css';

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1); // Índice de la sugerencia seleccionada
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [articles, setArticles] = useState([]);
  const quantityInputRef = useRef(null); // Referencia para enfocar el campo de cantidad

  // Cargar artículos al iniciar
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/articles");
      setArticles(response.data);
    } catch (error) {
      console.error("Error al obtener artículos:", error);
    }
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setSelectedSuggestionIndex(-1); // Reinicia la selección

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
      // Mueve hacia abajo en las sugerencias
      setSelectedSuggestionIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      // Mueve hacia arriba en las sugerencias
      setSelectedSuggestionIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter" && selectedSuggestionIndex !== -1) {
      // Selecciona la sugerencia actual al presionar Enter
      const article = suggestions[selectedSuggestionIndex];
      handleSelectSuggestion(article);
    }
  };

  const handleSelectSuggestion = (article) => {
    setSelectedArticle(article);
    setSearchTerm(article.name);
    setSuggestions([]);
    setTimeout(() => quantityInputRef.current?.focus(), 0); // Pasa automáticamente al campo de cantidad
  };

  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
  };

  const handleSave = async (e) => {
    if (e.key === "Enter" && selectedArticle && quantity) {
      try {
        await axios.post("http://localhost:3000/api/articles/update", {
          id: selectedArticle.id,
          quantity: parseInt(quantity),
        });
        // Reiniciar el flujo
        setSearchTerm("");
        setSelectedArticle(null);
        setQuantity("");
        setSuggestions([]);
        fetchArticles(); // Refrescar la lista de artículos
      } catch (error) {
        console.error("Error al guardar la cantidad:", error);
      }
    }
  };

  return (
    <div className="container">
      <h1 className="my-4">STOCKGPT - Gestión de Inventarios</h1>

      <div className="form-group">
        <label htmlFor="article">Artículo</label>
        <input
          type="text"
          id="article"
          className="form-control"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown} // Manejo de flechas y Enter
          placeholder="Busca un artículo"
        />
        {suggestions.length > 0 && (
          <ul className="list-group">
            {suggestions.map((article, index) => (
              <li
                key={article.id}
                className={`list-group-item ${
                  index === selectedSuggestionIndex ? "active" : ""
                }`}
                onMouseEnter={() => setSelectedSuggestionIndex(index)} // Resalta al pasar el mouse
                onClick={() => handleSelectSuggestion(article)} // Selecciona al hacer clic
              >
                {article.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedArticle && (
        <div className="form-group mt-3">
          <label htmlFor="quantity">Existencias</label>
          <input
            type="number"
            id="quantity"
            className="form-control"
            value={quantity}
            onChange={handleQuantityChange}
            onKeyDown={handleSave} // Guarda al presionar Enter
            placeholder="Ingresa la cantidad"
            ref={quantityInputRef} // Referencia para enfocar automáticamente
          />
        </div>
      )}
    </div>
  );
}

export default App;
