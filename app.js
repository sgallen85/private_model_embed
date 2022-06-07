const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const { client_id, client_secret } = require('./config');
const app = express();
const port = 8000;

app.use(express.static(__dirname + "/src"));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/src/index.html'));
});

app.listen(port, () => {console.log(`Listening on port ${port}...`)});