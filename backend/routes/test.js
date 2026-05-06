const express = require('express');
const router = express.Router();
const pool = require('../db');
const authorize = require('../middleware/authorize');

router.post('/save', authorize, async (req, res) => {
    try {
        const { correct_answers, total_questions, avg_reaction_time, results_json, with_distractions } = req.body;
        const user_id = req.user.user_id; // Luat din token-ul de login

        const newResult = await pool.query(
            "INSERT INTO test_results (user_id, correct_answers, total_questions, avg_reaction_time, results_json, with_distractions) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [user_id, correct_answers, total_questions, avg_reaction_time, JSON.stringify(results_json), with_distractions || false]
        );

        res.json({ message: "Rezultat salvat cu succes!", data: newResult.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Eroare de server la salvarea testului.");
    }
});

module.exports = router;