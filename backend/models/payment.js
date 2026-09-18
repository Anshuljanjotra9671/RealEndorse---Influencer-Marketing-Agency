// models/payment.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },

    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    fee: { type: Number, default: 0 },

    provider: { type: String, enum: ["stripe", "razorpay"], required: true },
    status: {
      type: String,
      enum: ["created", "authorized", "succeeded", "failed", "released", "refunded"],
      default: "created",
    },

    providerIds: {
      intentId: String,    // Stripe: payment_intent; Razorpay: order_id
      chargeId: String,    // Stripe: charge; Razorpay: payment_id
      transferId: String,  // payout/transfer id
      refundId: String,    // refund id
    },

    idempotencyKey: { type: String, index: true },

    webhookEvents: [
      {
        eventId: String,
        type: String,
        receivedAt: { type: Date, default: Date.now },
        raw: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CampaignPayment", paymentSchema);
