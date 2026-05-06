const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Conectare DB
pool.query('SELECT NOW()', (err, res) => {
    if (err) console.error('Eroare DB:', err.message);
    else console.log('Conectat la PostgreSQL! Ora:', res.rows[0].now);
});

// RUTELE NOI 
app.use('/auth', require('./routes/auth'));
app.use('/test', require('./routes/test'));
app.use('/cpt', require('./routes/cpt'));
app.use('/biometrics', require('./routes/biometrics'));
app.use('/predict', require('./routes/predict'));
app.use('/admin', require('./routes/admin'));

// ------------------

app.get('/', (req, res) => {
    res.send('Serverul Node.js rulează perfect!');
});

app.listen(PORT, () => {
    console.log(`Serverul a pornit pe portul ${PORT}`);
});