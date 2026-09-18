// lib/uploads.js
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME || "",
  api_key:    process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

const uploadBufferToCloudinary = (buffer, filename, mimetype) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    { resource_type: "auto", folder: "chat_uploads" },
    (error, result) => error || !result
      ? reject(error || new Error("Cloudinary upload failed"))
      : resolve({ secure_url: result.secure_url })
  );
  stream.end(buffer);
});

module.exports = { upload, uploadBufferToCloudinary };
