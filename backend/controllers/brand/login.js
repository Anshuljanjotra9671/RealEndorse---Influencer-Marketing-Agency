const Brand = require("../../models/brand");

exports.loginBrand = async (req, res) => {
  const { email, password } = req.body;

  try {
    const brand = await Brand.findOne({ email }).select("+password");
    if (!brand) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await brand.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = brand.generateToken();
    res.status(200).json({ token }); // Send token to frontend
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
