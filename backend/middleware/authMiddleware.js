// middleware/auth.js
const jwt = require("jsonwebtoken");
const Brand = require("../models/brand");
const Influencer = require("../models/influencer");

function getBearerToken(req) {
  const auth = req.headers.authorization || "";
  return auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
}

// Brand-only
async function protectBrand(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ message: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded._id || decoded.id;
    const brand = await Brand.findById(id).select("-password");
    if (!brand) return res.status(401).json({ message: "Unauthorized: Brand not found" });
    req.user = { _id: brand._id, role: "Brand" };
    req.brand = brand;
    next();
  } catch (e) {
    console.error("protectBrand:", e.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Influencer-only
async function verifyInfluencer(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ error: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded._id || decoded.id;
    const influencer = await Influencer.findById(id).select("-password");
    if (!influencer) return res.status(401).json({ error: "Unauthorized: User not found" });
    req.user = { _id: influencer._id, role: "Influencer" };
    req.influencer = influencer;
    next();
  } catch (e) {
    console.error("verifyInfluencer:", e.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Either brand or influencer (for shared chat routes)
async function protectAny(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ message: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded._id || decoded.id;

    const brand = await Brand.findById(id).select("name avatar");
    if (brand) {
      req.actorType = "Brand";
      req.actorId = brand._id;
      req.user = { _id: brand._id, role: "Brand" };
      req.brand = brand;
      return next();
    }

    const influencer = await Influencer.findById(id).select("name avatar");
    if (influencer) {
      req.actorType = "Influencer";
      req.actorId = influencer._id;
      req.user = { _id: influencer._id, role: "Influencer" };
      req.influencer = influencer;
      return next();
    }

    return res.status(401).json({ message: "Unauthorized user" });
  } catch (e) {
    console.error("protectAny:", e.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = { protectBrand, verifyInfluencer, protectAny };
