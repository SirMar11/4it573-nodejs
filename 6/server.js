const { serve } = require('@hono/node-server');
const { Hono } = require('hono');
const ejs = require('ejs');
const fs = require('fs/promises');
const path = require('path');
const { db } = require('./db');
const { todos } = require('./db/schema');
const { eq } = require('drizzle-orm'); // Pro vyhledávání podle ID

const app = new Hono();
const generateId = () => Math.random().toString(36).substring(2, 9);

async function renderFile(filename, data) {
    const filepath = path.join(__dirname, 'views', filename);
    const template = await fs.readFile(filepath, 'utf-8');
    return ejs.render(template, data);
}

app.get('/', async (c) => {
    // Načtení všech úkolů z databáze
    const allTasks = await db.select().from(todos);
    return c.html(await renderFile('index.html', { tasks: allTasks }));
});

app.post('/add', async (c) => {
    const body = await c.req.parseBody();
    if (body.task && body.task.trim() !== "") {
        // Zápis do databáze (včetně výchozí priority)
        await db.insert(todos).values({ 
            id: generateId(), 
            title: body.task.trim(), 
            completed: 0,
            priority: body.priority || 'normal'
        });
    }
    return c.redirect('/');
});

app.get('/todo/:id', async (c) => {
    const id = c.req.param('id');
    const result = await db.select().from(todos).where(eq(todos.id, id));
    
    if (result.length === 0) return c.notFound();
    return c.html(await renderFile('detail.html', { task: result[0] }));
});

app.get('/todo/:id/toggle', async (c) => {
    const id = c.req.param('id');
    const result = await db.select().from(todos).where(eq(todos.id, id));
    
    if (result.length > 0) {
        const currentTask = result[0];
        // Přepnutí 0 na 1 a naopak
        await db.update(todos).set({ completed: currentTask.completed === 1 ? 0 : 1 }).where(eq(todos.id, id));
    }
    return c.redirect(`/todo/${id}`);
});

app.get('/todo/:id/delete', async (c) => {
    const id = c.req.param('id');
    await db.delete(todos).where(eq(todos.id, id));
    return c.redirect('/');
});

app.post('/todo/:id/edit', async (c) => {
    const body = await c.req.parseBody();
    const id = c.req.param('id');
    
    // Zde aktualizujeme nejen titulek, ale nově i prioritu z formuláře
    if (body.title && body.title.trim() !== "") {
        await db.update(todos).set({ 
            title: body.title.trim(),
            priority: body.priority
        }).where(eq(todos.id, id));
    }
    return c.redirect(`/todo/${id}`);
});

app.notFound(async (c) => {
    return c.html(await renderFile('404.html', {}), 404);
});

serve({ fetch: app.fetch, port: 3000 });
console.log(`Server běží na http://localhost:3000`);