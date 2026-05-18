const { serve } = require('@hono/node-server');
const { Hono } = require('hono');
const ejs = require('ejs');
const fs = require('fs/promises');
const path = require('path');

const app = new Hono();

// Naše dočasná "databáze" úkolů (v paměti RAM - po restartu serveru zmizí)
const tasks = ["Naučit se základy Node.js", "Zprovoznit Hono server"];

// Pomocná funkce pro načtení a vyrenderování EJS šablony
async function renderFile(filename, data) {
    const filepath = path.join(__dirname, 'views', filename);
    const template = await fs.readFile(filepath, 'utf-8');
    return ejs.render(template, data);
}

// 1. Hlavní stránka (/)
app.get('/', async (c) => {
    // Pošleme pole 'tasks' do šablony 'index.html'
    const html = await renderFile('index.html', { tasks: tasks });
    return c.html(html);
});

// 2. Zpracování formuláře (/add)
app.post('/add', async (c) => {
    const body = await c.req.parseBody();
    
    if (body.task && body.task.trim() !== "") {
        tasks.push(body.task.trim());
    }
    
    // Po přidání přesměrujeme uživatele zpět na hlavní stránku
    return c.redirect('/');
});

// 3. Ošetření neexistujících stránek (404 Not Found)
app.notFound(async (c) => {
    const html = await renderFile('404.html', {});
    return c.html(html, 404);
});

// Spuštění serveru
const port = 3000;
console.log(`Server běží na http://localhost:${port}`);

serve({
    fetch: app.fetch,
    port: port
});