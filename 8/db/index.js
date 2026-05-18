const Database = require('better-sqlite3');
const { drizzle } = require('drizzle-orm/better-sqlite3');
const { migrate } = require('drizzle-orm/better-sqlite3/migrator');

const isTest = process.env.NODE_ENV === 'test';
const sqlite = new Database(isTest ? ':memory:' : 'sqlite.db');

const db = drizzle(sqlite);

// V testovacím režimu spustíme migrace přímo v paměti
if (isTest) {
    migrate(db, { migrationsFolder: './db/migrations' });
}

module.exports = { db };