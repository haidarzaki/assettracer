import pool from "../../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Validasi input
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username dan password wajib diisi" });
    }

    // 2. Cek apakah username sudah ada
    const existingUser = await pool.query(
      'SELECT * FROM "users" WHERE username = $1',
      [username],
    );

    if (existingUser.rowCount > 0) {
      return res.status(409).json({ error: "Username sudah digunakan" });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Insert user baru
    const result = await pool.query(
      'INSERT INTO "users" (username, password) VALUES ($1, $2) RETURNING id, username, role',
      [username, hashedPassword],
    );

    const newUser = result.rows[0];

    // 5. Generate JWT (Tambahkan role ke dalam token)
    const token = jwt.sign(
      {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES },
    );

    // 6. Response ke client
    return res.status(201).json({
      message: "Akun berhasil didaftarkan",
      token,
      user: newUser,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
