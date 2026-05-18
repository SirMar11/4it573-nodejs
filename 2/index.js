const { readFile, writeFile } = require('fs/promises');

async function zkopirujSoubor() {
    try {
        // 1. Pokus o načtení instrukcí
        let instrukceData;
        try {
            instrukceData = await readFile('instrukce.txt', 'utf-8');
        } catch (error) {
            console.error('Chyba: Soubor "instrukce.txt" neexistuje nebo ho nelze přečíst.');
            return;
        }

        // Zpracování instrukcí - rozdělíme text podle odřádkování a odstraníme prázdné mezery
        const radky = instrukceData.split('\n').map(radek => radek.trim()).filter(radek => radek !== '');
        
        if (radky.length < 2) {
            console.error('Chyba: Soubor "instrukce.txt" neobsahuje dostatek instrukcí. Zadejte zdrojový a na další řádek cílový soubor.');
            return;
        }

        const zdrojovySoubor = radky[0];
        const cilovySoubor = radky[1];

        // 2. Pokus o načtení zdrojového souboru
        let dataZdroje;
        try {
            dataZdroje = await readFile(zdrojovySoubor, 'utf-8');
        } catch (error) {
            console.error(`Chyba: Zdrojový soubor "${zdrojovySoubor}" neexistuje.`);
            return;
        }

        // 3. Zápis do cílového souboru (vytvoří se, pokud neexistuje)
        await writeFile(cilovySoubor, dataZdroje, 'utf-8');
        console.log(`Úspěch: Obsah souboru "${zdrojovySoubor}" byl úspěšně zkopírován do "${cilovySoubor}".`);

    } catch (error) {
        // Záchyt všech neočekávaných chyb
        console.error('Došlo k neočekávané chybě:', error.message);
    }
}

zkopirujSoubor();