const { readFile, writeFile } = require('fs/promises');

async function generujSoubory() {
    try {
        // 1. Přečtení souboru s instrukcemi
        const data = await readFile('instrukce.txt', 'utf-8');
        const pocetSouboru = parseInt(data.trim(), 10);

        if (isNaN(pocetSouboru) || pocetSouboru <= 0) {
            console.error('❌ Chyba: Soubor "instrukce.txt" neobsahuje platné kladné číslo.');
            return;
        }

        // 2. Příprava pole pro asynchronní operace
        const poleSlidu = []; // Pole pro uložení jednotlivých Promises

        // 3. Naplnění pole operacemi (zatím na ně nečekáme)
        for (let i = 0; i < pocetSouboru; i++) {
            const nazevSouboru = `${i}.txt`;
            const obsah = `Soubor ${i}`;
            
            // Nevoláme await! Jen vytvoříme Promise a hodíme ji do pole
            poleSlidu.push(writeFile(nazevSouboru, obsah, 'utf-8'));
        }

        // 4. Paralelní spuštění všech zápisů
        await Promise.all(poleSlidu);

        // 5. Výpis po úspěšném dokončení VŠECH zápisů
        console.log(`Úspěch: Všechny soubory (celkem ${pocetSouboru}) byly úspěšně vytvořeny.`);

    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error('Chyba: Soubor "instrukce.txt" nebyl nalezen.');
        } else {
            console.error('Došlo k neočekávané chybě:', error.message);
        }
    }
}

generujSoubory();