const Brand = require("../../models/brand");

// GET /api/brand/profile
exports.getBrandProfile = async (req, res) => {
  try {
    const brandId = req.user?.id || req.userId || req.brand?._id;
    if (!brandId) return res.status(401).json({ error: "Unauthorized" });

    const brand = await Brand.findById(brandId);
    if (!brand) return res.status(404).json({ error: "Brand not found" });

    // Map brandName -> name for UI
    res.json({
      name: brand.brandName || "",
      logo: brand.logo || "",
      bio: brand.bio || "",
      website: brand.website || "",
      email: brand.email || "",
      phone: brand.phone || "",
      industry: brand.industry || "",
    });
  } catch (err) {
    console.error("Fetch profile failed:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// POST /api/brand/profile/update
exports.updateBrandProfile = async (req, res) => {
  try {
    const brandId = req.user?.id || req.userId || req.brand?._id;
    if (!brandId) return res.status(401).json({ error: "Unauthorized" });

    // Whitelist UI fields, then map name -> brandName
    const allowedFields = ["name", "logo", "bio", "website", "email", "phone", "industry"];
    const updates = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    // Map UI "name" into schema "brandName"
    if (Object.prototype.hasOwnProperty.call(updates, "name")) {
      updates.brandName = updates.name;
      delete updates.name;
    }

    const brand = await Brand.findByIdAndUpdate(brandId, updates, {
      new: true,
      runValidators: true,
    });
    if (!brand) return res.status(404).json({ error: "Brand not found" });

    // Normalize response for UI (brandName -> name)
    res.json({
      message: "Profile updated",
      brand: {
        name: brand.brandName || "",
        logo: brand.logo || "",
        bio: brand.bio || "",
        website: brand.website || "",
        email: brand.email || "",
        phone: brand.phone || "",
        industry: brand.industry || "",
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Update failed" });
  }
};

// POST /api/brand/profile/logo
exports.uploadBrandLogo = async (req, res) => {
  try {
    const brandId = req.user?.id || req.userId || req.brand?._id;
    if (!brandId) return res.status(401).json({ error: "Unauthorized" });

    const logoUrl = req.file?.path;
    if (!logoUrl) return res.status(400).json({ error: "No logo file uploaded" });

    const brand = await Brand.findByIdAndUpdate(
      brandId,
      { logo: logoUrl },
      { new: true }
    );
    if (!brand) return res.status(404).json({ error: "Brand not found" });

    res.json({
      message: "Logo updated successfully",
      logo: logoUrl,
      brand: {
        name: brand.brandName || "",
        logo: brand.logo || "",
        bio: brand.bio || "",
        website: brand.website || "",
        email: brand.email || "",
        phone: brand.phone || "",
        industry: brand.industry || "",
      },
    });
  } catch (err) {
    console.error("Logo upload error:", err);
    res.status(500).json({ error: "Logo upload failed" });
  }
};
