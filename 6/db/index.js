const Database = require('better-sqlite3');
const { drizzle } = require('drizzle-orm/better-sqlite3');

const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite);

module.exports = { db };