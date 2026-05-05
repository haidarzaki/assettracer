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

export const addLocation = async (req, res) => {
  try {
    const { name, address } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Nama lokasi wajib diisi" });
    }

    const newLocation = await pool.query(
      `INSERT INTO locations (name, address) VALUES ($1, $2) RETURNING *`,
      [name, address || null],
    );

    res.status(201).json({
      message: "Lokasi berhasil ditambahkan",
      data: newLocation.rows[0],
    });
  } catch (error) {
    console.error("Add Location Error", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Nama lokasi wajib diisi" });
    }

    const updatedLocation = await pool.query(
      `UPDATE locations SET name = $1, address = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [name, address || null, id],
    );

    if (updateLocation.rowCount === 0) {
      return res.status(404).json({ message: "lokasi tidak ditemukan" });
    }

    res.json({
      message: "Lokasi berhasil di update",
      data: updatedLocation.rows[0],
    });
  } catch (error) {
    console.error("Update Location Error", error);
    res.status(500).json({ message: error.message });
  }
};
