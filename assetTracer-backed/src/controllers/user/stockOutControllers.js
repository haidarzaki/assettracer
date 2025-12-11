import pool from "../../config/db.js";

export const stockOut = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, note } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Amount must be greater than 0" });
    }

    const itemQuery = await pool.query(`SELECT * FROM "Items" WHERE id = $1`, [
      id,
    ]);

    if (itemQuery.rowCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const item = itemQuery.rows[0];

    // Unique items cannot stock out — must use borrow
    if (item.is_unique) {
      return res.status(400).json({
        error: "Unique items cannot be stock-out, use borrow instead",
      });
    }

    // Cannot take more than available
    if (item.quantity < amount) {
      return res.status(400).json({
        error: "Not enough stock available",
      });
    }

    const newQuantity = item.quantity - amount;

    // Update stock
    const updated = await pool.query(
      `
      UPDATE "Items"
      SET quantity = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
      `,
      [newQuantity, id]
    );

    // Insert into stock_transactions
    await pool.query(
      `
        INSERT INTO stock_transactions (item_id, type, quantity, note)
        VALUES ($1, $2, $3, $4)
      `,
      [id, "out", amount, note || "Stock reduced"]
    );

    res.json({
      message: "Stock decreased successfully",
      data: updated.rows[0],
    });
  } catch (err) {
    console.error("Stock Out error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const stockLog = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM "stock_transactions" ORDER BY id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get Stock Log Error:", error);
    res.status(500).json({ message: error.message });
  }
};
