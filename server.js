const express = require('express');
const path = require('path');
const fs = require('fs');
const Gun = require('gun');

const app = express();
const PORT = process.env.PORT || 8765;

// 📁 Percorso del file per salvare i dati
const DATA_FILE = path.join(__dirname, 'data.json');

// 📥 Carica i dati salvati (se esistono)
let initialData = {};
if (fs.existsSync(DATA_FILE)) {
  try {
    initialData = JSON.parse(fs.readFileSync(DATA_FILE));
    console.log("✅ Dati iniziali caricati da data.json");
  } catch (e) {
    console.error("⚠️ Errore leggendo data.json:", e);
  }
}

// 📂 Servi la cartella "public" dove si trova index.html
app.use(express.static(path.join(__dirname, 'public')));

// 🚀 Avvia il server Express
const server = app.listen(PORT, () => {
  console.log(`🚀 Nodo sbotto attivo su http://localhost:${PORT}`);
});

// 🌐 Avvia GUN come nodo P2P
const gun = Gun({
  web: server,
  file: false // disattiviamo il salvataggio automatico di GUN per gestirlo noi
});

// 💾 Salvataggio automatico su file ogni volta che cambia qualcosa
gun.on('put', () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(gun._.graph, null, 2));
    console.log("💾 Dati salvati su data.json");
  } catch (e) {
    console.error("❌ Errore nel salvataggio dati:", e);
  }
});

// 🔁 Ricarica i dati salvati al riavvio
if (Object.keys(initialData).length > 0) {
  console.log("🔁 Ripristino dati nel grafo GUN...");
  Object.entries(initialData).forEach(([key, value]) => {
    gun.get(key).put(value);
  });
}

// 📤 Rotta per fornire snapshot JSON
app.get('/snapshot.json', (req, res) => {
  if (fs.existsSync(DATA_FILE)) {
    res.sendFile(DATA_FILE);
  } else {
    res.json({});
  }
});

console.log("✅ Nodo GUN attivo e pronto come peer P2P.");
