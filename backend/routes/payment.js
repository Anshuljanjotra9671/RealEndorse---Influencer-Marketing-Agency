// routes/payments.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const protectBrand = require("../middleware/auth");
const Campaign = require("../models/campaign");
const Brand = require("../models/brand");
const CampaignPayment = require("../models/payment");

async function getBrandCampaign(brand, campaignId) {
  if (!mongoose.Types.ObjectId.isValid(campaignId)) return null;
  return Campaign.findOne({ _id: campaignId, brandName: brand.brandName });
}

// POST /api/payments/campaign/:id/initiate
router.post("/campaign/:id/initiate", protectBrand, async (req, res) => {
  try {
    const campaign = await getBrandCampaign(req.brand, req.params.id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    const amount = campaign.escrowAmount || campaign.budget || 0;
    if (amount <= 0) return res.status(400).json({ message: "Invalid amount to fund" });

    const payment = await CampaignPayment.create({
      campaignId: campaign._id,
      brandId: req.brand._id,
      amount,
      currency: campaign.currency || "INR",
      provider: process.env.PAYMENT_PROVIDER || "stripe",
      status: "created",
      idempotencyKey: `${campaign._id}:${Date.now()}`,
    });

    // TODO: Provider SDK call (Stripe/Razorpay test mode)
    // Store providerIds.intentId/order_id and return any client fields if needed.

    campaign.fundingStatus = "Funding";
    await campaign.save();

    res.json({
      message: "Payment initiated",
      paymentId: payment._id,
      campaignId: campaign._id,
      fundingStatus: campaign.fundingStatus,
    });
  } catch (err) {
    console.error("Initiate payment error:", err);
    res.status(500).json({ message: "Failed to initiate payment" });
  }
});

// POST /api/payments/campaign/:id/release
router.post("/campaign/:id/release", protectBrand, async (req, res) => {
  try {
    const campaign = await getBrandCampaign(req.brand, req.params.id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    if (!["Funded", "Held"].includes(campaign.fundingStatus)) {
      return res.status(400).json({ message: "Campaign is not funded/held for release" });
    }

    const pay = await CampaignPayment.findOne({
      campaignId: campaign._id,
      brandId: req.brand._id,
      status: { $in: ["authorized", "succeeded"] },
    }).sort({ createdAt: -1 });

    if (!pay) return res.status(400).json({ message: "No completed payment to release" });

    // TODO: Provider transfer/payout call
    pay.status = "released";
    await pay.save();

    campaign.fundingStatus = "Released";
    campaign.status = "Completed";
    await campaign.save();

    await Brand.updateOne(
      { _id: req.brand._id, "campaigns.campaignId": campaign._id },
      { $set: { "campaigns.$.status": "Completed" } }
    );

    res.json({ message: "Funds released and campaign marked Completed" });
  } catch (err) {
    console.error("Release payment error:", err);
    res.status(500).json({ message: "Failed to release payment" });
  }
});

// POST /api/payments/campaign/:id/refund
router.post("/campaign/:id/refund", protectBrand, async (req, res) => {
  try {
    const campaign = await getBrandCampaign(req.brand, req.params.id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    const pay = await CampaignPayment.findOne({
      campaignId: campaign._id,
      brandId: req.brand._id,
      status: { $in: ["authorized", "succeeded"] },
    }).sort({ createdAt: -1 });

    if (!pay) return res.status(400).json({ message: "No payment to refund" });

    // TODO: Provider refund call
    pay.status = "refunded";
    await pay.save();

    campaign.fundingStatus = "Refunded";
    await campaign.save();

    res.json({ message: "Refund initiated" });
  } catch (err) {
    console.error("Refund error:", err);
    res.status(500).json({ message: "Failed to refund payment" });
  }
});

module.exports = router;
