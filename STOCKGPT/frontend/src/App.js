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
  const [selectedForNoStock, setSelectedForNoStock] = useState([]);
  const searchInputRef = useRef(null);
  const quantityInputRef = useRef(null);

  useEffect(() => {
    fetchArticles();
    focusSearchInput();
  }, []);

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

  const handleFinalizeInput = () => {
    const missing = articles.filter((article) => article.quantity === 0);
    setMissingArticles(missing);
    setSelectedForNoStock([]);
  };

  const handleToggleSelect = (id) => {
    setSelectedForNoStock((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedForNoStock.length === missingArticles.length) {
      setSelectedForNoStock([]);
    } else {
      setSelectedForNoStock(missingArticles.map((article) => article.id));
    }
  };

  const handleSetMultipleStock = (value) => {
    selectedForNoStock.forEach((id) => handleSetStock(id, value));
    setSelectedForNoStock([]);
  };

  const handleSetStock = (id, value) => {
    setArticles((prevArticles) =>
      prevArticles.map((article) =>
        article.id === id ? { ...article, quantity: value } : article
      )
    );
    setMissingArticles((prevMissing) =>
      prevMissing.filter((article) => article.id !== id)
    );
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/articles/download",
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "articulos.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading Excel:", error);
    }
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
            autoComplete="off" // Evita el historial del navegador
          />
        </div>
        <button
          className="btn btn-primary ms-3 mt-4"
          onClick={handleDownloadExcel}
        >
          Descargar Excel
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
      <button className="btn btn-secondary mb-3" onClick={handleFinalizeInput}>
        Finalizar Ingreso
      </button>
      {missingArticles.length > 0 && (
        <div>
          <h2 className="text-light">Artículos No Ingresados</h2>
          <div className="d-flex align-items-center mb-2">
            <input
              type="checkbox"
              className="form-check-input me-2"
              onChange={handleSelectAll}
              checked={
                selectedForNoStock.length === missingArticles.length &&
                missingArticles.length > 0
              }
            />
            <label className="text-light">Seleccionar Todos</label>
          </div>
          <button
            className="btn btn-danger mb-3"
            onClick={() => handleSetMultipleStock(0)}
          >
            Sin Stock
          </button>
          <ul className="list-group">
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
                    onChange={() => handleToggleSelect(article.id)}
                  />
                  {article.name}
                </div>
                <div>
                  <button
                    className="btn btn-danger btn-sm me-2"
                    onClick={() => handleSetStock(article.id, 0)}
                  >
                    Sin Stock
                  </button>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() =>
                      handleSetStock(
                        article.id,
                        parseInt(prompt("Ingresa cantidad"))
                      )
                    }
                  >
                    Existencia
                  </button>
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
