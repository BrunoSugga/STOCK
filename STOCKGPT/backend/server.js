const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const xlsx = require('xlsx');
const fs = require('fs');

// Inicializamos la aplicación de Express
const app = express();
const PORT = 3000;

// Configuración de middleware
app.use(cors());
app.use(bodyParser.json());

// Configuración de la base de datos SQLite
const db = new sqlite3.Database(path.resolve(__dirname, 'stockgpt.db'), (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
    }
});

// Crear tabla para los artículos si no existe
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            quantity INTEGER DEFAULT 0
        )
    `, (err) => {
        if (err) {
            console.error('Error al crear la tabla:', err.message);
        } else {
            console.log('Tabla "articles" lista.');
        }
    });
});

// Ruta para cargar artículos desde el Excel en ruta fija
app.post('/api/load-from-excel', (req, res) => {
    try {
        // Ruta fija del archivo Excel
        const excelPath = path.resolve('C:/Users/bruno/Desktop/STOCK');
        const workbook = xlsx.readFile(path.join(excelPath, 'articulos.xlsx'));

        // Leer la hoja "Informe"
        const worksheet = workbook.Sheets['Informe'];
        if (!worksheet) {
            return res.status(400).json({ error: 'La hoja "Informe" no existe en el archivo Excel.' });
        }

        // Convertir datos de la hoja a JSON
        const data = xlsx.utils.sheet_to_json(worksheet);

        // Validar y extraer la columna "Articulo"
        if (!data[0] || !data[0]['Articulo']) {
            return res.status(400).json({ error: 'La columna "Articulo" no existe en la hoja "Informe".' });
        }

        const articles = data.map(row => row['Articulo']);
        const placeholders = articles.map(name => [name, 0]); // Cantidad predeterminada: 0
        const sql = 'INSERT INTO articles (name, quantity) VALUES (?, ?)';

        // Guardar artículos en la base de datos
        db.serialize(() => {
            const stmt = db.prepare(sql);
            placeholders.forEach(values => {
                stmt.run(values, (err) => {
                    if (err) {
                        console.error('Error al insertar artículo:', err.message);
                    }
                });
            });
            stmt.finalize();
        });

        res.json({ message: 'Artículos cargados exitosamente desde Excel.', articles });

    } catch (error) {
        console.error('Error al procesar el archivo Excel:', error.message);
        res.status(500).json({ error: 'Error al procesar el archivo Excel.' });
    }
});

// Ruta para descargar los datos en formato Excel
app.get('/api/download-excel', (req, res) => {
    try {
        // Consulta para obtener todos los artículos
        db.all('SELECT * FROM articles', [], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Crear un nuevo libro de Excel
            const workbook = xlsx.utils.book_new();
            const worksheet = xlsx.utils.json_to_sheet(rows);

            // Agregar la hoja al libro
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Artículos');

            // Ruta temporal para guardar el archivo
            const filePath = path.join(__dirname, 'articulos.xlsx');

            // Escribir el archivo Excel
            xlsx.writeFile(workbook, filePath);

            // Enviar el archivo como respuesta
            res.download(filePath, 'articulos.xlsx', (err) => {
                if (err) {
                    console.error('Error al enviar el archivo:', err.message);
                }

                // Eliminar el archivo temporal después de enviarlo
                fs.unlinkSync(filePath);
            });
        });
    } catch (error) {
        console.error('Error al generar el archivo Excel:', error.message);
        res.status(500).json({ error: 'Error al generar el archivo Excel.' });
    }
});

// Rutas existentes
app.get('/api/articles', (req, res) => {
    db.all('SELECT * FROM articles', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

app.post('/api/articles', (req, res) => {
    const { name, quantity } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'El nombre del artículo es obligatorio.' });
    }
    db.run('INSERT INTO articles (name, quantity) VALUES (?, ?)', [name, quantity || 0], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID });
        }
    });
});

app.post('/api/articles/update', (req, res) => {
    const { id, quantity } = req.body;
    if (!id || quantity === undefined) {
        return res.status(400).json({ error: 'ID y cantidad son obligatorios.' });
    }
    db.run('UPDATE articles SET quantity = ? WHERE id = ?', [quantity, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ updated: this.changes });
        }
    });
});

app.delete('/api/articles/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM articles WHERE id = ?', id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ deleted: this.changes });
        }
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
