import React, { useState, useEffect, useRef } from "react";
import SearchBar from "./components/SearchBar";
import ArticleDetails from "./components/ArticleDetails";
import MissingArticles from "./components/MissingArticles";
import { fetchArticles, finalizeStock, confirmStock } from "./utils/api";

function MainApp() {
    const [articles, setArticles] = useState([]);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [missingArticles, setMissingArticles] = useState([]);
    const [isStockFinalized, setIsStockFinalized] = useState(false);
    const searchInputRef = useRef(null);

    useEffect(() => {
        const initializeArticles = async () => {
            try {
                const data = await fetchArticles();
                setArticles(data);
                searchInputRef.current?.focus(); // Foco inicial en el buscador
            } catch (error) {
                console.error("Error al cargar los artículos:", error.message);
            }
        };

        initializeArticles();
    }, []);

    const handleArticleSubmit = async (article, quantity) => {
        try {
            article.quantity = quantity; // Actualiza la cantidad localmente
            setArticles((prev) =>
                prev.map((a) => (a.id === article.id ? { ...a, quantity } : a))
            );
            setSelectedArticle(null); // Limpia la selección del artículo
            searchInputRef.current?.focus(); // Regresa el foco al buscador
        } catch (error) {
            console.error("Error al actualizar el artículo:", error.message);
        }
    };

    const handleFinalizeStock = () => {
        const missing = articles.filter((article) => article.quantity === null);
        if (missing.length > 0) {
            setMissingArticles(missing);
        } else {
            setIsStockFinalized(true);
        }
    };

    const handleConfirmStock = async () => {
        try {
            await confirmStock(articles);
            alert("Stock confirmado correctamente.");
            setArticles((prev) =>
                prev.map((article) => ({ ...article, quantity: null }))
            );
            setIsStockFinalized(false);
            setMissingArticles([]);
        } catch (error) {
            console.error("Error al confirmar el stock:", error.message);
        }
    };

    const handleSetStockForMissing = (updatedArticles) => {
        setArticles((prev) =>
            prev.map((article) => {
                const updated = updatedArticles.find((a) => a.id === article.id);
                return updated ? { ...article, quantity: updated.quantity } : article;
            })
        );
        setMissingArticles((prev) =>
            prev.filter((article) => !updatedArticles.some((a) => a.id === article.id))
        );
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4 text-light">STOCKGPT - Gestión de Inventarios</h1>

            <SearchBar
                articles={articles}
                setSelectedArticle={setSelectedArticle}
                searchInputRef={searchInputRef}
            />

            {selectedArticle && (
                <ArticleDetails
                    article={selectedArticle}
                    onSubmit={(quantity) => handleArticleSubmit(selectedArticle, quantity)}
                />
            )}

            {missingArticles.length > 0 && (
                <MissingArticles
                    missingArticles={missingArticles}
                    setStockForMissing={handleSetStockForMissing}
                />
            )}

            <div className="mt-4">
                {!isStockFinalized ? (
                    <button
                        className="btn btn-warning"
                        onClick={handleFinalizeStock}
                        disabled={articles.length === 0}
                    >
                        Finalizar Ingreso
                    </button>
                ) : (
                    <button
                        className="btn btn-success"
                        onClick={handleConfirmStock}
                        disabled={articles.some((article) => article.quantity === null)}
                    >
                        Confirmar Stock
                    </button>
                )}
            </div>
        </div>
    );
}

export default MainApp;
