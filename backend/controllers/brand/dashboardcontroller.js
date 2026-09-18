// controllers/brand/dashboardcontroller.js
const mongoose = require("mongoose");
const Brand = require("../../models/brand");
const Influencer = require("../../models/influencer");
const Campaign = require("../../models/campaign");

// 📊 Brand Dashboard Controller
const getBrandDashboard = async (req, res) => {
  try {
    const brand = await Brand.findById(req.brand._id);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const bCampaigns = Array.isArray(brand.campaigns) ? brand.campaigns : [];
    const filtered = bCampaigns.filter((c) => c.status !== "Completed" && c.status !== "Cancelled");

    const activeCampaigns = filtered.filter((c) => c.status === "Active").length;
    const totalBudgetSpent = filtered.reduce((sum, c) => sum + (c.budget || 0), 0);

    // Build a clean list that only contains resolvable top-level Campaign IDs
    const recentCampaigns = [];
    for (const c of [...filtered].reverse()) {
      let realId = null;

      if (c.campaignId && mongoose.Types.ObjectId.isValid(c.campaignId)) {
        realId = String(c.campaignId);
      } else {
        try {
          const match = await Campaign.findOne({
            name: c.title || c.name,
            brandName: brand.brandName,
          })
            .sort({ createdAt: -1 })
            .select("_id")
            .lean();
          if (match) realId = String(match._id);
        } catch (_) {}
      }

      if (realId) {
        recentCampaigns.push({
          _id: realId,
          title: c.title || c.name || "Untitled Campaign",
          dateRange: c.dateRange || "",
          status: c.status || "Active",
          budget: c.budget ?? 0,
        });
      }
    }

const dashboardData = {
  brandName: brand.brandName,
  activeCampaigns,
  influencersEngaged: brand.influencersEngaged || 0,
  budgetSpent: totalBudgetSpent,
  recentCampaigns,
  isPro: !!brand.isPro, // ← expose Pro
};

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    res.status(500).json({ message: "Server error while loading dashboard" });
  }
};

// 🔍 Influencer Finder Controller
const getInfluencersList = async (req, res) => {
  try {
    const influencers = await Influencer.find({})
      .select("name platform followers niche location engagementRate avgCostPerPost avatar")
      .lean();

    const formattedInfluencers = influencers.map((inf) => ({
      _id: inf._id,
      name: inf.name,
      platform: inf.platform || "Unknown",
      followers: inf.followers || 0,
      niche: inf.niche || "N/A",
      location: inf.location || "N/A",
      engagementRate: inf.engagementRate || 0,
      avgCostPerPost: inf.avgCostPerPost || 0,
      profilePic: inf.avatar || "/default-avatar.png",
    }));

    res.status(200).json(formattedInfluencers);
  } catch (error) {
    console.error("Influencer list fetch error:", error);
    res.status(500).json({ message: "Server error while fetching influencers" });
  }
};

module.exports = {
  getBrandDashboard,
  getInfluencersList,
};
