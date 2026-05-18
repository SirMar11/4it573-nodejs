const { serve } = require('@hono/node-server');
const { Hono } = require('hono');
const ejs = require('ejs');
const fs = require('fs/promises');
const path = require('path');

const app = new Hono();

// Rozšířená datová struktura (nyní pole objektů)
let tasks = [
    { id: '1', title: 'Naučit se Node.js', completed: false },
    { id: '2', title: 'Zprovoznit Hono', completed: true }
];

// Pomocná funkce pro generování unikátních ID
const generateId = () => Math.random().toString(36).substring(2, 9);

async function renderFile(filename, data) {
    const filepath = path.join(__dirname, 'views', filename);
    const template = await fs.readFile(filepath, 'utf-8');
    return ejs.render(template, data);
}

// Zobrazení seznamu
app.get('/', async (c) => {
    return c.html(await renderFile('index.html', { tasks }));
});

// Přidání nového úkolu
app.post('/add', async (c) => {
    const body = await c.req.parseBody();
    if (body.task && body.task.trim() !== "") {
        tasks.push({ id: generateId(), title: body.task.trim(), completed: false });
    }
    return c.redirect('/');
});

// Zobrazení detailu konkrétního úkolu
app.get('/todo/:id', async (c) => {
    const id = c.req.param('id');
    const task = tasks.find(t => t.id === id);
    
    if (!task) return c.notFound(); // Pokud neexistuje, Hono automaticky zavolá app.notFound
    
    return c.html(await renderFile('detail.html', { task }));
});

// Přepnutí stavu (odkaz)
app.get('/todo/:id/toggle', (c) => {
    const task = tasks.find(t => t.id === c.req.param('id'));
    if (task) task.completed = !task.completed;
    return c.redirect(`/todo/${c.req.param('id')}`);
});

// Smazání (odkaz)
app.get('/todo/:id/delete', (c) => {
    tasks = tasks.filter(t => t.id !== c.req.param('id'));
    return c.redirect('/');
});

// Úprava titulku (formulář)
app.post('/todo/:id/edit', async (c) => {
    const body = await c.req.parseBody();
    const task = tasks.find(t => t.id === c.req.param('id'));
    
    if (task && body.title && body.title.trim() !== "") {
        task.title = body.title.trim();
    }
    return c.redirect(`/todo/${c.req.param('id')}`);
});

app.notFound(async (c) => {
    return c.html(await renderFile('404.html', {}), 404);
});

serve({ fetch: app.fetch, port: 3000 });
console.log(`✅ Hono server běží na http://localhost:3000`);