// routes/campaign.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Campaign = require("../models/campaign");
const Brand = require("../models/brand");
const Influencer = require("../models/influencer");
const Conversation = require("../models/conversation"); // NEW: requires this model
const Message = require("../models/message");           // NEW: requires this model
const { protectBrand } = require("../middleware/authMiddleware")
const { sendMail } = require("../models/mailer");


// ✅ Create campaign (unchanged)
router.post("/", protectBrand, async (req, res) => {
  try {
    const { name, description, budget, category, deadline, currency } = req.body;


    if (!name) {
      return res.status(400).json({ message: "Campaign name is required" });
    }


    const campaign = await Campaign.create({
      name,
      brandName: req.brand.brandName,
      description: description || "",
      budget: budget ? Number(budget) : 0,
      category: category || "",
      deadline: deadline ? new Date(deadline) : null,


      // lifecycle defaults
      status: "Active",
      fundingStatus: "Unfunded",
      escrowAmount: budget ? Number(budget) : 0,
      currency: currency || "INR",


      applicants: [],
    });


    const dateRange = deadline
      ? `${new Date().toLocaleDateString()} - ${new Date(deadline).toLocaleDateString()}`
      : `${new Date().toLocaleDateString()} - N/A`;


    await Brand.findByIdAndUpdate(
      req.brand._id,
      {
        $push: {
          campaigns: {
            campaignId: campaign._id,
            title: name,
            dateRange,
            status: "Active",
            budget: campaign.budget,
          },
        },
      },
      { new: true }
    );


    return res.status(201).json({
      _id: campaign._id,
      name: campaign.name,
      brandName: campaign.brandName,
      description: campaign.description,
      budget: campaign.budget,
      category: campaign.category,
      deadline: campaign.deadline,
      status: campaign.status,
      fundingStatus: campaign.fundingStatus,
      currency: campaign.currency,
      createdAt: campaign.createdAt,
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ message: "Server error while creating campaign" });
  }
});


// ✅ List all campaigns for brand (unchanged)
router.get("/", protectBrand, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ brandName: req.brand.brandName }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ message: "Server error while fetching campaigns" });
  }
});


// ✅ List active (unchanged)
router.get("/list/active", protectBrand, async (req, res) => {
  try {
    const now = new Date();
    const campaigns = await Campaign.find({
      brandName: req.brand.brandName,
      status: { $in: ["Active", "Paused"] },
      $or: [{ deadline: null }, { deadline: { $gte: now } }],
    })
      .sort({ createdAt: -1 })
      .lean();
    res.json(campaigns);
  } catch (error) {
    console.error("Error fetching active campaigns:", error);
    res.status(500).json({ message: "Server error while fetching active campaigns" });
  }
});


// ✅ List past (unchanged response shape kept; additive selection snapshot below)
router.get("/list/past", protectBrand, async (req, res) => {
  try {
    const now = new Date();
    const campaigns = await Campaign.find({
      brandName: req.brand.brandName,
      $or: [{ status: { $in: ["Completed", "Cancelled"] } }, { deadline: { $lt: now } }],
    })
      .sort({ createdAt: -1 })
      .lean();


    // Add a lightweight selectedApplication snapshot for UI (non-breaking)
    const enriched = (campaigns || []).map((c) => {
      const apps = Array.isArray(c.applicants) ? c.applicants : [];
      const sel = apps.find((a) => a?.status === "Selected" && a?.influencer);
      return {
        ...c,
        selectedApplication: sel
          ? {
            influencerId: String(sel.influencer),
            influencerName: sel.influencerName || sel.name || undefined,
            status: "Selected",
          }
          : null,
      };
    });


    res.json(enriched);
  } catch (error) {
    console.error("Error fetching past campaigns:", error);
    res.status(500).json({ message: "Server error while fetching past campaigns" });
  }
});


// ✅ Campaign detail (tenancy enforced) + computed fields (additive)
router.get("/:id", protectBrand, async (req, res) => {
  try {
    const campaignId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }


    const campaign = await Campaign.findOne({
      _id: campaignId,
      brandName: req.brand.brandName,
    }).lean();


    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }


    const applicants = Array.isArray(campaign.applicants) ? campaign.applicants : [];
    const applicantIds = applicants
      .filter(a => a && a.influencer)
      .map(a => a.influencer);


    let verifiedApplicants = 0;
    let proApplicants = 0;
    let avgRealScore = null;


    if (applicantIds.length > 0) {
      const inflDocs = await Influencer.find(
        { _id: { $in: applicantIds } },
        { verifiedByPlatform: 1, plan: 1, realScore: 1 }
      ).lean();


      verifiedApplicants = inflDocs.filter(d => d?.verifiedByPlatform === true).length;
      proApplicants = inflDocs.filter(d => (d?.plan || "").toLowerCase() === "pro").length;


      const scores = inflDocs.map(d => typeof d?.realScore === "number" ? d.realScore : null).filter(v => v !== null);
      if (scores.length > 0) {
        avgRealScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      }
    }


    res.json({
      ...campaign,
      applicantsCount: applicants.length,
      totalApplicants: applicants.length,
      verifiedApplicants,
      proApplicants,
      avgRealScore,
    });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    res.status(500).json({ message: "Server error while fetching campaign" });
  }
});


