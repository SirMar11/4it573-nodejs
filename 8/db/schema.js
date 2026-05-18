const { sqliteTable, text, integer } = require("drizzle-orm/sqlite-core");

const todos = sqliteTable("todos", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    completed: integer("completed").default(0),
    priority: text("priority").default("normal")
});

module.exports = { todos };