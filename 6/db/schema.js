const { sqliteTable, text, integer } = require("drizzle-orm/sqlite-core");

const todos = sqliteTable("todos", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    // SQLite nemá boolean, používáme integer (0 = false, 1 = true)
    completed: integer("completed").default(0), 
    
    // Nový sloupec z Úkolu č. 6 (v SQLite není nativní Enum, emulujeme ho přes text)
    priority: text("priority").default("normal") 
});

module.exports = { todos };