// ✅ Recommended influencers (tenancy enforced) with verified/PRO/score weighting (additive)
router.get("/:id/recommended", protectBrand, async (req, res) => {
  try {
    const campaignId = req.params.id;


    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }


    const campaign = await Campaign.findOne({
      _id: campaignId,
      brandName: req.brand.brandName,
    });


    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }


    const match = campaign.category ? { category: campaign.category } : {};
    const recommended = await Influencer.find(match)
      .sort({
        verifiedByPlatform: -1,
        plan: -1,
        realScore: -1,
        followers: -1,
        engagementRate: -1,
      })
      .limit(12)
      .select("name email avatar followers engagementRate category realScore verifiedByPlatform plan")
      .lean();


    recommended.sort((a, b) => {
      const va = a.verifiedByPlatform ? 1 : 0;
      const vb = b.verifiedByPlatform ? 1 : 0;
      if (vb !== va) return vb - va;
      const pa = (a.plan || "").toLowerCase() === "pro" ? 1 : 0;
      const pb = (b.plan || "").toLowerCase() === "pro" ? 1 : 0;
      if (pb !== pa) return pb - pa;
      const ra = typeof a.realScore === "number" ? a.realScore : -1;
      const rb = typeof b.realScore === "number" ? b.realScore : -1;
      if (rb !== ra) return rb - ra;
      const fa = a.followers || 0;
      const fb = b.followers || 0;
      if (fb !== fa) return fb - fa;
      const ea = a.engagementRate || 0;
      const eb = b.engagementRate || 0;
      return eb - ea;
    });


    res.json(
      recommended.map((i) => ({
        _id: i._id,
        name: i.name,
        avatar: i.avatar || "/default-avatar.png",
        followers: i.followers || 0,
        engagementRate: i.engagementRate || 0,
        category: i.category || "N/A",
        verifiedByPlatform: !!i.verifiedByPlatform,
        plan: (i.plan || "free"),
        realScore: typeof i.realScore === "number" ? i.realScore : 0,
      }))
    );
  } catch (error) {
    console.error("Error fetching recommended influencers:", error);
    res.status(500).json({ message: "Server error while fetching recommendations" });
  }
});


// ✅ NEW: Paginated Applicants list with filters (additive)
router.get("/:id/applicants", protectBrand, async (req, res) => {
  try {
    const campaignId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }


    const { page = "1", pageSize = "12", verified, pro, minScore, maxScore, q } = req.query;


    const campaign = await Campaign.findOne({
      _id: campaignId,
      brandName: req.brand.brandName,
    }).lean();


    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }


    const applicants = Array.isArray(campaign.applicants) ? campaign.applicants : [];
    const ids = applicants.map(a => a?.influencer).filter(Boolean);
    if (ids.length === 0) {
      return res.json({
        items: [],
        page: Number(page) || 1,
        pageSize: Number(pageSize) || 12,
        totalItems: 0,
        totalPages: 1,
      });
    }


    const filter = { _id: { $in: ids } };
    if (verified === "true") filter.verifiedByPlatform = true;
    if (verified === "false") filter.verifiedByPlatform = { $ne: true };
    if (pro === "true") filter.plan = "pro";
    if (pro === "false") filter.plan = { $ne: "pro" };
    const minS = Number(minScore);
    const maxS = Number(maxScore);
    if (!isNaN(minS) || !isNaN(maxS)) {
      filter.realScore = {};
      if (!isNaN(minS)) filter.realScore.$gte = minS;
      if (!isNaN(maxS)) filter.realScore.$lte = maxS;
    }
    if (q && typeof q === "string" && q.trim()) {
      filter.$or = [
        { name: { $regex: q.trim(), $options: "i" } },
        { category: { $regex: q.trim(), $options: "i" } },
      ];
    }


    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(pageSize, 10) || 12, 1), 100);
    const skip = (pageNum - 1) * limit;


    const [itemsRaw, totalItems] = await Promise.all([
      Influencer.find(filter)
        .sort({
          verifiedByPlatform: -1,
          plan: -1,
          realScore: -1,
          followers: -1,
          engagementRate: -1,
        })
        .skip(skip)
        .limit(limit)
        .select("name email avatar followers engagementRate category realScore verifiedByPlatform plan")
        .lean(),
      Influencer.countDocuments(filter),
    ]);


    const items = itemsRaw.map((i) => {
      const app = applicants.find(a => a?.influencer && String(a.influencer) === String(i._id));
      return {
        _id: i._id,
        name: i.name,
        avatar: i.avatar || "/default-avatar.png",
        followers: i.followers || 0,
        engagementRate: i.engagementRate || 0,
        category: i.category || "N/A",
        verifiedByPlatform: !!i.verifiedByPlatform,
        plan: (i.plan || "free"),
        realScore: typeof i.realScore === "number" ? i.realScore : 0,
        applicationStatus: app?.status || "Applied",
        appliedAt: app?.appliedAt || null,
      };
    });


    res.json({
      items,
      page: pageNum,
      pageSize: limit,
      totalItems,
      totalPages: Math.max(Math.ceil(totalItems / limit), 1),
    });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).json({ message: "Server error while fetching applicants" });
  }
});


