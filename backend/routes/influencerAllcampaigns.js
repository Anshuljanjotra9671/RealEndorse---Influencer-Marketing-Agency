// routes/influencerAllCampaigns.js
const express = require("express");
const router = express.Router();
const Campaign = require("../models/campaign");
const verifyInfluencer = require("../middleware/verifyinfluencer");

// Optional: quick health check to verify route + middleware in seconds
router.get("/health", verifyInfluencer, (req, res) => {
  return res.json({
    ok: true,
    influencerId: String(req.influencer?._id || ""),
    route: "/api/influencer/campaigns",
  });
});

// GET /api/influencer/campaigns
// Query: q, category, brand, sort (deadlineAsc|budgetDesc|newest), page, pageSize
router.get("/", verifyInfluencer, async (req, res) => {
  const step = { at: "start" };
  try {
    const influencer = req.influencer;
    const {
      q = "",
      category = "",
      brand = "",
      sort = "deadlineAsc",
      page = "1",
      pageSize = "12",
    } = req.query;

    step.at = "parse_query";
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(pageSize, 10) || 12, 1), 100);
    const skip = (pageNum - 1) * limit;

    // Build filter
    const filter = { status: "Active" };
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { brandName: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ];
    }
    if (category) filter.category = category;
    if (brand) filter.brandName = brand;

    // Sort
    let sortSpec = {};
    if (sort === "deadlineAsc") sortSpec = { deadline: 1, createdAt: -1 };
    else if (sort === "budgetDesc") sortSpec = { budget: -1, deadline: 1 };
    else if (sort === "newest") sortSpec = { createdAt: -1 };

    step.at = "db_queries";
    const [itemsRaw, totalItems] = await Promise.all([
      Campaign.find(filter).sort(sortSpec).skip(skip).limit(limit).lean(),
      Campaign.countDocuments(filter),
    ]);

    step.at = "aggregations";
    const [brandsAgg, categoriesAgg] = await Promise.all([
      Campaign.aggregate([
        { $match: { status: "Active" } },
        { $group: { _id: "$brandName" } },
        { $sort: { _id: 1 } },
      ]),
      Campaign.aggregate([
        { $match: { status: "Active" } },
        { $group: { _id: "$category" } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    step.at = "map_items";
    const inflIdStr = String(influencer._id);
    const items = (itemsRaw || []).map((camp) => {
      const apps = Array.isArray(camp.applicants) ? camp.applicants : [];
      const isApplied = apps.some(
        (app) => app && app.influencer && String(app.influencer) === inflIdStr
      );
      return {
        _id: String(camp._id),
        name: camp.name || "",
        brandName: camp.brandName || "",
        category: camp.category || "",
        deadline: camp.deadline || null,
        budget: typeof camp.budget === "number" ? camp.budget : 0,
        status: camp.status || "Active",
        isApplied,
      };
    });

    step.at = "respond";
    return res.json({
      items,
      page: pageNum,
      pageSize: limit,
      totalItems,
      totalPages: Math.max(Math.ceil(totalItems / limit), 1),
      availableBrands: (brandsAgg || []).map((b) => b._id).filter(Boolean),
      availableCategories: (categoriesAgg || []).map((c) => c._id).filter(Boolean),
    });
  } catch (err) {
    console.error("InfluencerAllCampaigns error at step:", step, err);
    return res.status(500).json({
      error: "Failed to list campaigns",
      step: step.at,
      detail: err?.message || "",
    });
  }
});

// ... keep /all, /applied, /:id/detail, brand-public routes unchanged ...

// POST /api/influencer/campaigns/:id/chat/init
router.post("/:id/chat/init", verifyInfluencer, async (req, res) => {
  try {
    const influencerId = req.influencer._id;
    const { id } = req.params;

    const c = await Campaign.findById(id).lean();
    if (!c) return res.status(404).json({ error: "Campaign not found" });

    const app = Array.isArray(c.applicants)
      ? c.applicants.find(
          (a) => a.influencer && a.influencer.toString() === influencerId.toString()
        )
      : null;

    if (!app || app.status !== "Selected") {
      return res.status(403).json({ error: "Chat available only after selection" });
    }

    // Determine brand owner identity (adjust to your schema)
    const brandId = c.brandId || null; // if Campaign stores brandId
    // If your Brand model relates to a user via brand.user, resolve that to attach to conversation as participant.

    // Find or create conversation
    let convo = await Conversation.findOne({
      campaign: c._id,
      influencer: influencerId,
      brand: brandId,
    });

    if (!convo) {
      convo = await Conversation.create({
        campaign: c._id,
        influencer: influencerId,
        brand: brandId,
        participants: [influencerId, brandId].filter(Boolean),
        lastMessageAt: new Date(),
      });
    }

    return res.json({
      conversationId: convo._id.toString(),
      link: `/chat/${convo._id.toString()}`,
    });
  } catch (err) {
    console.error("Chat init error:", err);
    res.status(500).json({ error: "Failed to initialize chat" });
  }
});

// GET /api/influencer/campaigns/:id/chat/link
router.get("/:id/chat/link", verifyInfluencer, async (req, res) => {
  try {
    const influencerId = req.influencer._id;
    const { id } = req.params;

    const c = await Campaign.findById(id).lean();
    if (!c) return res.status(404).json({ error: "Campaign not found" });

    const app = Array.isArray(c.applicants)
      ? c.applicants.find(
          (a) => a.influencer && a.influencer.toString() === influencerId.toString()
        )
      : null;

    if (!app || app.status !== "Selected") {
      return res.status(403).json({ error: "Chat available only after selection" });
    }

    const brandId = c.brandId || null;

    const convo = await Conversation.findOne({
      campaign: c._id,
      influencer: influencerId,
      brand: brandId,
    }).lean();

    if (!convo) return res.status(404).json({ error: "Conversation not found" });

    return res.json({
      conversationId: convo._id.toString(),
      link: `/chat/${convo._id.toString()}`,
    });
  } catch (err) {
    console.error("Chat link error:", err);
    res.status(500).json({ error: "Failed to fetch chat link" });
  }
});

module.exports = router;
