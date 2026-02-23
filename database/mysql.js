import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'solucje',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const initDatabase = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Połączono z bazą MySQL');
        
        // Tworzenie tabeli entries
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS entries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                module VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                at_date DATETIME,
                edit_date DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Tabela entries gotowa');
        
        // Tworzenie tabeli users
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                mail VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Tabela users gotowa');
        
        connection.release();
        return true;
    } catch (err) {
        console.error('Błąd połączenia z bazą MySQL:', err.message);
        return false;
    }
};

export { pool, initDatabase };