// ✅ NEW: Select an applicant for the campaign (assign work + notify)
router.post("/:id/applicants/:influencerId/select", protectBrand, async (req, res) => {
  try {
    const { id, influencerId } = req.params;


    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(influencerId)) {
      return res.status(400).json({ message: "Invalid IDs" });
    }


    // tenancy
    const campaign = await Campaign.findOne({ _id: id, brandName: req.brand.brandName });
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }


    // ensure the influencer actually applied
    const appIndex = (campaign.applicants || []).findIndex(
      a => a && String(a.influencer) === String(influencerId)
    );
    if (appIndex === -1) {
      return res.status(400).json({ message: "Influencer has not applied to this campaign" });
    }


    // guard: allow only one selected at a time unless you want multiple
    const alreadySelected = (campaign.applicants || []).some(a => a?.status === "Selected");
    if (alreadySelected) {
      return res.status(409).json({ message: "An influencer is already selected for this campaign" });
    }


    // set selected in applicants array
    campaign.applicants[appIndex].status = "Selected";
    await campaign.save();


    // notify influencer
    const infl = await Influencer.findById(influencerId).lean();
    if (infl?.email) {
      const subject = `You're selected for campaign: ${campaign.name}`;
      const text = `Hi ${infl.name || "Creator"},\n\nYou have been selected for the campaign "${campaign.name}" by ${campaign.brandName}.\nPlease check your dashboard for next steps.\n\n— Real Endorse`;
      const html = `<p>Hi ${infl.name || "Creator"},</p>
      <p>You have been <b>selected</b> for the campaign "<b>${campaign.name}</b>" by <b>${campaign.brandName}</b>.</p>
      <p>Please check your dashboard for next steps.</p>
      <p>— Real Endorse</p>`;
      await sendMail({ to: infl.email, subject, text, html });
    }


    return res.json({ message: "Influencer selected successfully" });
  } catch (error) {
    console.error("Error selecting influencer:", error);
    res.status(500).json({ message: "Server error while selecting influencer" });
  }
});


/* =========================
   NEW CHAT ROUTES (brand)
   ========================= */


// POST /api/campaigns/:id/chat/init

// POST /api/campaigns/:id/chat/init
router.post("/:id/chat/init", protectBrand, async (req, res) => {
  try {
    const campaignId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(campaignId))
      return res.status(400).json({ error: "Invalid campaign id" });

    const campaign = await Campaign.findById(campaignId).lean();
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    if (String(campaign.brand) !== String(req.user._id))
      return res.status(403).json({ error: "Not authorized for this campaign" });

    const sel = campaign.selectedApplication;
    if (!sel || sel.status !== "Selected" || !sel.influencerId)
      return res.status(409).json({ error: "No selected influencer for this campaign" });

    const brandId      = req.user._id;
    const influencerId = sel.influencerId;

    const conv = await Conversation.findOneAndUpdate(
      { campaign: campaignId, brand: brandId, influencer: influencerId },
      { $setOnInsert: { campaign: campaignId, brand: brandId, influencer: influencerId, participants: [brandId, influencerId], lastMessageAt: new Date() } },
      { new: true, upsert: true }
    );

    return res.json({ conversationId: String(conv._id), link: `/chat/${String(conv._id)}` });
  } catch (e) {
    console.error("Brand chat init error:", e);
    return res.status(500).json({ error: "Failed to initialize chat" });
  }
});

module.exports = router;
