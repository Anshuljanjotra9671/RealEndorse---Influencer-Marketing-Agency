// routes/brand/dashboard.js
const express = require("express");
const router = express.Router();
const {
  getBrandDashboard,
  getInfluencersList,
} = require("../../controllers/brand/dashboardcontroller");
const protectBrand = require("../../middleware/auth");

// Dashboard stats
router.get("/", protectBrand, getBrandDashboard);

// Influencer finder list
router.get("/influencers", protectBrand, getInfluencersList);

module.exports = router;
