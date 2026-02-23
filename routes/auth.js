import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../database/mysql.js';

const router = express.Router();

// Walidacja email
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Admin email who can create users
const ADMIN_EMAIL = 'malasiewicz.mariusz@gmail.com';

// POST /api/auth/register - rejestracja użytkownika (tylko dla admina)
router.post('/register', async (req, res) => {
    // Sprawdzenie czy użytkownik jest zalogowany
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Wymagane logowanie' });
    }
    
    // Sprawdzenie czy zalogowany użytkownik jest adminem
    if (req.session.user.mail !== ADMIN_EMAIL) {
        return res.status(403).json({ error: 'Tylko administrator może tworzyć nowe konta' });
    }
    
    const { mail, password } = req.body;
    
    // Walidacja danych wejściowych
    if (!mail || !password) {
        return res.status(400).json({ error: 'Email i hasło są wymagane' });
    }
    
    if (!isValidEmail(mail)) {
        return res.status(400).json({ error: 'Nieprawidłowy format email' });
    }
    
    if (password.length < 4) {
        return res.status(400).json({ error: 'Hasło musi mieć minimum 4 znaki' });
    }
    
    try {
        // Sprawdzenie czy użytkownik już istnieje
        const [existing] = await pool.execute('SELECT id FROM users WHERE mail = ?', [mail]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Użytkownik z tym emailem już istnieje' });
        }
        
        // Hashowanie hasła
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Tworzenie użytkownika
        const [result] = await pool.execute(
            'INSERT INTO users (mail, password) VALUES (?, ?)',
            [mail, hashedPassword]
        );
        
        res.status(201).json({ message: 'Konto utworzone pomyślnie', userId: result.insertId });
    } catch (err) {
        console.error('Błąd rejestracji:', err.message);
        res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
    }
});

// POST /api/auth/login - logowanie użytkownika
router.post('/login', async (req, res) => {
    const { mail, password } = req.body;
    
    // Walidacja danych wejściowych
    if (!mail || !password) {
        return res.status(400).json({ error: 'Email i hasło są wymagane' });
    }
    
    try {
        // Pobranie użytkownika
        const [rows] = await pool.execute('SELECT * FROM users WHERE mail = ?', [mail]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
        }
        
        const user = rows[0];
        
        // Weryfikacja hasła
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
        }
        
        // Ustawienie sesji
        const loginTime = new Date().toISOString();
        req.session.user = {
            id: user.id,
            mail: user.mail,
            loginTime: loginTime
        };
        
        res.json({ 
            message: 'Zalogowano pomyślnie', 
            user: { 
                id: user.id, 
                mail: user.mail,
                loginTime: new Date().toISOString()
            } 
        });
    } catch (err) {
        console.error('Błąd logowania:', err.message);
        res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
    }
});

// POST /api/auth/logout - wylogowanie użytkownika
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Błąd wylogowania:', err.message);
            return res.status(500).json({ error: 'Błąd podczas wylogowania' });
        }
        res.json({ message: 'Wylogowano pomyślnie' });
    });
});

// GET /api/auth/status - sprawdzenie statusu autoryzacji
router.get('/status', (req, res) => {
    if (req.session && req.session.user) {
        res.json({ 
            isAuthenticated: true, 
            user: {
                id: req.session.user.id,
                mail: req.session.user.mail,
                loginTime: req.session.user.loginTime
            }
        });
    } else {
        res.json({ isAuthenticated: false });
    }
});

export default router;
