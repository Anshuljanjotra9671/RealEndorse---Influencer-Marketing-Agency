import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiHome,
  FiUser,
  FiBarChart2,
  FiLogOut,
  FiAward,
  FiTrendingUp,
  FiGift,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";

interface CampaignRecommendation {
  _id: string;
  name: string;
  brandName: string;
  category: string;
  deadline: string | null;
  budget: number;
  isApplied: boolean;
}

interface StatsResponse {
  name: string;
  realScore: number;
  subscription: "free" | "pro";
  totalFollowers: number;
  engagementRate: string;
  campaignRevenue: string;
  pendingMessages: number;
  recentCampaigns: {
    _id: string;
    name: string;
    status: string;
    earnings: number;
    impressions: number;
  }[];
  activeByBrand?: Record<string, number>;
  activeByCategory?: Record<string, number>;
  recommendations: CampaignRecommendation[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  // NEW: track how many recommended items to request
  const [recLimit, setRecLimit] = useState<number>(6);

  const navigate = useNavigate();
  const token = localStorage.getItem("influencerToken");

  // NEW: load dashboard with limit
  const fetchDashboard = async (limit: number) => {
    try {
      setLoading(true);
      const { data } = await axios.get<StatsResponse>(
        `${API_BASE}/api/influencer/dashboard?limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStats(data);
      setRecLimit(limit);
    } catch {
      setError("Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError("Please login to continue.");
      setLoading(false);
      return;
    }
    // initial load with default limit
    fetchDashboard(recLimit);
    // eslint-disable-next-line
  }, []);

  const handleUpgrade = async () => {
    if (!token) {
      alert("Please login.");
      return;
    }
    setUpgradeLoading(true);
    try {
      await axios.post(
        `${API_BASE}/api/influencer/subscribe`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Upgraded to Pro successfully!");
      window.location.reload();
    } catch {
      alert("Upgrade failed.");
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleApply = async (campaignId: string) => {
    if (!token) {
      alert("Please login.");
      return;
    }
    setApplyingId(campaignId);
    try {
      await axios.post(
        `${API_BASE}/api/influencer/dashboard/campaigns/${campaignId}/apply`,
        {},
        {
          headers: { Authorization: { toString: () => `Bearer ${token}` } as any },
        }
      );

      // Update apply status in local state
      setStats((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          recommendations: prev.recommendations.map((c) =>
            c._id === campaignId ? { ...c, isApplied: true } : c
          ),
        };
      });

      alert("Applied successfully");
    } catch (error) {
      alert("Failed to apply. Please try again");
    } finally {
      setApplyingId(null);
    }
  };

  // NEW: increase limit by 6 and refetch
  const handleShowMore = () => {
    const nextLimit = recLimit + 6;
    fetchDashboard(nextLimit);
  };

  if (loading) return <div className="p-10">Loading dashboard...</div>;
  if (error)
    return (
      <div className="p-10 text-red-600 font-semibold">
        Error: {error}
      </div>
    );

  if (!stats) return null;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:flex flex-col justify-between px-6 py-8">
        <div>
          <h2 className="text-2xl font-bold text-blue-600 mb-10">Dashboard</h2>
          <nav className="space-y-4 text-gray-700">
            <a
              className="flex items-center gap-3 hover:text-blue-600"
              href="/influencerDashboard"
            >
              <FiHome size={18} />
              Home
            </a>
            <a
              className="flex items-center gap-3 hover:text-blue-600"
              href="/influencerAnalytics"
            >
              <FiBarChart2 size={18} />
              Analytics
            </a>
            <a
              className="flex items-center gap-3 hover:text-blue-600"
              href="/appliedCampaigns"
            >
              <FiTrendingUp size={18} />
              Campaigns
            </a>
            <a
              className="flex items-center gap-3 hover:text-blue-600"
              href="/influencerProfile"
            >
              <FiUser size={18} />
              Profile
            </a>
            <a
              className="flex items-center gap-3 hover:text-blue-600"
              href="/InfluencerSponsorship"
            >
              <FiGift size={18} />
              Sponsorship
            </a>
            <a
              className="flex items-center gap-3 hover:text-blue-600"
              href="/Pricing"
            >
              <FiAward size={18} />
              Subscription
            </a>
          </nav>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("influencerToken");
            navigate("/influencerLogin");
          }}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
        >
          <FiLogOut size={18} />
          Logout
        </button>
      </aside>
      {/* Main */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome, {stats.name}!
        </h1>
        <div className="flex items-center gap-6 mb-6">
          <span
            className={`inline-block rounded-xl px-4 py-2 font-medium text-lg ${stats.subscription === "pro"
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
              }`}
          >
            Real Score: {stats.realScore} / 100
          </span>
          <button
            disabled={stats.subscription === "pro" || upgradeLoading}
            onClick={() => navigate("/Pricing")}  // Add this line for navigation
            className={`rounded px-3 py-1 text-xs font-medium ${stats.subscription === "pro"
                ? "bg-green-100 text-green-700 cursor-not-allowed"
                : "bg-yellow-100 text-yellow-900"
              }`}
          >
            {stats.subscription === "pro"
              ? "PRO Member"
              : upgradeLoading
                ? "Upgrading..."
                : "Upgrade to Pro"}
          </button>

          <button
            onClick={() => navigate("/InfluencerSponsorship")}
            className="ml-4 flex items-center gap-1 rounded bg-gradient-to-r from-pink-100 to-yellow-100 px-3 py-1 text-sm font-medium text-pink-800 shadow-sm"
          >
            <FiGift />
            Apply Sponsorship
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard label="Followers" value={stats.totalFollowers} />
          <StatCard label="Engagement Rate" value={stats.engagementRate} />
          <StatCard label="Revenue" value={stats.campaignRevenue} />
          <StatCard label="Pending Messages" value={stats.pendingMessages} />
        </div>

        {/* Recommended Campaigns with Apply */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">
            Recommended Campaigns
          </h2>
          {stats.recommendations.length === 0 ? (
            <p className="text-gray-500">No campaigns available right now.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.recommendations.map((camp) => (
                  <div
                    key={camp._id}
                    className="rounded border border-gray-300 bg-white p-5 shadow hover:shadow-lg"
                  >
                    <h3 className="mb-1 font-bold text-blue-700">{camp.name}</h3>
                    <p className="text-sm text-gray-500">{camp.brandName}</p>
                    <p className="text-sm text-gray-500 mb-3">{camp.category}</p>
                    <p className="text-xs text-gray-600 mb-2">
                      Deadline:{" "}
                      {camp.deadline
                        ? new Date(camp.deadline).toLocaleDateString()
                        : "N/A"}
                    </p>
                    <p className="mb-3 text-sm font-medium">
                      Budget: ₹{camp.budget.toLocaleString()}
                    </p>
                    <button
                      disabled={camp.isApplied || applyingId === camp._id}
                      onClick={() => camp.isApplied || handleApply(camp._id)}
                      className={`w-full rounded py-2 font-semibold text-white transition ${camp.isApplied || applyingId === camp._id
                        ? "cursor-not-allowed bg-gray-400"
                        : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                      {camp.isApplied
                        ? "Applied"
                        : applyingId === camp._id
                          ? "Applying..."
                          : "Apply"}
                    </button>
                  </div>
                ))}
              </div>
              {/* NEW: Show More button, only if we likely have more */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => navigate("/influencerAllCampaigns")}
                  className="px-6 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-600 hover:text-white transition"
                >
                  See All Campaigns
                </button>
              </div>


            </>
          )}
          {stats.subscription === "free" && (
            <p className="mt-3 text-xs text-yellow-700">
              Upgrade to PRO to see more campaigns.
            </p>
          )}
        </section>

        {/* Active Campaigns Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-700">
              Active Campaigns by Brand
            </h3>
            {stats.activeByBrand && Object.keys(stats.activeByBrand).length > 0 ? (
              <ul>
                {Object.entries(stats.activeByBrand).map(([brand, count]) => (
                  <li key={brand}>
                    {brand}: <strong>{count}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No active campaigns.</p>
            )}
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-700">
              Active Campaigns by Category
            </h3>
            {stats.activeByCategory && Object.keys(stats.activeByCategory).length > 0 ? (
              <ul>
                {Object.entries(stats.activeByCategory).map(([cat, count]) => (
                  <li key={cat}>
                    {cat}: <strong>{count}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No active campaigns.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <div className="rounded bg-white p-5 shadow transition hover:shadow-lg flex flex-col items-center gap-1">
    <div className="text-xs text-gray-500">{label}</div>
    <div className="text-xl font-semibold text-gray-800">{value}</div>
  </div>
);

export default Dashboard;
