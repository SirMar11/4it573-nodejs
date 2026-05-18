const readlineSync = require('readline-sync');

const hadaneCislo = Math.floor(Math.random() * 11);
let pokusy = 5;
let vyhra = false;

console.log("Myslím si číslo od 0 do 10. Máš 5 pokusů na to ho uhodnout.");

while (pokusy > 0) {
    // readlineSync.question() funguje synchronně, úplně stejně jako prompt()
    const odpoved = readlineSync.question(`Zadej svuj tip (zbyva ${pokusy} pokusu): `);
    const tip = parseInt(odpoved, 10);

    if (tip === hadaneCislo) {
        console.log("Správně! Vyhrál jsi.");
        vyhra = true;
        break;
    } else if (tip < hadaneCislo) {
        console.log("Moje číslo je větší.");
    } else {
        console.log("Moje číslo je menší.");
    }

    pokusy--;
}

if (!vyhra) {
    console.log(`Prohrál jsi! Moje číslo bylo ${hadaneCislo}.`);
}