import mysql from 'mysql2/promise';

const config = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'solucje'
};

const init = async () => {
    console.log('Inicjalizacja bazy danych MySQL...');
    
    // Najpierw utwórz bazę bez wybrania
    const connectionNoDb = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: ''
    });
    
    try {
        // Utwórz bazę danych
        await connectionNoDb.execute('CREATE DATABASE IF NOT EXISTS solucje');
        console.log('Baza danych solucje utworzona/istnieje');
        connectionNoDb.end();
        
        // Teraz połącz z bazą i utwórz tabelę
        const connection = await mysql.createConnection(config);
        
        // Utwórz tabelę używając query
        await connection.query(`
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
        console.log('Tabela entries utworzona/istnieje');
        
        // Sprawdź czy tabela istnieje
        const [tables] = await connection.query("SHOW TABLES LIKE 'entries'");
        console.log('Sprawdzenie tabeli:', tables);
        
        await connection.end();
        console.log('Gotowe!');
        
    } catch (err) {
        console.error('Błąd:', err.message);
        process.exit(1);
    }
};

init();
