const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avatar: { type: String }, // profile pic url
  role: { type: String, enum: ["brand", "influencer"], required: true },
  email: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("User", userSchema);
