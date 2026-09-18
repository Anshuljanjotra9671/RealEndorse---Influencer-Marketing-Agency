// middleware/verifyBrand.js

const jwt = require("jsonwebtoken");

const verifyBrand = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded._id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.userId = decoded._id;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyBrand;
