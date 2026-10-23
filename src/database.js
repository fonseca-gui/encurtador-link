
const Database = require("better-sqlite3");
const path = require("node:path");
const fs = require("node:fs");

const dataDirectory = path.join(__dirname, "..", "data");

fs.mkdirSync(dataDirectory, { recursive: true });

const databasePath = path.join(dataDirectory, "links.db");

const db = new Database(databasePath);

// Ativa as chaves estrangeiras e configura a espera por bloqueios.
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");
db.pragma("busy_timeout = 5000");

// Cria a tabela se ela ainda não existir.
db.exec(`
  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    original_url TEXT NOT NULL,
    clicks INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;
