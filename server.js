// server.js
const express = require('express');
const path = require('path');
const Gun = require('gun');

const app = express();
const PORT = process.env.PORT || 8765;

// Serve i file statici (index.html, CSS, immagini, ecc.)
app.use(express.static(path.join(__dirname, 'public')));

// Avvia il server web
const server = app.listen(PORT, () => {
  console.log(`🚀 Server attivo su http://localhost:${PORT}`);
});

// Avvia il nodo GUN P2P
Gun({ web: server });
