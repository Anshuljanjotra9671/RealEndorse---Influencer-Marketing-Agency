// models/Conversation.js
const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    campaign:   { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
    brand:      { type: mongoose.Schema.Types.ObjectId, ref: "Brand",    required: true },
    influencer: { type: mongoose.Schema.Types.ObjectId, ref: "Influencer", required: true },
    lastMessageAt: { type: Date, default: Date.now },
    participants: [{ type: mongoose.Schema.Types.ObjectId }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
