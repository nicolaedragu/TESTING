const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 1. RUTA DE ÎNREGISTRARE (REGISTER)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Verificăm dacă utilizatorul există deja
        const userExist = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExist.rows.length > 0) {
            return res.status(401).json("Un utilizator cu acest email există deja!");
        }

        // Criptăm parola
        const salt = await bcrypt.genSalt(10);
        const bcryptPassword = await bcrypt.hash(password, salt);

        // Inserăm noul utilizator în baza de date
        const newUser = await pool.query(
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, email, bcryptPassword, role || 'user']
        );

        // Generăm token-ul JWT
        const token = jwt.sign({ user_id: newUser.rows[0].id, role: newUser.rows[0].role }, process.env.JWT_SECRET, { expiresIn: "10h" });
        
        res.json({ token, role: newUser.rows[0].role });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Eroare de server la înregistrare.");
    }
});

// 2. RUTA DE LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Căutăm utilizatorul
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) {
            return res.status(401).json("Email sau parolă incorectă!");
        }

        // Verificăm parola
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(401).json("Email sau parolă incorectă!");
        }

        // Generăm token-ul
        const token = jwt.sign({ user_id: user.rows[0].id, role: user.rows[0].role }, process.env.JWT_SECRET, { expiresIn: "10h" });
        
        res.json({ token, role: user.rows[0].role, name: user.rows[0].name });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Eroare de server la login.");
    }
});

module.exports = router;