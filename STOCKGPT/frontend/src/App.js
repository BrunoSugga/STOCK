import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [articles, setArticles] = useState([]);
  const [file, setFile] = useState(null);

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

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const uploadFile = async () => {
    if (!file) return alert("Por favor, selecciona un archivo.");
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:3000/api/load-from-excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Archivo cargado exitosamente.");
      fetchArticles(); // Refrescar lista de artículos
    } catch (error) {
      console.error("Error al cargar el archivo:", error);
      alert("Hubo un error al cargar el archivo.");
    }
  };

  const downloadExcel = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/download-excel", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "articulos.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
    }
  };

  return (
    <div className="container">
      <h1 className="my-4">STOCKGPT - Gestión de Artículos</h1>

      <div className="mb-4">
        <input type="file" onChange={handleFileChange} />
        <button className="btn btn-primary ml-2" onClick={uploadFile}>
          Cargar Excel
        </button>
      </div>

      <button className="btn btn-success mb-4" onClick={downloadExcel}>
        Descargar Excel
      </button>

      <h2>Lista de Artículos</h2>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr key={article.id}>
              <td>{article.id}</td>
              <td>{article.name}</td>
              <td>{article.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
