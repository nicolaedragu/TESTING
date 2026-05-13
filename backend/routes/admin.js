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
                
                -- Luăm profilul din ultima predicție
                MAX(p.sleep_hours) as sleep_hours,
                MAX(p.phone_usage_hours) as phone_usage_hours,
                MAX(p.stress_level) as stress_level,
                MAX(p.sas_score) as sas_score,
                
                -- Separam rezultatele Testelor & ML
                MAX(CASE WHEN p.is_distracted = false THEN p.accuracy END) as acc_normal,
                MAX(CASE WHEN p.is_distracted = true THEN p.accuracy END) as acc_distracted,
                MAX(CASE WHEN p.is_distracted = false THEN p.reaction_time END) as rt_normal,
                MAX(CASE WHEN p.is_distracted = true THEN p.reaction_time END) as rt_distracted,
                MAX(CASE WHEN p.is_distracted = false THEN p.productivity_score END) as prod_normal,
                MAX(CASE WHEN p.is_distracted = true THEN p.productivity_score END) as prod_distracted

            FROM users u
            LEFT JOIN biometrics b ON u.id = b.user_id
            LEFT JOIN ml_predictions p ON u.id = p.user_id
            GROUP BY u.id, u.email
            ORDER BY u.id ASC
        `);

        res.json(allData.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Eroare server la preluarea statisticilor.");
    }
});

module.exports = router;