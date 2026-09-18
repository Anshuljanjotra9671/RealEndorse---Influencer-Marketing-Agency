// jobs/autoCompleteCampaigns.js
const cron = require("node-cron");
const Campaign = require("../../models/campaign");
const Brand = require("../../models/brand");

function startAutoCompleteCampaignsJob() {
  // Every hour at minute 5
  cron.schedule("5 * * * *", async () => {
    const now = new Date();
    try {
      const overdue = await Campaign.find({
        deadline: { $ne: null, $lt: now },
        status: { $in: ["Active", "Paused"] },
      })
        .select("_id brandName")
        .lean();

      if (!overdue.length) return;

      const ids = overdue.map((c) => c._id);
      await Campaign.updateMany({ _id: { $in: ids } }, { $set: { status: "Completed" } });

      const brands = await Brand.find({ "campaigns.campaignId": { $in: ids } });
      for (const b of brands) {
        let changed = false;
        b.campaigns = (b.campaigns || []).map((sc) => {
          if (ids.some((id) => String(id) === String(sc.campaignId))) {
            if (sc.status !== "Completed") {
              sc.status = "Completed";
              changed = true;
            }
          }
          return sc;
        });
        if (changed) await b.save();
      }

      console.log(`[AutoComplete] Completed ${ids.length} overdue campaigns`);
    } catch (err) {
      console.error("[AutoComplete] Error:", err);
    }
  });
}

module.exports = { startAutoCompleteCampaignsJob };
