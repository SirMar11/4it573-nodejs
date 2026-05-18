const test = require('ava').default || require('ava');
const app = require('./server'); 
const { db } = require('./db');
const { todos } = require('./db/schema');

test.serial('1. GET / - Zobrazení hlavní stránky (vrátí HTTP 200)', async (t) => {
    const res = await app.request('/');
    
    t.is(res.status, 200, 'Server by měl vrátit status 200');
    
    const text = await res.text();
    t.true(text.includes('Moje úkoly'), 'HTML by mělo obsahovat hlavní nadpis aplikace');
});

test.serial('2. POST /add - Přidání nového úkolu a přesměrování', async (t) => {
    // Připravíme data z formuláře
    const formData = new URLSearchParams();
    formData.append('task', 'Testovací integrace');
    formData.append('priority', 'high');

    const res = await app.request('/add', {
        method: 'POST',
        body: formData.toString(),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    // Po POSTu standardně děláme redirect (HTTP 302) na hlavní stranu
    t.is(res.status, 302);
    t.is(res.headers.get('location'), '/');

    // Ověříme, že se to reálně uložilo do in-memory databáze
    const allTasks = await db.select().from(todos);
    const naseTodo = allTasks.find(task => task.title === 'Testovací integrace');
    
    t.truthy(naseTodo, 'Úkol by se měl uložit do databáze');
    t.is(naseTodo.priority, 'high', 'Úkol by měl mít správnou prioritu');
    t.is(naseTodo.completed, 0, 'Úkol by měl být ve výchozím stavu nedokončený');
});

test.serial('3. GET /todo/:id - Zobrazení detailu úkolu', async (t) => {
    // Vložíme si testovací data přímo do databáze
    const testId = 'test-detail-id';
    await db.insert(todos).values({ 
        id: testId, 
        title: 'Detailní test', 
        completed: 0, 
        priority: 'low' 
    });

    const res = await app.request(`/todo/${testId}`);
    
    t.is(res.status, 200);
    const text = await res.text();
    t.true(text.includes('Detailní test'), 'Stránka by měla obsahovat titulek daného úkolu');
});

test.serial('4. GET /todo/:id/delete - Odstranění úkolu', async (t) => {
    const deleteId = 'test-delete-id';
    await db.insert(todos).values({ 
        id: deleteId, 
        title: 'Úkol na smazání', 
        completed: 0, 
        priority: 'normal' 
    });

    // Simulujeme kliknutí na odkaz "Odstranit"
    const res = await app.request(`/todo/${deleteId}/delete`);
    t.is(res.status, 302, 'Po smazání by mělo nastat přesměrování');

    // Ověření, že úkol byl skutečně odstraněn z databáze
    const allTasks = await db.select().from(todos);
    const smazaneTodo = allTasks.find(task => task.id === deleteId);
    
    t.falsy(smazaneTodo, 'Smazaný úkol by už neměl být v databázi dohledatelný');
});