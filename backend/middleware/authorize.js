const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async (req, res, next) => {
  try {
    const jwtToken = req.header("token");
    if (!jwtToken) return res.status(403).json("Nu ești autorizat!");

    const payload = jwt.verify(jwtToken, process.env.JWT_SECRET);
    req.user = payload; // Aici punem user_id și role în cererea curentă
    next();
  } catch (err) {
    console.error(err.message);
    return res.status(403).json("Token invalid!");
  }
};