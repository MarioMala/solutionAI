import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const jsonPath = path.join(__dirname, 'db_old.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const modules = ['srs', 'scm', 'kdw', 'sql', 'eru', 'scd', 'sok', 'sek', 'sdr', 'skj', 'slab', 'sop', 'szyk3', 'wadm'];

let totalProcessed = 0;
let totalImported = 0;
let skippedCount = 0;

db.serialize(() => {
    // Drop and recreate table to ensure clean import
    db.run(`DROP TABLE IF EXISTS entries`);

    db.run(`
        CREATE TABLE entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            module TEXT NOT NULL,
            original_id INTEGER,
            title TEXT NOT NULL,
            content TEXT,
            at_date DATETIME,
            edit_date DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(module, original_id)
        )
    `);

    // Use INSERT OR IGNORE to skip duplicates within same module
    const stmt = db.prepare(`
        INSERT OR IGNORE INTO entries (module, original_id, title, content, at_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const module of modules) {
        if (jsonData[module] && Array.isArray(jsonData[module])) {
            for (const entry of jsonData[module]) {
                if (!entry.id) {
                    skippedCount++;
                    continue;
                }

                // Convert create_at format (DD.MM.RRRR, HH:MM:SS) to SQLite datetime format
                let createdAt = null;
                if (entry.create_at) {
                    const parts = entry.create_at.split(', ');
                    if (parts.length === 2) {
                        const dateParts = parts[0].split('.');
                        const timeParts = parts[1].split(':');
                        if (dateParts.length === 3 && timeParts.length === 3) {
                            createdAt = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]} ${timeParts[0]}:${timeParts[1]}:${timeParts[2]}`;
                        }
                    }
                }

                stmt.run(module, entry.id, entry.title || '', entry.content || '', null, createdAt);
                totalImported++;
                totalProcessed++;
            }
            console.log(`Processed ${jsonData[module].length} entries from module: ${module}`);
        }
    }

    stmt.finalize();
});

db.close((err) => {
    if (err) {
        console.error('Błąd zamykania bazy danych:', err.message);
    } else {
        console.log(`\nMigration completed!`);
        console.log(`Total entries processed: ${totalProcessed}`);
        console.log(`Entries imported (incl. duplicates skipped): ${totalImported}`);
        if (skippedCount > 0) {
            console.log(`Entries skipped (no id): ${skippedCount}`);
        }
    }
});
