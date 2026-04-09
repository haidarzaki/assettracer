import express from "express";
import {
  addItems,
  getItems,
  updateItems,
  deleteItems,
} from "../controllers/user/itemsController.js";

import { stockIn } from "../controllers/user/stockInControllers.js";
import { stockOut, stockLog } from "../controllers/user/stockOutControllers.js";
import {
  borrowItem,
  getBorrowLog,
} from "../controllers/user/borrowController.js";
import { returnItem } from "../controllers/user/returnControllers.js";

// 1. TAMBAHKAN IMPORT isAdmin DARI MIDDLEWARE
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// USER BIASA & ADMIN BISA AKSES
router.get("/", verifyToken, getItems); // Lihat daftar barang
router.get("/borrow", verifyToken, getBorrowLog); // Lihat histori peminjaman
router.post("/:item_id/borrow", verifyToken, borrowItem); // Pinjam barang
router.post("/:item_id/return", verifyToken, returnItem); // Kembalikan barang

// HANYA ADMIN YANG BISA AKSES
router.post("/add", verifyToken, isAdmin, addItems); // Tambah barang baru
router.put("/:id", verifyToken, isAdmin, updateItems); // Edit data barang
router.delete("/:id", verifyToken, isAdmin, deleteItems); // Hapus barang

router.get("/stock", verifyToken, isAdmin, stockLog); // Lihat laporan stok masuk/keluar
router.post("/stock-in/:id", verifyToken, isAdmin, stockIn); // Tambah stok barang
router.post("/stock-out/:id", verifyToken, isAdmin, stockOut); // Kurangi stok barang (selain dipinjam)

export default router;
