// routes/influencer.js
const express = require("express");
const router = express.Router();

const Influencer = require("../models/influencer");
const verifyInfluencer = require("../middleware/verifyinfluencer");
const Campaign = require("../models/campaign");

const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// Cloudinary config from ENV (must be set in your process environment)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,   // required
  api_key: process.env.CLOUDINARY_API_KEY,         // required
  api_secret: process.env.CLOUDINARY_API_SECRET,   // required
});

// Multer memory storage (we upload buffer → Cloudinary)
const upload = multer({ storage: multer.memoryStorage() });

/* ==== PROFILE (PRIMARY) ==== */
//Login route//
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

// GET profile (used by UI)
router.get("/profile", verifyInfluencer, async (req, res) => {
  try {
    const infl = await Influencer.findById(req.influencer._id)
      .select("name email avatar bio category platform")
      .lean();
    if (!infl) return res.status(404).json({ message: "Profile not found" });
    res.json(infl);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Server error while fetching profile" });
  }
});

// PUT profile (used by UI)
router.put("/profile", verifyInfluencer, async (req, res) => {
  try {
    const { name, bio, category, platform, avatar } = req.body;
    await Influencer.findByIdAndUpdate(
      req.influencer._id,
      {
        $set: {
          ...(name !== undefined ? { name } : {}),
          ...(bio !== undefined ? { bio } : {}),
          ...(category !== undefined ? { category } : {}),
          ...(platform !== undefined ? { platform } : {}),
          ...(avatar ? { avatar } : {}),
        },
      },
      { new: true }
    );
    res.json({ message: "Profile updated" });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server error while updating profile" });
  }
});

// POST avatar upload (multipart -> Cloudinary)
router.post("/profile/avatar", verifyInfluencer, (req, res, next) => {
  // Wrap Multer to handle errors cleanly
  const runUpload = upload.single("avatar");
  runUpload(req, res, async (err) => {
    if (err) {
      // Multer-specific errors like file too large, wrong field, etc. [7]
      console.error("Multer error:", err);
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    try {
      if (!req.file) {
        console.error("No file received. Did the client use field name 'avatar'?");
        return res.status(400).json({ message: "No file received" });
      }

      // Debug info
      console.log("Cloudinary env:", {
        cloud: process.env.CLOUDINARY_CLOUD_NAME,
        hasKey: !!process.env.CLOUDINARY_API_KEY,
        hasSecret: !!process.env.CLOUDINARY_API_SECRET,
      });
      console.log("Incoming file:", { mimetype: req.file.mimetype, size: req.file.size });

      // Convert buffer -> data URI (reliable with memoryStorage) [11]
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const uploadRes = await cloudinary.uploader.upload(dataURI, {
        folder: "real_endorse/avatars",
        resource_type: "image",
        transformation: [{ width: 512, height: 512, crop: "fill", gravity: "auto", quality: "auto" }],
        overwrite: false,
      });

      await Influencer.findByIdAndUpdate(req.influencer._id, {
        $set: { avatar: uploadRes.secure_url },
      });

      return res.json({ secureUrl: uploadRes.secure_url, publicId: uploadRes.public_id });
    } catch (e) {
      // This will display Cloudinary’s exact error in your logs (e.g., missing file, invalid URL, invalid creds) [1][3][6]
      console.error("Avatar upload error:", e);
      return res.status(500).json({ message: "Failed to upload avatar" });
    }
  });
});


/* ==== DASHBOARD: ACTIVE CAMPAIGNS, STATS, RECOMMEND ==== */
router.get("/dashboard", verifyInfluencer, async (req, res) => {
  try {
    const now = new Date();

    // Fetch ALL active campaigns (brand-created) not completed and unexpired
    const activeCampaigns = await Campaign.find({
      status: "Active",
      $or: [{ deadline: null }, { deadline: { $gte: now } }],
    })
      .select("name brandName category deadline status budget")
      .lean();

    // Count per brand/category
    const activeByBrand = {};
    const activeByCategory = {};
    activeCampaigns.forEach((c) => {
      if (c.brandName) activeByBrand[c.brandName] = (activeByBrand[c.brandName] || 0) + 1;
      if (c.category) activeByCategory[c.category] = (activeByCategory[c.category] || 0) + 1;
    });

    // Show only the first 6 as recommendations (customize as needed)
    const recommendations = activeCampaigns.slice(0, 6);

    // Influencer own stats (guard for undefined arrays)
    const inflCampaigns = Array.isArray(req.influencer.campaigns) ? req.influencer.campaigns : [];
    const recentCampaigns = inflCampaigns.slice(-5).reverse();

    const totalImpressions = inflCampaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
    const totalRevenue = inflCampaigns.reduce((sum, c) => sum + (c.earnings || 0), 0);

    const engagementRate = req.influencer.followers
      ? ((totalImpressions / req.influencer.followers) * 100).toFixed(2)
      : "0.00";

    res.json({
      name: req.influencer.name,
      realScore: req.influencer.realScore,
      subscription: req.influencer.subscription?.status || "free",
      totalFollowers: req.influencer.followers,
      engagementRate: `${engagementRate}%`,
      campaignRevenue: `$${Number(totalRevenue || 0).toLocaleString()}`,
      pendingMessages: req.influencer.pendingMessages || 0,
      recentCampaigns,
      activeByBrand,
      activeByCategory,
      recommendations,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Failed to fetch stats." });
  }
});

/* ==== ANALYTICS ==== */
router.get("/dashboard/analytics", verifyInfluencer, async (req, res) => {
  try {
    const monthlyData = {};
    const inflCampaigns = Array.isArray(req.influencer.campaigns) ? req.influencer.campaigns : [];
    inflCampaigns.forEach((campaign) => {
      const createdAt = campaign.appliedAt || campaign.createdAt || req.influencer.createdAt || new Date();
      const month = new Date(createdAt).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      if (!monthlyData[month]) monthlyData[month] = { earnings: 0, impressions: 0 };
      monthlyData[month].earnings += campaign.earnings || 0;
      monthlyData[month].impressions += campaign.impressions || 0;
    });

    const analytics = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      earnings: parseFloat((data.earnings || 0).toFixed(2)),
      impressions: data.impressions || 0,
    }));

    res.json({ analytics });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "Failed to fetch analytics data." });
  }
});

