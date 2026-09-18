const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const upload = require("../../middleware/upload");
const {
  getBrandProfile,
  updateBrandProfile,
  uploadBrandLogo,
} = require("../../controllers/brand/profilecontroller");

router.get("/profile", auth, getBrandProfile);
router.post("/profile/update", auth, updateBrandProfile);
router.post("/profile/logo", auth, upload.single("logo"), uploadBrandLogo);

module.exports = router;
