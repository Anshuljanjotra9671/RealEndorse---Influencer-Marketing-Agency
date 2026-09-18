const express = require("express");
const router = express.Router();
const Campaign = require("../models/campaign");
const Brand = require("../models/brand"); // used for public brand snapshot
const { verifyInfluencer } = require("../middleware/authMiddleware")
const Conversation = require("../models/conversation");
const Message = require("../models/message");


// GET /api/influencer/campaigns/all
router.get("/all", verifyInfluencer, async (req, res) => {
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
    const items = itemsRaw.map((camp) => {
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
    res.json({
      items,
      page: pageNum,
      pageSize: limit,
      totalItems,
      totalPages: Math.max(Math.ceil(totalItems / limit), 1),
      availableBrands: (brandsAgg || []).map((b) => b._id).filter(Boolean),
      availableCategories: (categoriesAgg || []).map((c) => c._id).filter(Boolean),
    });
  } catch (err) {
    console.error("InfluencerCampaigns ALL error at step:", step, err);
    res.status(500).json({
      error: "Failed to fetch all campaigns",
      step: step.at,
      detail: err?.message || "",
    });
  }
});


// GET /api/influencer/campaigns/applied
router.get("/applied", verifyInfluencer, async (req, res) => {
  try {
    const influencerId = req.influencer._id;
    const campaigns = await Campaign.find({
      "applicants.influencer": influencerId,
    })
      .sort({ createdAt: -1 })
      .lean();


    const mappedCampaigns = campaigns.map((campaign) => {
      const app = (campaign.applicants || []).find(
        (a) => a.influencer && a.influencer.toString() === influencerId.toString()
      );


      return {
        id: campaign._id.toString(),
        name: campaign.name || "",
        brandName: campaign.brandName || "",
        category: campaign.category || "",
        description: campaign.description || "",
        budget: campaign.budget || 0,
        deadline: campaign.deadline ? campaign.deadline.toISOString() : null,
        campaignStatus: campaign.status || "Unknown",
        applicationStatus: app ? app.status : "Unknown",
      };
    });


    const totalApplied = mappedCampaigns.length;
    const selectedCount = mappedCampaigns.filter((c) => c.applicationStatus === "Selected").length;
    const pendingCount = mappedCampaigns.filter((c) => c.applicationStatus === "Pending").length;
    const rejectedCount = mappedCampaigns.filter((c) => c.applicationStatus === "Rejected").length;


    return res.json({
      campaigns: mappedCampaigns,
      totalApplied,
      selectedCount,
      pendingCount,
      rejectedCount,
    });
  } catch (error) {
    console.error("Error fetching applied campaigns:", error);
    return res.status(500).json({ message: "Failed to fetch applied campaigns" });
  }
});


// DELETE DUPLICATE simple /applied route – removed to avoid overriding the real one.


// NEW: GET /api/influencer/campaigns/:id/detail
// Returns a full campaign detail for this influencer including applicationStatus and brand identifiers.
router.get("/:id/detail", verifyInfluencer, async (req, res) => {
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


    // Try to provide a brandId if your Campaign model stores it; otherwise just brandName
    // Adjust field names if your schema uses a different path (e.g., c.brand or c.brand._id).
    const brandId = c.brandId ? String(c.brandId) : undefined;


    const detail = {
      id: String(c._id),
      name: c.name || "",
      brandId,
      brandName: c.brandName || "",
      category: c.category || "",
      description: c.description || "",
      budget: typeof c.budget === "number" ? c.budget : 0,
      deadline: c.deadline ? c.deadline.toISOString() : null,
      deliverables: Array.isArray(c.deliverables) ? c.deliverables : [],
      platforms: Array.isArray(c.platforms) ? c.platforms : [],
      campaignStatus: c.status || "Unknown",
      applicationStatus: app ? app.status : "Unknown",
      createdAt: c.createdAt ? c.createdAt.toISOString() : undefined,
    };


    res.json(detail);
  } catch (err) {
    console.error("Campaign detail error:", err);
    res.status(500).json({ error: "Failed to fetch campaign detail" });
  }
});


// NEW: GET /api/influencer/campaigns/brand-public/by-id/:brandId
router.get("/brand-public/by-id/:brandId", async (req, res) => {
  try {
    const { brandId } = req.params;
    const b = await Brand.findById(brandId).lean();
    if (!b) return res.status(404).json({ error: "Brand not found" });


    // If your Brand model uses brandName (as shown earlier), map brandName -> name here
    res.json({
      name: b.brandName || b.name || "",
      logo: b.logo || "",
      website: b.website || "",
      email: b.email || "",
      phone: b.phone || "",
      industry: b.industry || "",
      bio: b.bio || "",
    });
  } catch (err) {
    console.error("Brand public by id error:", err);
    res.status(500).json({ error: "Failed to fetch brand info" });
  }
});


// NEW: GET /api/influencer/campaigns/brand-public/by-name/:brandName
router.get("/brand-public/by-name/:brandName", async (req, res) => {
  try {
    const { brandName } = req.params;
    // If brand is keyed by email or user, adjust the finder accordingly.
    const b = await Brand.findOne({ brandName }).lean();
    if (!b) return res.status(404).json({ error: "Brand not found" });


    res.json({
      name: b.brandName || b.name || "",
      logo: b.logo || "",
      website: b.website || "",
      email: b.email || "",
      phone: b.phone || "",
      industry: b.industry || "",
      bio: b.bio || "",
    });
  } catch (err) {
    console.error("Brand public by name error:", err);
    res.status(500).json({ error: "Failed to fetch brand info" });
  }
});






router.post("/:id/chat/init", verifyInfluencer, async (req, res) => {
  try {
    const influencerId = req.influencer._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid campaign id" });

    const camp = await Campaign.findById(id).lean();
    if (!camp) return res.status(404).json({ error: "Campaign not found" });

    const app = Array.isArray(camp.applicants)
      ? camp.applicants.find(a => a.influencer && String(a.influencer) === String(influencerId))
      : null;

    if (!app || app.status !== "Selected")
      return res.status(403).json({ error: "Chat available only after selection" });

    // Use the same field as brand side: `camp.brand`
    const brandId = camp.brand;

    const conv = await Conversation.findOneAndUpdate(
      { campaign: camp._id, brand: brandId, influencer: influencerId },
      { $setOnInsert: { campaign: camp._id, brand: brandId, influencer: influencerId, participants: [brandId, influencerId], lastMessageAt: new Date() } },
      { new: true, upsert: true }
    );

    return res.json({ conversationId: String(conv._id), link: `/chat/${String(conv._id)}` });
  } catch (err) {
    console.error("Influencer chat init error:", err);
    res.status(500).json({ error: "Failed to initialize chat" });
  }
});


module.exports = router;