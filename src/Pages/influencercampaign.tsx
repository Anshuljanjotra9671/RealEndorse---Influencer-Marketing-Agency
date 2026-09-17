import React, { useEffect, useState } from "react";
import axios from "axios";

interface Campaign {
  _id: string;
  name: string;
  brandName: string;
  description: string;
  budget: number;
  category: string;
  deadline: string | null;
}

const InfluencerCampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  // Use correct token key as in your login logic!
  const token = localStorage.getItem("influencerToken");

  useEffect(() => {
    if (!token) {
      setError("Not authenticated. Please login.");
      setLoading(false);
      return;
    }

    const fetchCampaigns = async () => {
      try {
        const res = await axios.get<{ campaigns: Campaign[]; appliedCampaigns: string[] }>(
          "http://localhost:5000/api/influencer/campaigns",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCampaigns(res.data.campaigns || []);
        setAppliedIds(res.data.appliedCampaigns || []);
      } catch (e) {
        console.error("Error fetching campaigns", e);
        setError("Failed to fetch campaigns.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
    // Only run once on mount!
    // eslint-disable-next-line
  }, []);

  const applyToCampaign = async (campaignId: string) => {
    if (!token) {
      setError("Not authenticated. Please login.");
      return;
    }
    setApplyingId(campaignId);
    setError("");
    try {
      await axios.post(
        `http://localhost:5000/api/influencer/campaigns/${campaignId}/apply`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppliedIds((prev) => [...prev, campaignId]);
      alert("Application successful!");
    } catch (e) {
      console.error("Application failed", e);
      alert("Failed to apply for campaign.");
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) return <p className="p-10 text-gray-600">Loading campaigns...</p>;

  return (
    <div className="p-6 md:p-10 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">🔥 Available Campaigns</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {campaigns.length === 0 ? (
        <p className="text-gray-500 text-lg">No campaigns available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c) => (
            <div key={c._id} className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-blue-700 mb-2">{c.name}</h2>
                <p className="text-sm text-gray-600 mb-3">{c.description}</p>
                <div className="text-sm space-y-1 text-gray-700">
                  <p><b>Brand:</b> {c.brandName}</p>
                  <p><b>Budget:</b> ₹{c.budget.toLocaleString()}</p>
                  <p><b>Category:</b> {c.category}</p>
                  <p><b>Deadline:</b> {c.deadline ? new Date(c.deadline).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>

              <button
                onClick={() => applyToCampaign(c._id)}
                disabled={appliedIds.includes(c._id) || applyingId === c._id}
                className={`mt-4 w-full py-2 px-4 rounded font-semibold transition ${
                  appliedIds.includes(c._id) || applyingId === c._id
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                aria-disabled={appliedIds.includes(c._id) || applyingId === c._id}
              >
                {appliedIds.includes(c._id)
                  ? "✅ Applied"
                  : applyingId === c._id
                  ? "Applying..."
                  : "Apply Now"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InfluencerCampaignsPage;
