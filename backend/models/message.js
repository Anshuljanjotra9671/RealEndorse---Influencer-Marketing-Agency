// models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderModel:  { type: String, enum: ["Brand", "Influencer"], required: true },
    sender:       { type: mongoose.Schema.Types.ObjectId, required: true },
    text:         { type: String },
    files:        [{ type: String }], // store Cloudinary URLs
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
