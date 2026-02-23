import sqlite3 from 'sqlite3';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ścieżka do bazy SQLite
const sqlitePath = path.join(__dirname, 'database.sqlite');

// Konfiguracja MySQL
const mysqlConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'solucje'
};

const migrate = async () => {
    console.log('Rozpoczęcie migracji danych z SQLite do MySQL...');
    
    // Otwórz bazę SQLite
    const sqliteDb = new sqlite3.Database(sqlitePath);
    
    // Otwórz połączenie MySQL
    const mysqlPool = mysql.createPool(mysqlConfig);
    
    try {
        // Pobierz wszystkie dane z SQLite
        sqliteDb.all('SELECT * FROM entries', async (err, rows) => {
            if (err) {
                console.error('Błąd odczytu z SQLite:', err.message);
                process.exit(1);
            }
            
            console.log(`Znaleziono ${rows.length} rekordów w SQLite`);
            
            if (rows.length === 0) {
                console.log('Brak danych do migracji');
                sqliteDb.close();
                process.exit(0);
            }
            
            // Wstaw dane do MySQL
            for (const row of rows) {
                const sql = `
                    INSERT INTO entries (id, module, title, content, at_date, edit_date, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;
                
                try {
                    await mysqlPool.execute(sql, [
                        row.id,
                        row.module,
                        row.title,
                        row.content || '',
                        row.at_date || null,
                        row.edit_date || null,
                        row.created_at || new Date()
                    ]);
                    console.log(`Migrowano wpis ID: ${row.id}`);
                } catch (err) {
                    console.error(`Błąd migracji wpisu ID ${row.id}:`, err.message);
                }
            }
            
            console.log('Migracja zakończona!');
            
            // Weryfikacja
            const [count] = await mysqlPool.execute('SELECT COUNT(*) as count FROM entries');
            console.log(`W MySQL znajduje się ${count[0].count} rekordów`);
            
            sqliteDb.close();
            await mysqlPool.end();
            process.exit(0);
        });
    } catch (err) {
        console.error('Błąd migracji:', err.message);
        sqliteDb.close();
        await mysqlPool.end();
        process.exit(1);
    }
};

migrate();
