const express = require('express');
const router = express.Router();
const pool = require('../db');
const authorize = require('../middleware/authorize'); 

router.post('/save', authorize, async (req, res) => {
    try {
        const { total_targets, hits, misses, wrong_presses, accuracy, with_distractions } = req.body;
        const user_id = req.user.user_id; // Luat din token-ul de login

        const newResult = await pool.query(
            "INSERT INTO cpt_results (user_id, total_targets, hits, misses, wrong_presses, accuracy, with_distractions) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [user_id, total_targets, hits, misses, wrong_presses, accuracy, with_distractions || false]
        );

        res.json({ message: "Rezultat CPT salvat cu succes!", data: newResult.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Eroare de server la salvarea testului CPT.");
    }
});

module.exports = router;