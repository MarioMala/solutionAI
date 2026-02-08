import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// CORS dla lokalnego testowania
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// GET - pobierz wszystkie wpisy (z filtrowaniem)
app.get('/api/entries', (req, res) => {
    const { module, search } = req.query;
    
    let sql = 'SELECT * FROM entries WHERE 1=1';
    const params = [];
    
    if (module) {
        sql += ' AND module = ?';
        params.push(module);
    }
    
    if (search) {
        sql += ' AND (title LIKE ? OR content LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// GET - pobierz unikalne moduły
app.get('/api/modules', (req, res) => {
    db.all('SELECT DISTINCT module FROM entries ORDER BY module', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows.map(r => r.module));
    });
});

// POST - dodaj nowy wpis
app.post('/api/entries', (req, res) => {
    const { module, title, content, at_date } = req.body;
    
    const sql = `
        INSERT INTO entries (module, title, content, at_date, edit_date)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    db.run(sql, [module, title, content || '', at_date || null], function(err) {
        if (err) {
            console.error('Błąd INSERT:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Wpis dodany' });
    });
});

// PUT - edytuj wpis
app.put('/api/entries/:id', (req, res) => {
    const { module, title, content, at_date } = req.body;
    const id = req.params.id;
    
    const sql = `
        UPDATE entries 
        SET module = ?, title = ?, content = ?, at_date = ?, edit_date = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    
    db.run(sql, [module, title, content || '', at_date || null, id], function(err) {
        if (err) {
            console.error('Błąd UPDATE:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Wpis zaktualizowany' });
    });
});

// DELETE - usuń wpis
app.delete('/api/entries/:id', (req, res) => {
    const id = req.params.id;
    
    db.run('DELETE FROM entries WHERE id = ?', id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Wpis usunięty' });
    });
});

app.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
});
