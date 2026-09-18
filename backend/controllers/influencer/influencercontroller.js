const Influencer = require("../../models/influencer");

/**
 * Get current influencer's profile (self-view)
 * GET /api/influencer/profile
 * Private
 */
exports.getInfluencerProfile = async (req, res) => {
  try {
    const influencerId = req.user?.id || req.influencer?._id;
    if (!influencerId) {
      return res.status(401).json({ error: "Unauthorized: No influencer ID" });
    }

    const influencer = await Influencer.findById(influencerId).select(
      "_id name avatar bio platform niche location followers engagementRate avgCostPerPost socials campaigns"
    );

    if (!influencer) {
      return res.status(404).json({ error: "Influencer not found" });
    }

    res.status(200).json(influencer);
  } catch (err) {
    console.error("Error fetching influencer profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get public influencer profile (viewable by brands or public)
 * GET /api/influencer/:id
 * Public
 */
exports.getPublicInfluencerProfile = async (req, res) => {
  try {
    const influencer = await Influencer.findById(req.params.id).select(
      "_id name avatar bio platform niche location followers engagementRate avgCostPerPost socials campaigns"
    );

    if (!influencer) {
      return res.status(404).json({ error: "Influencer not found" });
    }

    res.status(200).json(influencer);
  } catch (err) {
    console.error("Error fetching public influencer profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
