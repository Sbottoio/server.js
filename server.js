const express = require('express');
const path = require('path');
const fs = require('fs');
const Gun = require('gun');

const app = express();
const PORT = process.env.PORT || 8765;

// Percorso del file per salvare i dati
const DATA_FILE = path.join(__dirname, 'data.json');

// Carica dati salvati all'avvio
let initialData = {};
if (fs.existsSync(DATA_FILE)) {
  try {
    initialData = JSON.parse(fs.readFileSync(DATA_FILE));
    console.log("✅ Dati iniziali caricati da data.json");
  } catch (e) {
    console.error("⚠️ Errore leggendo data.json:", e);
  }
}

// Serviamo la cartella public dove c'è index.html
app.use(express.static(path.join(__dirname, 'public')));

// Avvia server
const server = app.listen(PORT, () => {
  console.log(`🚀 Nodo sbotto attivo su http://localhost:${PORT}`);
});

// Avvia GUN
const gun = Gun({ web: server });

// Salva dati su disco ogni volta che arrivano
gun.on('put', () => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(gun._.graph, null, 2));
});

// Re-inserisci dati salvati all'avvio
Object.keys(initialData).forEach(key => {
  gun.get(key).put(initialData[key]);
});
