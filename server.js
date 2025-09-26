const express = require('express');
const path = require('path');
const Gun = require('gun');

const app = express();
const PORT = process.env.PORT || 8765;

app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(PORT, () => {
  console.log(`🚀 Server attivo su http://localhost:${PORT}`);
});

Gun({ web: server });
