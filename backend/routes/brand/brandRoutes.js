// routes/brand/brandRoutes.js
const express = require("express");
const router = express.Router();
const Brand = require("../../models/brand");
const jwt = require("jsonwebtoken");

// SIGNUP
router.post("/", async (req, res) => {
  const { brandName, email, password, category, website } = req.body;

  try {
    if (!brandName || !email || !password || !category) {
      return res.status(400).json({ error: "All required fields must be provided." });
    }

    const existing = await Brand.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const brand = new Brand({ brandName, email, password, category, website });
    await brand.save();

    const token = jwt.sign(
      { id: brand._id, email: brand.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(201).json({
      message: "Signup successful",
      token,
      brand: {
        id: brand._id,
        brandName: brand.brandName,
        email: brand.email,
        category: brand.category,
        website: brand.website,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const brand = await Brand.findOne({ email }).select("+password");
    if (!brand) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await brand.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: brand._id, email: brand.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      brand: {
        id: brand._id,
        brandName: brand.brandName,
        email: brand.email,
        category: brand.category,
        website: brand.website,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
