import jwt from "jsonwebtoken";

// 1. Cek Login
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

    // Simpan data user (termasuk role-nya) dari token ke request
    req.user = decoded;

    next(); // Lanjut ke controller atau middleware berikutnya
  } catch (error) {
    return res.status(403).json({ error: "Token tidak valid atau expired" });
  }
};

// 2. Cek Khusus Admin
export const isAdmin = (req, res, next) => {
  // Fungsi ini dipanggil SETELAH verifyToken, jadi req.user pasti sudah ada
  if (!req.user || req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ error: "Akses ditolak! Fitur ini hanya untuk Admin." });
  }

  next();
};
