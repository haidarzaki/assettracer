import express from "express";
import { getLocations } from "../controllers/user/locationController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

//Ambil lokasi
router.get("/", verifyToken, getLocations);

export default router;
