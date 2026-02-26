import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { pool, initDatabase } from './database/mysql.js';
import { validateCreateEntry, validateUpdateEntry, validateId } from './validators/entryValidator.js';
import { ALLOWED_MODULES, MAX_LENGTHS, ERROR_MESSAGES } from './constants.js';
import authRoutes from './routes/auth.js';
import { requireAuth } from './middleware/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware sesji
app.use(session({
    secret: process.env.SESSION_SECRET || 'solucje-ai-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 godziny
    }
}));

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

// Trasy autoryzacji
app.use('/api/auth', authRoutes);

// GET - pobierz liczbę wpisów (wymaga logowania) - musi być PRZED /api/entries/:id
app.get('/api/entries/count', requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT COUNT(*) as count FROM entries');
        res.json({ count: rows[0].count });
    } catch (err) {
        console.error('Błąd SELECT COUNT:', err.message);
        res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_ERROR });
    }
});

// GET - pobierz wszystkie wpisy (z filtrowaniem) - wymaga logowania
app.get('/api/entries', requireAuth, async (req, res) => {
    const { module, search } = req.query;
    
    let sql = 'SELECT * FROM entries WHERE 1=1';
    const params = [];
    
    if (module) {
        if (typeof module !== 'string' || module.length > MAX_LENGTHS.MODULE) {
            return res.status(400).json({ error: ERROR_MESSAGES.INVALID_MODULE_PARAM });
        }
        sql += ' AND UPPER(module) = ?';
        params.push(module.toUpperCase());
    }
    
    if (search) {
        if (typeof search !== 'string' || search.length > MAX_LENGTHS.SEARCH) {
            return res.status(400).json({ error: ERROR_MESSAGES.INVALID_SEARCH_PARAM });
        }
        sql += ' AND (title LIKE ? OR content LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    try {
        const [rows] = await pool.execute(sql, params);
        res.json(rows);
    } catch (err) {
        console.error('Błąd SELECT:', err.message);
        res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_ERROR });
    }
});

// GET - pobierz wszystkie moduły (wymaga logowania)
app.get('/api/modules', requireAuth, (req, res) => {
    res.json(ALLOWED_MODULES);
});

// GET - pobierz pojedynczy wpis (wymaga logowania)
app.get('/api/entries/:id', requireAuth, async (req, res) => {
    const id = req.params.id;
    
    if (!validateId(id)) {
        return res.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
    }
    
    try {
        const [rows] = await pool.execute('SELECT * FROM entries WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Wpis nie znaleziony' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Błąd SELECT:', err.message);
        res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_ERROR });
    }
});

// POST - dodaj nowy wpis (wymaga logowania)
app.post('/api/entries', requireAuth, async (req, res) => {
    const validation = validateCreateEntry(req.body);
    if (!validation.isValid) {
        return res.status(400).json({ error: validation.errors.join(', ') });
    }
    
    const { module, title, content } = req.body;
    
    const sql = `
        INSERT INTO entries (module, title, content, edit_date)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    try {
        const [result] = await pool.execute(sql, [module.toUpperCase(), title, content || '']);
        res.json({ id: result.insertId, message: 'Wpis dodany' });
    } catch (err) {
        console.error('Błąd INSERT:', err.message);
        res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_ERROR });
    }
});

// PUT - edytuj wpis (wymaga logowania)
app.put('/api/entries/:id', requireAuth, async (req, res) => {
    const id = req.params.id;
    
    if (!validateId(id)) {
        return res.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
    }
    
    const validation = validateUpdateEntry(req.body);
    if (!validation.isValid) {
        return res.status(400).json({ error: validation.errors.join(', ') });
    }
    
    const { module, title, content } = req.body;
    
    const sql = `
        UPDATE entries 
        SET module = ?, title = ?, content = ?, edit_date = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    
    try {
        await pool.execute(sql, [module?.toUpperCase(), title, content || '', id]);
        res.json({ message: 'Wpis zaktualizowany' });
    } catch (err) {
        console.error('Błąd UPDATE:', err.message);
        res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_ERROR });
    }
});

// DELETE - usuń wpis (wymaga logowania)
app.delete('/api/entries/:id', requireAuth, async (req, res) => {
    const id = req.params.id;
    
    if (!validateId(id)) {
        return res.status(400).json({ error: ERROR_MESSAGES.INVALID_ID });
    }
    
    try {
        await pool.execute('DELETE FROM entries WHERE id = ?', [id]);
        res.json({ message: 'Wpis usunięty' });
    } catch (err) {
        console.error('Błąd DELETE:', err.message);
        res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_ERROR });
    }
});

// Inicjalizacja bazy danych i start serwera
initDatabase().then((success) => {
    if (success) {
        app.listen(PORT, () => {
            console.log(`Serwer działa na http://localhost:${PORT}`);
        });
    } else {
        console.error('Nie udało się połączyć z bazą danych');
        process.exit(1);
    }
});
