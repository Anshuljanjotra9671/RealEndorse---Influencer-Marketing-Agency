const jwt = require("jsonwebtoken");
const Brand = require("../models/brand");

const protectBrand = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Handle token payload whether it's { id: ... } or { _id: ... }
    const brandId = decoded._id || decoded.id;
    if (!brandId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const brand = await Brand.findById(brandId).select("-password");
    if (!brand) {
      console.error("❌ Brand not found for ID:", brandId);
      return res.status(401).json({ message: "Unauthorized: Brand not found" });
    }

    req.brand = brand; // ✅ Keeping this so dashboard logic still works
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = protectBrand;
