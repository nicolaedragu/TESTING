const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const authorize = require('../middleware/authorize');
const pool = require('../db');

router.post('/productivity', authorize, (req, res) => {
    const { sleep_hours, phone_usage_hours, stress_level, accuracy, reaction_time } = req.body;

    // Presupunem 1000ms = 100 puncte. Scădem 1 punct la fiecare 10ms în plus.
    let speed_score = 100 - ((reaction_time - 1000) / 10);

    // 1. Normalizarea Vitezei
    if (speed_score > 100) speed_score = 100;
    if (speed_score < 0) speed_score = 0;

    // 2. Aplicarea Formulei de Concentrare
    const focus_score = (accuracy * 0.6) + (speed_score * 0.4);

    // 3. Apelăm scriptul pentru predicția Machine Learning
    const scriptPath = path.join(__dirname, '../predict.py');
    const pythonCommand = `python "${scriptPath}" ${sleep_hours} ${phone_usage_hours} ${stress_level} ${focus_score.toFixed(2)}`;

    exec(pythonCommand, async (error, stdout, stderr) => {
        if (error) {
            console.error(`Eroare ML: ${error.message}`);
            return res.status(500).json({ message: "Eroare la procesarea modelului." });
        }

        try {
            const result = JSON.parse(stdout);
            
            if (result.status === "error") {
                return res.status(500).json({ message: result.message });
            }
            
            // Salvăm în baza de date rezultatele 
            try {
                await pool.query(
                    `INSERT INTO ml_predictions 
                    (user_id, sleep_hours, phone_usage_hours, stress_level, accuracy, reaction_time, productivity_score) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [req.user.user_id, sleep_hours, phone_usage_hours, stress_level, accuracy, reaction_time, result.productivity_score]
                );
            } catch (dbErr) {
                console.error("Eroare la salvarea predicției în DB:", dbErr.message);
            }
            
            res.json({
                accuracy: accuracy.toFixed(2),
                focus_score: focus_score.toFixed(2),
                speed_score: speed_score.toFixed(0),
                prediction: result.productivity_score
            });
        } catch (parseError) {
            console.error("Eroare JSON din Python:", stdout);
            res.status(500).json({ message: "Eroare format ML." });
        }
    });
});

module.exports = router;