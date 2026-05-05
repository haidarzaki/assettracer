import express from "express";
import {
  addLocation,
  getLocations,
} from "../controllers/user/locationController.js";
import { isAdmin, verifyToken } from "../middlewares/authMiddleware.js";
import { updateItems } from "../controllers/user/itemsController.js";

const router = express.Router();

//Ambil lokasi
router.get("/", verifyToken, getLocations);

router.post("/add", verifyToken, isAdmin, addLocation);
router.put("/:id", verifyToken, isAdmin, updateItems);

export default router;
