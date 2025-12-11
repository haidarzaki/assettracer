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

import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

//POST items
router.get("/", verifyToken, getItems);
router.post("/add", verifyToken, addItems);
router.put("/:id", verifyToken, updateItems);
router.delete("/:id", verifyToken, deleteItems);
router.get("/stock", verifyToken, stockLog);
router.post("/stock-in/:id", verifyToken, stockIn);
router.post("/stock-out/:id", verifyToken, stockOut);
router.get("/borrow", verifyToken, getBorrowLog);
router.post("/:item_id/borrow", verifyToken, borrowItem);
router.post("/:item_id/return", verifyToken, returnItem);

export default router;
