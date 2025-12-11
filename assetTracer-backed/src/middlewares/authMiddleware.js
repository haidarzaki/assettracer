import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Token tidak ditemukan" });
    }

    const token = authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: "Format token salah" });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // simpan data user dari token ke request
    req.user = decoded;

    next(); // lanjut ke controller
  } catch (error) {
    return res.status(403).json({ error: "Token tidak valid atau expired" });
  }
};
