const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', 'database', 'tergeu.db');
const SCHEMA_PATH = path.join(__dirname, '..', 'database', 'schema.sql');

let db;

function initDatabase() {
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Run schema
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    db.exec(schema);

    // Seed admin user if not exists
    const adminExists = db.prepare('SELECT id FROM users WHERE iin = ?').get('000000000000');
    if (!adminExists) {
        const hash = bcrypt.hashSync('admin123', 10);
        db.prepare(`
            INSERT INTO users (iin, password_hash, full_name, full_name_kz, rank, department, role, language_pref)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            '000000000000',
            hash,
            'Администратор системы',
            'Жүйе әкімшісі',
            'Администратор',
            'IT отдел',
            'admin',
            'ru'
        );
        console.log('✅ Администратор создан (ИИН: 000000000000, пароль: admin123)');
    }

    console.log('✅ База данных инициализирована');
    return db;
}

function getDb() {
    if (!db) {
        return initDatabase();
    }
    return db;
}

module.exports = { initDatabase, getDb };
