const jwt = require("jsonwebtoken");
const Influencer = require("../models/influencer");

module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    const influencer = await Influencer.findById(decoded.id);

    if (!influencer) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    req.influencer = influencer;

    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
