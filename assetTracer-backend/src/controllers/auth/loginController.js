import pool from "../../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await pool.query(
      `SELECT * FROM "users" WHERE username = $1`,
      [username],
    );
    if (existingUser.rowCount === 0) {
      return res.status(404).json({ error: "username not found" });
    }

    const user = existingUser.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Wrong password dumbass!" });
    }

    // 1. TAMBAHKAN ROLE DI DALAM TOKEN
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES },
    );

    // 2. TAMBAHKAN ROLE DI JSON RESPONSE UNTUK FRONTEND
    return res.json({
      message: "Login success",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error", error);
    res.status(500).json({ error: "internal server error" });
  }
};
