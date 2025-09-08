const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.sqlite');
const SQL_INIT = path.join(__dirname, '..', 'sql', 'init.sql');

if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

const db = new Database(DB_PATH);
// Enable foreign keys
db.pragma('foreign_keys = ON');

// Execute schema if the DB is empty (simple check)
const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='patient'").get();
if (!row) {
    const sql = fs.readFileSync(SQL_INIT, 'utf8');
    db.exec(sql);
}

module.exports = db;