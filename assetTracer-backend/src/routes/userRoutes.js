import express from "express";
import { registerAdmin } from "../controllers/auth/registerController.js";
import { loginUser } from "../controllers/auth/loginController.js";

const router = express.Router();

//POST items
router.post("/register", registerAdmin);
router.post("/login", loginUser);

export default router;
