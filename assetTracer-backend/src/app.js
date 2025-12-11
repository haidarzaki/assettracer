import express from "express";
import dotenv from "dotenv";
import itemRoutes from "./routes/itemRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());

//middlewares
app.use(express.json());

//default route
app.get("/", (req, res) => {
  res.send("Asset Tracer API running...");
});

//route items
app.use("/items", itemRoutes);

//route user
app.use("/auth", userRoutes);

//PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
