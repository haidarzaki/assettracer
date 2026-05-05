import pool from "../../config/db.js";

export const getLocations = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM locations ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("get location error: ", error);
    res.status(500).json({ message: error.message });
  }
};
