import pool from "../../config/db.js";

export const returnItem = async (req, res) => {
  try {
    const { item_id } = req.params;

    if (isNaN(item_id)) {
      return res.status(400).json({ error: "ID must be a number" });
    }

    // 1. Ambil item
    const itemQuery = await pool.query(`SELECT * FROM "Items" WHERE id = $1`, [
      item_id,
    ]);

    if (itemQuery.rowCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const item = itemQuery.rows[0];

    // Item harus unique
    if (!item.is_unique) {
      return res.status(400).json({
        error: "Non-unique items do not use return. Use stock-in instead.",
      });
    }

    // Item harus sedang borrowed
    if (item.status !== "borrowed") {
      return res.status(400).json({
        error: "This item is not borrowed, so it cannot be returned",
      });
    }

    // 2. Cari record borrow yang belum dikembalikan
    const borrowQuery = await pool.query(
      `
      SELECT * FROM borrow_transactions 
      WHERE item_id = $1 AND return_date IS NULL
      ORDER BY borrow_date DESC
      LIMIT 1
      `,
      [item_id]
    );

    if (borrowQuery.rowCount === 0) {
      return res.status(400).json({
        error: "Borrow record not found or item was already returned",
      });
    }

    const borrowRecord = borrowQuery.rows[0];

    // 3. Update item → available
    const updatedItem = await pool.query(
      `
      UPDATE "Items"
      SET status = 'available',
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [item_id]
    );

    // 4. Update borrow_transactions
    const updatedBorrow = await pool.query(
      `
      UPDATE borrow_transactions
      SET return_date = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [borrowRecord.id]
    );

    res.json({
      message: "Item returned successfully",
      item: updatedItem.rows[0],
      borrow_record: updatedBorrow.rows[0],
    });
  } catch (error) {
    console.error("Return error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
