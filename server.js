const express = require('express');
const path = require('path');
const fs = require('fs');
const Gun = require('gun');

const app = express();
const PORT = process.env.PORT || 8765;

// 📁 Percorso file dati
const DATA_FILE = path.join(__dirname, 'data.json');

// ✅ Se il file non esiste, crealo vuoto
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "{}");
  console.log("📄 Creato nuovo data.json vuoto");
}

// 📥 Carica i dati salvati all'avvio
let initialData = {};
try {
  initialData = JSON.parse(fs.readFileSync(DATA_FILE));
  console.log("✅ Dati iniziali caricati da data.json");
} catch (e) {
  console.error("⚠️ Errore leggendo data.json:", e);
  initialData = {};
}

// 📂 Servi i file statici (index.html ecc.)
app.use(express.static(path.join(__dirname, 'public')));

// 🚀 Avvia il server Express
const server = app.listen(PORT, () => {
  console.log(`🚀 Nodo sbotto attivo su http://localhost:${PORT}`);
});

// 🌐 Avvia GUN come nodo P2P
const gun = Gun({
  web: server,
  file: false // disattiviamo il salvataggio automatico interno
});

// 💾 Salvataggio automatico su file ogni volta che cambia qualcosa
gun.on('put', () => {
  try {
    const graph = gun._.graph || {};
    fs.writeFileSync(DATA_FILE, JSON.stringify(graph, null, 2));
    console.log("💾 Snapshot aggiornato in data.json");
  } catch (e) {
    console.error("❌ Errore nel salvataggio dati:", e);
  }
});

// 🔁 Ripristina i dati salvati nel grafo GUN al riavvio
if (Object.keys(initialData).length > 0) {
  console.log("🔁 Ripristino dati precedenti nel grafo GUN...");
  Object.entries(initialData).forEach(([key, value]) => {
    gun.get(key).put(value);
  });
}

// 📤 Rotta per lo snapshot JSON (per Safari e refresh automatici)
app.get('/snapshot.json', (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      res.setHeader('Content-Type', 'application/json');
      res.sendFile(DATA_FILE);
    } else {
      res.json({});
    }
  } catch (e) {
    console.error("⚠️ Errore leggendo snapshot:", e);
    res.status(500).json({ error: "Errore interno del server" });
  }
});

console.log("✅ Nodo GUN attivo e pronto come peer P2P.");
