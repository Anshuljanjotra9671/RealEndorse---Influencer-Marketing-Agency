// server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const uploadRoute = require("./routes/uploads");
const brandRoutes = require("./routes/brand/brandRoutes");
const brandDashboardRoutes = require("./routes/brand/dashboard");
const brandProfileRoutes = require("./routes/brand/profile");
const influencerRoutes = require("./routes/influencerRoutes");
const influencerDashboardRoutes = require("./routes/influencerDashboardRoutes");
const influencerCampaignRoutes = require("./routes/influencerCampaign");
const campaignRoutes = require("./routes/campaignroutes"); // ensure filename matches ./routes/campaign.js
const paymentsRoutes = require("./routes/payment");
const webhooksRoutes = require("./routes/webhooks");
const { startAutoCompleteCampaignsJob } = require("./routes/jobs/autoCompleteCampaigns");
const conversationRoutes = require("./routes/Conversations");
const brandBillingRouter = require('./routes/brand/billing');



const app = express();
const PORT = process.env.PORT || 5000;

// DB Connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/brands", brandRoutes);
app.use("/api/brand/dashboard", brandDashboardRoutes);
app.use("/api/brand", brandProfileRoutes);

app.use("/api/campaigns", campaignRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/webhooks", webhooksRoutes);


app.use('/api/brand/billing', brandBillingRouter);
app.use("/api/upload", uploadRoute);
app.use("/uploads", express.static("uploads"));
app.use("/api/conversations", conversationRoutes);

// Influencer Routes
app.use("/api/influencer", influencerRoutes);
app.use("/api/influencer/dashboard", influencerDashboardRoutes);
app.use("/api/influencer/campaigns", influencerCampaignRoutes);

// Health Check
app.get("/", (req, res) => res.send("✅ Backend is running!"));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server started at http://localhost:${PORT}`);
  // Start hourly job after server starts
  startAutoCompleteCampaignsJob();
});
// JSON error handler (place AFTER routes and 404 handler)
app.use((err, req, res, next) => {
  console.error("Express error:", err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
  });
});
