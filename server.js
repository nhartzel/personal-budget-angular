// Budget API

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());

const data = require("./data.json");


app.use('/', express.static('public'))

//app.get('/budget', (req, res) => {
//    res.json(budget);
//});

app.get("/budget", (req, res) => {
    res.json(data);
});

app.listen(port, () => {
    console.log(`API served at http://localhost:${port}`);
});