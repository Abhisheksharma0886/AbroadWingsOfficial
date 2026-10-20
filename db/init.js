'use strict';
/**
 * SQLite database layer using sql.js (pure-JavaScript, no native compilation).
 * The database is saved to and loaded from a file on each write.
 */
require('dotenv').config();
const initSqlJs = require('sql.js');
const path      = require('path');
const fs        = require('fs');

const DB_PATH = path.resolve(process.env.DB_PATH || './db/future_abroad.sqlite');
const dir     = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

let _db   = null;
let _SQL  = null;

async function getDb() {
  if (_db) return _db;
  _SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const data = fs.readFileSync(DB_PATH);
    _db = new _SQL.Database(data);
  } else {
    _db = new _SQL.Database();
  }

  // Initial schema
  _db.run(`
    CREATE TABLE IF NOT EXISTS enquiries (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      email         TEXT    NOT NULL,
      whatsapp      TEXT    NOT NULL,
      qualification TEXT    NOT NULL,
      degree        TEXT    NOT NULL,
      major         TEXT    NOT NULL,
      intake_year   TEXT    NOT NULL,
      semester      TEXT    NOT NULL,
      percentage    TEXT,
      budget        TEXT,
      message       TEXT,
      consent       INTEGER NOT NULL DEFAULT 1,
      ip_hash       TEXT,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      status        TEXT    NOT NULL DEFAULT 'new'
    );
    CREATE INDEX IF NOT EXISTS idx_enquiries_email   ON enquiries(email);
    CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries(created_at);
  `);
  persist();
  console.log('[DB] Ready at', DB_PATH);
  return _db;
}

function persist() {
  if (!_db) return;
  const data = _db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

module.exports = { getDb, persist };
