// models/brand.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Embedded campaign subdocument used on the Brand document
// Note: _id is disabled; we rely on campaignId to reference the top-level Campaign
const campaignSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true, // ensures every embedded campaign points to a real Campaign
    },
    title: { type: String, required: true },
    dateRange: { type: String, required: true },
    status: { type: String, required: true }, // e.g., Active, Paused
    budget: { type: Number, required: true },
  },
  { _id: false }
);

// Main Brand schema
const brandSchema = new mongoose.Schema(
  {
    brandName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    category: { type: String, required: true },
    website: { type: String },

    // Profile Fields
    logo: { type: String, default: "" },
    bio: { type: String, default: "" },
    phone: { type: String, default: "" },
    industry: { type: String, default: "" },

    // Campaign-related
    campaigns: [campaignSchema],
    influencersEngaged: { type: Number, default: 0 },
    budgetSpent: { type: Number, default: 0 },

    // Subscription/Billing (added)
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    subscriptionPlan: { type: String }, // Stripe Price ID or internal key
    subscriptionStatus: {
      type: String,
      enum: [
        "active",
        "trialing",
        "past_due",
        "canceled",
        "unpaid",
        "incomplete",
        "incomplete_expired",
        "paused",
        "none",
      ],
      default: "none",
    },
    currentPeriodEnd: { type: Date },
    isPro: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before saving
brandSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
brandSchema.methods.comparePassword = function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

// Generate JWT token method
brandSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const Brand = mongoose.models.Brand || mongoose.model("Brand", brandSchema);
module.exports = Brand;
