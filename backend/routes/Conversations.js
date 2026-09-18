// routes/chat.js
const express = require("express");
const mongoose = require("mongoose");

const Conversation = require("../models/conversation");
const Message = require("../models/message");
const Brand = require("../models/brand");
const Influencer = require("../models/influencer");

const { upload, uploadBufferToCloudinary } = require("../lib/uploads");

// IMPORTANT: import named exports that include protectAny
const { protectAny } = require("../middleware/authMiddleware")

const router = express.Router();

/**
 * GET /api/chat/:conversationId
 * Returns conversation header info used by ChatPage header.
 */
router.get("/:conversationId", protectAny, async (req, res) => {
  try {
    const { conversationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation id" });
    }

    const convo = await Conversation.findById(conversationId)
      .populate({ path: "campaign", select: "title name" })
      .populate({ path: "brand", select: "name avatar lastSeen" })
      .populate({ path: "influencer", select: "name avatar lastSeen" })
      .lean();

    if (!convo) return res.status(404).json({ error: "Conversation not found" });

    // Authorization: must be participant
    const actorId = req.actorId;
    if (![String(convo.brand), String(convo.influencer)].includes(String(actorId))) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return res.json({
      _id: String(convo._id),
      campaign: convo.campaign
        ? { _id: String(convo.campaign._id), title: convo.campaign.title || convo.campaign.name }
        : null,
      brand: convo.brand
        ? { _id: String(convo.brand._id), name: convo.brand.name, avatar: convo.brand.avatar, lastSeen: convo.brand.lastSeen }
        : null,
      influencer: convo.influencer
        ? { _id: String(convo.influencer._id), name: convo.influencer.name, avatar: convo.influencer.avatar, lastSeen: convo.influencer.lastSeen }
        : null,
    });
  } catch (e) {
    console.error("Chat info error:", e);
    return res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

/**
 * GET /api/chat/:conversationId/messages
 * Returns messages for a conversation in ascending time order.
 */
router.get("/:conversationId/messages", protectAny, async (req, res) => {
  try {
    const { conversationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation id" });
    }

    const convo = await Conversation.findById(conversationId).lean();
    if (!convo) return res.status(404).json({ error: "Conversation not found" });

    const actorId = req.actorId;
    if (![String(convo.brand), String(convo.influencer)].includes(String(actorId))) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const items = await Message.find({ conversation: convo._id })
      .sort({ createdAt: 1 })
      .lean();

    // batch resolve senders for UI
    const brandIds = [...new Set(items.filter(m => m.senderModel === "Brand").map(m => String(m.sender)))];
    const inflIds = [...new Set(items.filter(m => m.senderModel === "Influencer").map(m => String(m.sender)))];

    const brands = brandIds.length
      ? await Brand.find({ _id: { $in: brandIds } }).select("name avatar").lean()
      : [];
    const infls = inflIds.length
      ? await Influencer.find({ _id: { $in: inflIds } }).select("name avatar").lean()
      : [];

    const brandMap = new Map(brands.map(b => [String(b._id), b]));
    const inflMap = new Map(infls.map(i => [String(i._id), i]));

    const messages = items.map(m => {
      const s = m.senderModel === "Brand" ? brandMap.get(String(m.sender)) : inflMap.get(String(m.sender));
      return {
        _id: String(m._id),
        senderModel: m.senderModel,
        sender: s
          ? { _id: String(m.sender), name: s.name, avatar: s.avatar }
          : { _id: String(m.sender), name: "Unknown" },
        text: m.text,
        files: m.files || [],
        createdAt: m.createdAt,
      };
    });

    return res.json(messages);
  } catch (e) {
    console.error("Chat messages error:", e);
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
});

/**
 * POST /api/chat/:conversationId/send
 * Multipart: text + files[]
 */
router.post("/:conversationId/send", protectAny, upload.array("files", 6), async (req, res) => {
  try {
    const { conversationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation id" });
    }

    const convo = await Conversation.findById(conversationId);
    if (!convo) return res.status(404).json({ error: "Conversation not found" });

    const actorId = req.actorId;
    const actorType = req.actorType; // "Brand" | "Influencer"
    if (![String(convo.brand), String(convo.influencer)].includes(String(actorId))) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const text = (req.body.text || "").trim();
    const urls = [];

    for (const f of req.files || []) {
      const up = await uploadBufferToCloudinary(f.buffer, f.originalname, f.mimetype);
      urls.push(up.secure_url);
    }

    if (!text && urls.length === 0) {
      return res.status(400).json({ error: "Empty message" });
    }

    const msg = await Message.create({
      conversation: convo._id,
      senderModel: actorType,
      sender: actorId,
      text: text || undefined,
      files: urls.length ? urls : undefined,
    });

    convo.lastMessageAt = new Date();
    await convo.save();

    return res.status(201).json({
      _id: String(msg._id),
      senderModel: msg.senderModel,
      sender: { _id: String(actorId) },
      text: msg.text,
      files: msg.files || [],
      createdAt: msg.createdAt,
    });
  } catch (e) {
    console.error("Chat send error:", e);
    return res.status(500).json({ error: "Failed to send message" });
  }
});

module.exports = router;
