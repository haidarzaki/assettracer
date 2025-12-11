import pool from "../../config/db.js";

export const borrowItem = async (req, res) => {
  const client = await pool.connect();

  try {
    const { item_id } = req.params;
    const { borrower_name, note } = req.body;

    if (isNaN(item_id)) {
      return res.status(400).json({ error: "ID must be a number" });
    }

    if (!borrower_name) {
      return res.status(400).json({ error: "Borrower name is required" });
    }

    // 1. cek item exist
    const borrowQuery = await client.query(
      `SELECT * FROM "Items" WHERE id = $1`,
      [item_id]
    );

    if (borrowQuery.rowCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const item = borrowQuery.rows[0];

    // 2. cek aturan
    if (!item.is_unique) {
      return res
        .status(400)
        .json({ error: "Non-unique item cannot be borrowed" });
    }

    if (item.status !== "available") {
      return res.status(400).json({ error: "This item is already borrowed" });
    }

    // 🔥 BEGIN TRANSACTION
    await client.query("BEGIN");

    // 3. insert borrow transaction
    const borrowInsert = await client.query(
      `INSERT INTO borrow_transactions 
        (item_id, borrower_name, borrow_date, return_date, note)
       VALUES ($1, $2, NOW(), NULL, $3)
       RETURNING *`,
      [item_id, borrower_name, note || null]
    );

    // 4. update item status → borrowed
    const updatedItem = await client.query(
      `UPDATE "Items" 
       SET status = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      ["borrowed", item_id]
    );

    // 🔥 COMMIT TRANSACTION
    await client.query("COMMIT");

    return res.status(200).json({
      message: "Item borrowed successfully",
      borrow_record: borrowInsert.rows[0],
      updated_item: updatedItem.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Borrow error:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};

export const getBorrowLog = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM "borrow_transactions" ORDER BY id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get Borrow Log Error:", error);
    res.status(500).json({ message: error.message });
  }
};
