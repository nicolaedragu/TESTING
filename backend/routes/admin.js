const express = require('express');
const router = express.Router();
const pool = require('../db');
const authorize = require('../middleware/authorize');

router.get('/stats', authorize, async (req, res) => {
    try {
        if (req.user.user_id !== 1) {
            return res.status(403).json("Acces refuzat. Nu ești administrator.");
        }

        // Pentru fiecare utilizator: pulsul/mișcarea separată de mediul Distras
        // Alături de ultimele date salvate la predicția productivității
        const allData = await pool.query(`
            SELECT 
                u.id as user_id, 
                u.email,
                MAX(CASE WHEN b.is_distracted = false THEN b.avg_pulse END) as pulse_normal,
                MAX(CASE WHEN b.is_distracted = true THEN b.avg_pulse END) as pulse_distracted,
                MAX(CASE WHEN b.is_distracted = false THEN b.avg_movement END) as move_normal,
                MAX(CASE WHEN b.is_distracted = true THEN b.avg_movement END) as move_distracted,
                p.sleep_hours,
                p.phone_usage_hours,
                p.stress_level,
                p.accuracy,
                p.reaction_time,
                p.productivity_score
            FROM users u
            LEFT JOIN biometrics b ON u.id = b.user_id
            LEFT JOIN (
                SELECT DISTINCT ON (user_id) *
                FROM ml_predictions
                ORDER BY user_id, created_at DESC
            ) p ON u.id = p.user_id
            GROUP BY u.id, u.email, p.sleep_hours, p.phone_usage_hours, p.stress_level, p.accuracy, p.reaction_time, p.productivity_score
            ORDER BY u.id DESC
        `);

        res.json(allData.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Eroare server la preluarea statisticilor.");
    }
});

module.exports = router;