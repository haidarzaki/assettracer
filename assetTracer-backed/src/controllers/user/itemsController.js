import pool from "../../config/db.js";

/**
 * ============================
 * CREATE ITEM
 * ============================
 */
export const addItems = async (req, res) => {
  try {
    const { name, description, is_unique, serial_code, quantity } = req.body;

    // 1. VALIDASI NAME
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // 2. VALIDASI is_unique
    if (typeof is_unique !== "boolean") {
      return res
        .status(400)
        .json({ message: "is_unique must be true or false" });
    }

    // 3. VALIDASI BARANG UNIK
    if (is_unique === true) {
      if (!serial_code) {
        return res
          .status(400)
          .json({ message: "serial_code is required for unique item" });
      }
      if (quantity) {
        return res
          .status(400)
          .json({ message: "Quantity is not allowed for unique item" });
      }
    }

    // 4. VALIDASI BARANG STOK
    if (is_unique === false) {
      if (!quantity || quantity < 1) {
        return res
          .status(400)
          .json({ message: "Quantity is required and must be >= 1" });
      }
      if (serial_code) {
        return res.status(400).json({
          message: "serial_code must be NULL for non-unique item",
        });
      }
    }

    // 5. CEK DUPLICATE
    const check = await pool.query(`SELECT id FROM "Items" WHERE name = $1`, [
      name,
    ]);

    if (check.rowCount > 0) {
      return res.status(400).json({ message: "Item already exists" });
    }

    // 6. INSERT DATA
    const newItem = await pool.query(
      `INSERT INTO "Items" 
        (name, description, is_unique, serial_code, quantity, status) 
       VALUES 
        ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        name,
        description || null,
        is_unique,
        is_unique ? serial_code : null,
        is_unique ? 1 : quantity,
        is_unique ? "available" : null,
      ]
    );

    return res
      .status(201)
      .json({ message: "Item Created Successfully", data: newItem.rows[0] });
  } catch (err) {
    console.error("Add Item Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * ============================
 * UPDATE ITEM
 * ============================
 */
export const updateItems = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // 1. cek valid ID
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID must be a number" });
    }

    // 2. Ambil data lama item
    const oldData = await pool.query(`SELECT * FROM "Items" WHERE id = $1`, [
      id,
    ]);

    if (oldData.rowCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const current = oldData.rows[0];

    // 3. Tentukan nilai baru (kalau undefined -> pakai nilai lama)
    const updatedName = name ?? current.name;
    const updatedDescription = description ?? current.description;

    // 4. UPDATE dengan nilai baru
    const result = await pool.query(
      `UPDATE "Items"
       SET name = $1,
           description = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [updatedName, updatedDescription, id]
    );

    return res.json({
      message: "Item updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update item error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * ============================
 * GET ITEMS
 * ============================
 */
export const getItems = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM "Items" ORDER BY id ASC`);
    res.json(result.rows);
  } catch (error) {
    console.error("Get Items Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * ============================
 * DELETE ITEM
 * ============================
 */
export const deleteItems = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM "Items" WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    return res.json({ message: "Item deleted", data: result.rows[0] });
  } catch (error) {
    console.error("Delete Item Error:", error);
    res.status(500).json({ message: error.message });
  }
};
