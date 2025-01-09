const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");
const { writeFile } = require("fs/promises");
const { parse } = require("json2csv");
const fs = require("fs");
const path = require("path");
const { requestLogger, errorHandler } = require("./debugMiddleware"); // Importar el middleware

const app = express();
const PORT = 3000;

// Rutas externas
const stockRoutes = require("./routes/stockRoutes");

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(requestLogger); // Agregar middleware de depuración
app.use("/api", stockRoutes);

// Base de datos SQLite
const db = new sqlite3.Database("./stockgpt.db", (err) => {
    if (err) {
        console.error("Error al conectar a la base de datos:", err.message);
    } else {
        console.log("Conectado a la base de datos SQLite.");
    }
});

// Crear tabla si no existe
db.run(
    `CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER DEFAULT 0
    )`,
    (err) => {
        if (err) {
            console.error("Error al crear tabla:", err.message);
        } else {
            console.log('Tabla "articles" lista.');
        }
    }
);

// Obtener artículos
app.get("/api/articles", (req, res) => {
    db.all("SELECT * FROM articles", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Actualizar cantidad de un artículo
app.post("/api/articles/update", (req, res) => {
    const { id, quantity } = req.body;
    db.run(
        "UPDATE articles SET quantity = ? WHERE id = ?",
        [quantity, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ message: "Artículo actualizado correctamente." });
            }
        }
    );
});

// Descargar datos como Excel
app.get("/api/articles/download", async (req, res) => {
    try {
        db.all("SELECT * FROM articles ORDER BY name ASC", [], async (err, rows) => {
            if (err) {
                res.status(500).send("Error al obtener los datos.");
            } else {
                const csv = parse(rows);
                const filePath = "./articulos.csv";
                await writeFile(filePath, csv);
                res.download(filePath, "articulos.csv", (err) => {
                    if (err) {
                        console.error("Error al descargar el archivo:", err);
                        res.status(500).send("Error al descargar el archivo.");
                    }
                });
            }
        });
    } catch (error) {
        res.status(500).send("Error generando el archivo Excel.");
    }
});

// Crear carpeta 'data' si no existe
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Manejo de errores global
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
