// middleware/auth.js
const jwt = require("jsonwebtoken");
const Brand = require("../models/brand");

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const brand = await Brand.findById(decoded.id);
    if (!brand) {
      return res.status(401).json({ message: "Unauthorized: Brand not found" });
    }

    req.brand = brand;
    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = auth;
