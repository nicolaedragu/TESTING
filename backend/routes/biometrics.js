const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const stream = require('stream');
const pool = require('../db');
const authorize = require('../middleware/authorize');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', authorize, upload.single('csvfile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Nu a fost încărcat niciun fișier!" });
    }

    let totalPulse = 0;
    let totalMovement = 0;
    let validRows = 0;

    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    bufferStream
        .pipe(csv())
        .on('data', (data) => {
            const keys = Object.keys(data);
            
            const pulseKey = keys.find(k => k.toLowerCase().includes('puls'));
            const moveKey = keys.find(k => k.toLowerCase().includes('mişcare') || k.toLowerCase().includes('miscare'));

            const pulse = pulseKey ? parseFloat(data[pulseKey]) : 0;
            const movement = moveKey ? parseFloat(data[moveKey]) : 0;

            // Ignorăm artefactele
            if (pulse > 0 && !isNaN(pulse)) { 
                totalPulse += pulse;
                totalMovement += (isNaN(movement) ? 0 : movement);
                validRows++;
            }
        })
        .on('end', async () => {
            if (validRows === 0) {
                return res.status(400).json({ message: "Nu am găsit date valide pentru puls în CSV. Verifică formatul." });
            }

            // Calculăm mediile pe întreaga sesiune de test
            const avgPulse = (totalPulse / validRows).toFixed(2);
            const avgMovement = (totalMovement / validRows).toFixed(2);
            
            const isDistracted = req.body.is_distracted === 'true';
            
            try {
                // Salvăm în baza de date
                const newBiometric = await pool.query(
                    "INSERT INTO biometrics (user_id, avg_pulse, avg_movement, is_distracted) VALUES ($1, $2, $3, $4) RETURNING *",
                    [req.user.user_id, avgPulse, avgMovement, isDistracted]
                );

                res.json({
                    message: "Date procesate cu succes!",
                    avg_pulse: avgPulse,
                    avg_movement: avgMovement,
                    is_distracted: isDistracted,
                    data: newBiometric.rows[0]
                });
            } catch (error) {
                console.error(error.message);
                res.status(500).send("Eroare la salvarea datelor biometrice în baza de date.");
            }
        });
});

module.exports = router;

// Ruta pentru a aduce datele biometrice în pagina de Profil
router.get('/user', authorize, async (req, res) => {
    try {
        const biometrics = await pool.query(
            `SELECT DISTINCT ON (is_distracted) * 
             FROM biometrics 
             WHERE user_id = $1 
             ORDER BY is_distracted, created_at DESC`,
            [req.user.user_id]
        );

        res.json(biometrics.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Eroare la aducerea datelor biometrice pentru profil.");
    }
});