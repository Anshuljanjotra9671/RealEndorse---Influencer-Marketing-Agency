const mongoose = require("mongoose");

const applicantSchema = new mongoose.Schema({
  influencer: { type: mongoose.Schema.Types.ObjectId, ref: "Influencer", required: true },
  status: { type: String, enum: ["Applied", "Selected", "Rejected"], default: "Applied" },
  appliedAt: { type: Date, default: Date.now }
}, { _id: false });

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brandName: { type: String, required: true },
  description: { type: String, default: "" },
  budget: { type: Number, default: 0 },
  category: { type: String, default: "" },
  deadline: { type: Date, default: null },
  status: {
    type: String,
    enum: ["Active", "Paused", "Completed", "Cancelled"],
    default: "Active",
  },
  fundingStatus: {
    type: String,
    enum: ["Unfunded", "Funding", "Funded", "Held", "Released", "Refunded", "Failed"],
    default: "Unfunded",
  },
  escrowAmount: { type: Number, default: 0 },
  currency: { type: String, default: "INR" },
  applicants: [applicantSchema],
}, { timestamps: true });

module.exports = mongoose.model("Campaign", campaignSchema);
