// API Configuration - używa względnych ścieżek dla produkcji
export const API_URL = window.location.origin + '/api';

// Database Configuration
export const DB_CONFIG = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'solucje',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};
