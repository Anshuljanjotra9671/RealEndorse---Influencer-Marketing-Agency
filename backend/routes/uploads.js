// routes/upload.js
const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

// Multer setup to store files in memory
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB limit
});

// Upload route accepting multiple files
router.post("/", upload.array("files", 6), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      // Upload each file buffer to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: "uploads" },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error("Cloudinary upload failed"));
            } else {
              resolve(result);
            }
          }
        );
        stream.end(file.buffer);
      });

      uploadedFiles.push({
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      });
    }

    return res.json({ files: uploadedFiles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
