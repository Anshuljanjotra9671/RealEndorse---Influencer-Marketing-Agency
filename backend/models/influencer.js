const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const campaignSubdoc = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign" },
  name: String,
  brandName: String,
  category: String,
  status: { type: String, enum: ["Active", "Completed"], default: "Active" },
  earnings: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  appliedAt: { type: Date, default: Date.now }
}, { _id: false });

const sponsorshipSubdoc = new mongoose.Schema({
  sponsorshipId: { type: mongoose.Schema.Types.ObjectId, ref: "Sponsorship" },
  brand: String,
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  details: String,
  appliedAt: { type: Date, default: Date.now }
}, { _id: false });

const influencerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String, required: true, unique: true, lowercase: true, trim: true, match: /^\S+@\S+\.\S+$/
  },
  password: { type: String, required: true, select: false },
  avatar: { type: String, default: "" },
  platform: { type: String, trim: true, default: "" },
  location: { type: String, trim: true, default: "" },
  socials: [{ platform: String, url: String }],
  bio: { type: String, default: "", trim: true },
  contact: { type: String, default: "" },
  category: { type: String, required: true, trim: true },
  followers: { type: Number, default: 0, min: 0 },
  engagementRate: { type: Number, default: 0, min: 0, max: 100 },
  avgCostPerPost: { type: Number, default: 0, min: 0 },
  campaignRevenue: { type: Number, default: 0 },
  pendingMessages: { type: Number, default: 0 },
  campaigns: [campaignSubdoc],
  sponsorships: [sponsorshipSubdoc],
  // Subscription and feature flags
  realScore: { type: Number, default: 50, min: 0, max: 100 },
  subscription: {
    status: { type: String, enum: ["free", "pro"], default: "free" },
    validUntil: { type: Date, default: null },
    lastPaid: { type: Date, default: null }
  }
}, { timestamps: true });

influencerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

influencerSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

influencerSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

influencerSchema.methods.getDashboardStats = function () {
  const recentCampaigns = this.campaigns?.slice(-5).reverse() || [];
  const totalImpressions = this.campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
  const totalRevenue = this.campaigns.reduce((sum, c) => sum + (c.earnings || 0), 0);
  const engagementRate = this.followers
    ? ((totalImpressions / this.followers) * 100).toFixed(2)
    : "0.00";
  return {
    name: this.name,
    totalFollowers: this.followers,
    engagementRate: `${engagementRate}%`,
    campaignRevenue: `$${totalRevenue.toLocaleString()}`,
    pendingMessages: this.pendingMessages || 0,
    realScore: this.realScore,
    subscription: this.subscription?.status || "free",
    recentCampaigns,
  };
};

influencerSchema.statics.updateProfile = async function (id, data) {
  const allowedFields = [
    "name", "bio", "contact", "category", "avatar", "socials", "platform", "location"
  ];
  const updateData = {};
  for (let key of allowedFields) {
    if (data[key] !== undefined) updateData[key] = data[key];
  }
  return await this.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

influencerSchema.statics.signup = async function (data) {
  const existing = await this.findOne({ email: data.email });
  if (existing) throw new Error("Email already registered");
  const influencer = new this(data);
  await influencer.save();
  const token = influencer.generateAuthToken();
  return { influencer, token };
};

influencerSchema.statics.login = async function (email, password) {
  const influencer = await this.findOne({ email }).select("+password");
  if (!influencer) throw new Error("Invalid credentials");
  const isMatch = await influencer.comparePassword(password);
  if (!isMatch) throw new Error("Invalid credentials");
  const token = influencer.generateAuthToken();
  return { influencer, token };
};

module.exports = mongoose.models.Influencer || mongoose.model("Influencer", influencerSchema);
