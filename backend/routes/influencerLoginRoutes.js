const express = require("express");
const router = express.Router();
const Influencer = require("../models/influencer");

// ✅ Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { influencer, token } = await Influencer.signup(req.body);

    res.status(201).json({
      message: "Signup successful",
      token,
      influencer: {
        id: influencer._id,
        name: influencer.name,
        email: influencer.email,
        category: influencer.category,
      },
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// ✅ Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { influencer, token } = await Influencer.login(email, password);

    res.status(200).json({
      message: "Login successful",
      token,
      influencer: {
        id: influencer._id,
        name: influencer.name,
        email: influencer.email,
        category: influencer.category,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(401).json({ error: err.message });
  }
});

module.exports = router;
