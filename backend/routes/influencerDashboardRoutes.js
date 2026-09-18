const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Campaign = require("../models/campaign");
const Brand = require("../models/brand");
const verifyInfluencer = require("../middleware/verifyinfluencer");

// Get Dashboard data

router.get("/", verifyInfluencer, async (req, res) => {
  try {
    const influencer = req.influencer;

    const activeByBrand = {};
    const activeByCategory = {};

    influencer.campaigns
      .filter(c => c.status === "Active" || c.status === "Applied") // Include 'Applied' campaigns
      .forEach(c => {
        if (c.brandName) activeByBrand[c.brandName] = (activeByBrand[c.brandName] || 0) + 1;
        if (c.category) activeByCategory[c.category] = (activeByCategory[c.category] || 0) + 1;
      });

    const isPro = influencer.subscription.status === "pro" && (!influencer.subscription.validUntil || influencer.subscription.validUntil > new Date());

    const recLimit = isPro ? 15 : 5;

    const recommendations = await Campaign.find({ status: "Active" }).sort({ deadline: 1 }).limit(recLimit).lean();

    const recommendedWithAppliedFlag = recommendations.map(camp => {
      const isApplied = camp.applicants.some(app => app.influencer && app.influencer.equals(influencer._id));
      return { ...camp, isApplied };
    });

    res.json({
      ...influencer.getDashboardStats(),
      activeByBrand,
      activeByCategory,
      recommendations: recommendedWithAppliedFlag,
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Server error fetching dashboard" });
  }
});

// Apply to a Campaign

router.post("/campaigns/:campaignId/apply", verifyInfluencer, async (req, res) => {
  const influencerId = req.influencer._id;
  const { campaignId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(campaignId)) {
    return res.status(400).json({ error: "Invalid campaign ID" });
  }

  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const alreadyApplied = campaign.applicants.some(app => app.influencer && app.influencer.equals(influencerId));
    if (alreadyApplied) {
      return res.status(400).json({ error: "Already applied" });
    }

    // Add applicant to campaign
    campaign.applicants.push({
      influencer: influencerId,
      status: "Applied",
      appliedAt: new Date(),
    });

    await campaign.save();

    // Increment the applicants count in brand document for specific campaign
    await Brand.updateOne(
      { brandName: campaign.brandName, "campaigns.campaignId": campaign._id },
      { $inc: { "campaigns.$.appliedCount": 1 } }
    );

    // Add campaign to influencer's embedded campaigns with correct status
    req.influencer.campaigns.push({
      campaignId: campaign._id,
      name: campaign.name,
      brandName: campaign.brandName,
      category: campaign.category,
      status: campaign.status,
      earnings: 0,
      impressions: 0,
      appliedAt: new Date(),
    });

    await req.influencer.save();

    res.json({ message: "Application successful" });
  } catch (error) {
    console.error("Apply error:", error);
    res.status(500).json({ error: "Server error on applying to campaign" });
  }
});

module.exports = router;
