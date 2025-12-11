import pool from "../../config/db.js";

export const stockIn = async (req, res) => {
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

    if (item.is_unique) {
      return res
        .status(400)
        .json({ error: "Unique items cannot receive additional stock" });
    }

    const newQuantity = Number(item.quantity) + Number(amount);

    // Begin stock update
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
      [id, "in", amount, note || "Stock added"]
    );

    res.json({
      message: "Stock added successfully",
      data: updated.rows[0],
    });
  } catch (err) {
    console.error("Stock In error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
