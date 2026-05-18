const { serve } = require('@hono/node-server');
const { Hono } = require('hono');
const ejs = require('ejs');
const fs = require('fs/promises');
const path = require('path');
const { WebSocketServer } = require('ws');
const { db } = require('./db');
const { todos } = require('./db/schema');
const { eq } = require('drizzle-orm');

const app = new Hono();
const generateId = () => Math.random().toString(36).substring(2, 9);

// Vykresluje .html soubory pomocí EJS
async function renderFile(filename, data) {
    const filepath = path.join(__dirname, 'views', filename);
    const template = await fs.readFile(filepath, 'utf-8');
    return ejs.render(template, data);
}

// --- WEBSOCKETY ---
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        try {
            const data = JSON.parse(msg);
            if (data.type === 'subscribe') ws.topic = data.topic;
        } catch (e) {
            console.error("Neplatná zpráva z WebSocketu", e);
        }
    });
});

function broadcast(topic, payload) {
    wss.clients.forEach(client => {
        if (client.readyState === 1 && client.topic === topic) {
            client.send(JSON.stringify(payload));
        }
    });
}
// ------------------

app.get('/', async (c) => {
    const allTasks = await db.select().from(todos);
    return c.html(await renderFile('index.html', { tasks: allTasks }));
});

app.post('/add', async (c) => {
    const body = await c.req.parseBody();
    if (body.task && body.task.trim() !== "") {
        await db.insert(todos).values({ 
            id: generateId(), 
            title: body.task.trim(), 
            completed: 0, 
            priority: body.priority || 'normal'
        });
        broadcast('list', { type: 'update' });
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
        const newStatus = currentTask.completed === 1 ? 0 : 1;
        await db.update(todos).set({ completed: newStatus }).where(eq(todos.id, id));
        
        broadcast('list', { type: 'update' });
        broadcast(`detail:${id}`, { type: 'update' });
    }
    return c.redirect(`/todo/${id}`);
});

app.get('/todo/:id/delete', async (c) => {
    const id = c.req.param('id');
    await db.delete(todos).where(eq(todos.id, id));
    
    broadcast('list', { type: 'update' });
    broadcast(`detail:${id}`, { type: 'deleted' });
    return c.redirect('/');
});

app.post('/todo/:id/edit', async (c) => {
    const body = await c.req.parseBody();
    const id = c.req.param('id');
    
    if (body.title && body.title.trim() !== "") {
        await db.update(todos).set({ 
            title: body.title.trim(), 
            priority: body.priority 
        }).where(eq(todos.id, id));
        
        broadcast('list', { type: 'update' });
        broadcast(`detail:${id}`, { type: 'update' });
    }
    return c.redirect(`/todo/${id}`);
});

app.notFound(async (c) => {
    return c.html(await renderFile('404.html', {}), 404);
});

// Spuštění HTTP a WS serveru pouze pokud soubor spouštíme napřímo (kvůli testům)
if (require.main === module) {
    const port = 3000;
    const serverInst = serve({ fetch: app.fetch, port });
    
    serverInst.on('upgrade', (request, socket, head) => {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    });
    
    console.log(`✅ Server s WebSockety běží na http://localhost:${port}`);
}

module.exports = app;