/* ==== SUBSCRIPTION ==== */
router.post("/subscribe", verifyInfluencer, async (req, res) => {
  try {
    req.influencer.subscription = req.influencer.subscription || {};
    req.influencer.subscription.status = "pro";
    req.influencer.subscription.lastPaid = new Date();
    req.influencer.subscription.validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await req.influencer.save();
    res.json({ message: "Upgraded to Pro!", status: "pro" });
  } catch (e) {
    console.error("Subscribe error:", e);
    res.status(500).json({ error: "Upgrade failed" });
  }
});

/* ==== REAL SCORE API ==== */
router.get("/real-score", verifyInfluencer, async (req, res) => {
  res.json({ realScore: req.influencer.realScore || 50 });
});

/* ==== SPONSORSHIP MANUAL APPLY ==== */
router.post("/sponsorship/request", verifyInfluencer, async (req, res) => {
  try {
    const { brand, details } = req.body;
    if (!brand || !details) return res.status(400).json({ error: "All fields are required." });

    req.influencer.sponsorships = req.influencer.sponsorships || [];
    req.influencer.sponsorships.push({
      brand,
      status: "Pending",
      details,
    });
    await req.influencer.save();

    res.json({ message: "Sponsorship request submitted." });
  } catch (err) {
    console.error("Sponsorship request error:", err);
    res.status(500).json({ error: "Failed to request sponsorship." });
  }
});

/* ==== LIST FOR BRAND FINDER ==== */
router.get("/", async (req, res) => {
  try {
    const influencers = await Influencer.find({})
      .select("name platform followers category location engagementRate avgCostPerPost avatar realScore")
      .lean();

    res.status(200).json(
      (influencers || []).map((inf) => ({
        ...inf,
        profilePic: inf.avatar || "/default-avatar.png",
      }))
    );
  } catch (err) {
    console.error("List influencers error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ==== PUBLIC PROFILE ==== */
router.get("/:id", async (req, res) => {
  try {
    const influencer = await Influencer.findById(req.params.id);
    if (!influencer) return res.status(404).json({ error: "Influencer not found" });
    res.json(influencer);
  } catch (err) {
    console.error("Public profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
